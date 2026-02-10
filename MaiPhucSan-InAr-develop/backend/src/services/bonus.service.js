/**
 * Bonus computation service (TR10).
 *
 * Requirements:
 *  - computation must be automatic (no manual totals)
 *  - per-record bonus and total bonus must be available
 *  - transparent and explainable formula
 *
 * Implemented:
 *  - Social performance record bonus (MVP_FR2)
 *  - Sales order evaluation bonus (C_FR1..C_FR4)
 *  - Total bonus (M_FR1) + combined total (C_FR3)
 */
const env = require('../config/env');

const cacheService = require('./cache.service');
const CACHE_TTL_SECONDS = Number(process.env.BONUS_CACHE_TTL_SECONDS || 60);

function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function clamp(min, value, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Normalize weights so that they sum to 1.
 * If all weights are 0, distribute equally.
 * @param {Array<{weight:number}>} records
 */
function normalizeWeights(records) {
  const rawWeights = records.map((r) => Number(r.weight || 0));
  const sum = rawWeights.reduce((a, b) => a + b, 0);

  if (sum <= 0) {
    const equal = records.length ? 1 / records.length : 0;
    return records.map((r) => ({ ...r, weight: equal }));
  }

  return records.map((r) => ({ ...r, weight: Number(r.weight || 0) / sum }));
}

/**
 * Compute bonus for a single social performance record.
 * @param {object} record
 * @returns {{computedBonusEur:number, breakdown:object}}
 */
function computeSocialRecordBonus(record) {
  const socialPool = env.socialBonusPoolEur;

  const target = Number(record.targetValue || 0);
  const actual = Number(record.actualValue || 0);

  // achievement: 0..1 (cap; avoids runaway bonuses)
  const achievement = target > 0 ? clamp(0, actual / target, 1) : 1;

  const supervisorRating = clamp(1, Number(record.supervisorRating || 5), 5);
  const peerRating = clamp(1, Number(record.peerRating || 5), 5);

  // ratingFactor: 0..1
  const ratingFactor = clamp(
    0,
    (0.6 * supervisorRating + 0.4 * peerRating) / 5,
    1
  );

  const factor = clamp(0, achievement * ratingFactor, 1);

  const maxBonusForCriterion = Number(record.weight || 0) * socialPool;
  const computedBonusEur = round2(maxBonusForCriterion * factor);

  return {
    computedBonusEur,
    breakdown: {
      socialPoolEur: socialPool,
      weight: round2(Number(record.weight || 0)),
      maxBonusForCriterion: round2(maxBonusForCriterion),
      targetValue: target,
      actualValue: actual,
      achievement: round2(achievement),
      supervisorRating,
      peerRating,
      ratingFactor: round2(ratingFactor),
      factor: round2(factor)
    }
  };
}

/**
 * Compute bonus for a single order evaluation record.
 * @param {object} order
 * @returns {{computedBonusEur:number, breakdown:object}}
 */
function computeOrderRecordBonus(order) {
  const ordersPool = env.ordersBonusPoolEur;

  const closingProbability = clamp(0, Number(order.closingProbability || 0), 1);
  const clientRanking = clamp(1, Number(order.clientRanking || 3), 5);

  // rankingFactor: 1 -> 1.0, 5 -> 0.2
  const rankingFactor = round2(clamp(0.2, (6 - clientRanking) / 5, 1));

  const itemsCount = clamp(0, Number(order.itemsCount || 0), 100000);
  const revenueEur = clamp(0, Number(order.revenueEur || 0), 1e12);

  const itemsFactor = clamp(0, itemsCount / 10, 1);
  const revenueFactor = clamp(0, revenueEur / 10000, 1);

  const factor = round2(
    clamp(
      0,
      (closingProbability + rankingFactor + itemsFactor + revenueFactor) / 4,
      1
    )
  );

  const maxPerOrder = ordersPool * 0.2;
  const computedBonusEur = round2(maxPerOrder * factor);

  return {
    computedBonusEur,
    breakdown: {
      ordersPoolEur: ordersPool,
      maxPerOrder: round2(maxPerOrder),
      closingProbability: round2(closingProbability),
      clientRanking,
      rankingFactor,
      itemsCount,
      itemsFactor: round2(itemsFactor),
      revenueEur: round2(revenueEur),
      revenueFactor: round2(revenueFactor),
      factor
    }
  };
}

function computeSocialTotal(records) {
  const normalized = normalizeWeights(records);
  const computed = normalized.map((r) => {
    const { computedBonusEur, breakdown } = computeSocialRecordBonus(r);
    return { ...r, computedBonusEur, breakdown };
  });

  const total = round2(computed.reduce((s, r) => s + Number(r.computedBonusEur || 0), 0));
  const capped = round2(clamp(0, total, env.socialBonusPoolEur));
  return { total: capped, records: computed };
}

function computeOrdersTotal(orders) {
  const computed = orders.map((o) => {
    const { computedBonusEur, breakdown } = computeOrderRecordBonus(o);
    return { ...o, computedBonusEur, breakdown };
  });

  const total = round2(computed.reduce((s, o) => s + Number(o.computedBonusEur || 0), 0));
  const capped = round2(clamp(0, total, env.ordersBonusPoolEur));
  return { total: capped, orders: computed };
}

/**
 * Compute final bonus summary.
 * @param {Array<object>} socialRecords
 * @param {Array<object>} orderRecords
 */
// Synchronous compute without cache (keeps compatibility)
function computeTotals(socialRecords, orderRecords) {
  const social = computeSocialTotal(socialRecords || []);
  const orders = computeOrdersTotal(orderRecords || []);
  const totalBonusEur = round2(social.total + orders.total);

  return {
    socialTotalEur: social.total,
    ordersTotalEur: orders.total,
    totalBonusEur,
    socialRecords: social.records,
    orderRecords: orders.orders,
    config: {
      socialBonusPoolEur: env.socialBonusPoolEur,
      ordersBonusPoolEur: env.ordersBonusPoolEur
    }
  };
}

// Async compute that uses cacheService (Redis or memory)
async function computeTotalsAsync(socialRecords, orderRecords) {
  const key = JSON.stringify({ s: socialRecords || [], o: orderRecords || [] });
  try {
    const cached = await cacheService.get(key);
    if (cached) return cached;
  } catch (e) {
    // ignore cache errors
  }

  const result = computeTotals(socialRecords, orderRecords);
  try {
    await cacheService.set(key, result, CACHE_TTL_SECONDS);
  } catch (e) {
    // ignore cache set failures
  }
  return result;
}

module.exports = {
  computeTotals,
  computeTotalsAsync,
  computeSocialRecordBonus,
  computeOrderRecordBonus,
  computeSocialTotal,
  computeOrdersTotal
};
