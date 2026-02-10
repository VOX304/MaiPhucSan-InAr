const { computeTotals } = require('../src/services/bonus.service');
const { computeTotalsAsync } = require('../src/services/bonus.service');

function makeSample(nSocial = 50, nOrders = 50) {
  const social = [];
  for (let i = 0; i < nSocial; i++) {
    social.push({
      criterionKey: `c${i}`,
      weight: Math.random(),
      targetValue: 10,
      actualValue: Math.floor(Math.random() * 11),
      supervisorRating: 3 + Math.floor(Math.random() * 3),
      peerRating: 3 + Math.floor(Math.random() * 3)
    });
  }

  const orders = [];
  for (let i = 0; i < nOrders; i++) {
    orders.push({
      orderId: `O${i}`,
      closingProbability: Math.random(),
      clientRanking: 1 + Math.floor(Math.random() * 5),
      itemsCount: Math.floor(Math.random() * 20),
      revenueEur: Math.floor(Math.random() * 20000)
    });
  }

  return { social, orders };
}

async function bench() {
  const sample = makeSample(100, 100);

  console.log('Warm-up sync compute');
  for (let i = 0; i < 3; i++) computeTotals(sample.social, sample.orders);

  console.time('sync-first');
  for (let i = 0; i < 50; i++) computeTotals(sample.social, sample.orders);
  console.timeEnd('sync-first');

  console.log('\nWarm-up async compute');
  for (let i = 0; i < 3; i++) await computeTotalsAsync(sample.social, sample.orders);

  console.time('async-first');
  for (let i = 0; i < 50; i++) await computeTotalsAsync(sample.social, sample.orders);
  console.timeEnd('async-first');

  // Clear cache by toggling TTL (only memory cache used here unless Redis configured)
  console.log('\nDone');
}

bench().catch((e) => console.error(e));
