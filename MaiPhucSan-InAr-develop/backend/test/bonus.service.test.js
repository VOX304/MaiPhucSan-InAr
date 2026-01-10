const { expect } = require('chai');
const { computeTotals } = require('../src/services/bonus.service');

describe('Bonus computation (TR10)', () => {
  it('computes per-record and totals deterministically', () => {
    const social = [
      { weight: 0.5, targetValue: 10, actualValue: 10, supervisorRating: 5, peerRating: 5 },
      { weight: 0.5, targetValue: 10, actualValue: 5, supervisorRating: 5, peerRating: 5 }
    ];

    const orders = [
      { orderId: 'A', clientRanking: 1, closingProbability: 1, itemsCount: 10, revenueEur: 10000 },
      { orderId: 'B', clientRanking: 5, closingProbability: 0, itemsCount: 0, revenueEur: 0 }
    ];

    const totals = computeTotals(social, orders);

    expect(totals.socialTotalEur).to.be.a('number');
    expect(totals.ordersTotalEur).to.be.a('number');
    expect(totals.totalBonusEur).to.equal(totals.socialTotalEur + totals.ordersTotalEur);

    // basic sanity: totals not negative
    expect(totals.totalBonusEur).to.be.greaterThan(0);
  });

  it('caps totals by configured pools', () => {
    const social = [];
    for (let i = 0; i < 50; i++) {
      social.push({ weight: 1, targetValue: 1, actualValue: 1, supervisorRating: 5, peerRating: 5 });
    }
    const orders = [];
    for (let i = 0; i < 50; i++) {
      orders.push({ orderId: String(i), clientRanking: 1, closingProbability: 1, itemsCount: 10, revenueEur: 10000 });
    }

    const totals = computeTotals(social, orders);

    expect(totals.socialTotalEur).to.be.at.most(totals.config.socialBonusPoolEur);
    expect(totals.ordersTotalEur).to.be.at.most(totals.config.ordersBonusPoolEur);
  });
});
