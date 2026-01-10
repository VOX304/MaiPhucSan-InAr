/**
 * Seed script for local demo data.
 *
 * TR2: provide sufficient test data for social performance records.
 *
 * Usage:
 *   cd backend
 *   npm run seed
 */
const { connectMongo, disconnectMongo } = require('./db/mongoose');
const { User } = require('./models/user.model');
const { Salesman } = require('./models/salesman.model');
const { SocialPerformanceRecord } = require('./models/social-performance.model');
const { OrderEvaluationRecord } = require('./models/order-evaluation.model');
const { computeSocialRecordBonus, computeOrderRecordBonus } = require('./services/bonus.service');

async function upsertUser({ username, password, role, employeeId }) {
  const existing = await User.findOne({ username }).exec();
  if (existing) return existing;

  const passwordHash = await User.hashPassword(password);
  return User.create({ username, passwordHash, role, employeeId: employeeId || null });
}

async function run() {
  const year = new Date().getFullYear();

  await connectMongo();

  // Users (N_FR1)
  await upsertUser({ username: 'ceo', password: 'ceo123', role: 'CEO' });
  await upsertUser({ username: 'hr', password: 'hr123', role: 'HR' });
  await upsertUser({ username: 'sales1', password: 'sales123', role: 'SALESMAN', employeeId: 'E1001' });

  // Salesmen (MVP_FR1)
  await Salesman.findOneAndUpdate(
    { employeeId: 'E1001' },
    { $set: { employeeId: 'E1001', name: 'Alex Miller', department: 'Sales', performanceYear: year } },
    { upsert: true }
  );
  await Salesman.findOneAndUpdate(
    { employeeId: 'E1002' },
    { $set: { employeeId: 'E1002', name: 'Taylor Nguyen', department: 'Sales', performanceYear: year } },
    { upsert: true }
  );

  // Social performance records (MVP_FR2) for E1001
  const criteria = [
    { criterionKey: 'teamwork', criterionName: 'Teamwork', weight: 0.25, targetValue: 10, actualValue: 9, supervisorRating: 4, peerRating: 5 },
    { criterionKey: 'communication', criterionName: 'Communication', weight: 0.25, targetValue: 10, actualValue: 10, supervisorRating: 5, peerRating: 4 },
    { criterionKey: 'reliability', criterionName: 'Reliability', weight: 0.25, targetValue: 10, actualValue: 8, supervisorRating: 4, peerRating: 4 },
    { criterionKey: 'leadership', criterionName: 'Leadership', weight: 0.25, targetValue: 10, actualValue: 7, supervisorRating: 3, peerRating: 4 }
  ];

  for (const c of criteria) {
    const { computedBonusEur } = computeSocialRecordBonus({ ...c, year, salesmanEmployeeId: 'E1001' });
    await SocialPerformanceRecord.findOneAndUpdate(
      { salesmanEmployeeId: 'E1001', year, criterionKey: c.criterionKey },
      { $set: { salesmanEmployeeId: 'E1001', year, ...c, computedBonusEur, createdBy: 'seed' } },
      { upsert: true }
    );
  }

  // Orders records (COULD) for E1001 (manual demo data)
  const orders = [
    { orderId: 'SO-001', productName: 'Laptop', clientName: 'Acme GmbH', clientRanking: 2, closingProbability: 0.8, itemsCount: 3, revenueEur: 4500 },
    { orderId: 'SO-002', productName: 'Printer', clientName: 'Beta AG', clientRanking: 4, closingProbability: 0.6, itemsCount: 8, revenueEur: 1200 },
    { orderId: 'SO-003', productName: 'Server', clientName: 'Gamma SE', clientRanking: 1, closingProbability: 0.4, itemsCount: 1, revenueEur: 15000 }
  ];

  for (const o of orders) {
    const { computedBonusEur } = computeOrderRecordBonus({ ...o, year, salesmanEmployeeId: 'E1001' });
    await OrderEvaluationRecord.findOneAndUpdate(
      { salesmanEmployeeId: 'E1001', year, orderId: o.orderId },
      { $set: { salesmanEmployeeId: 'E1001', year, ...o, computedBonusEur } },
      { upsert: true }
    );
  }

  // eslint-disable-next-line no-console
  console.log('Seed completed.');
}

run()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectMongo();
    process.exit(0);
  });
