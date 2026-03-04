/**
 * Seed script for local demo data.
 *
 * TR2: provide sufficient test data for social performance records.
 *
 * Aligned with Postman test suite:
 *   - employeeId: E001 (matches {{employeeId}} collection variable)
 *   - years: 2025 (main test year) + current year as fallback
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

async function seedSocialRecords(employeeId, year) {
  const criteria = [
    { criterionKey: 'leadership',    criterionName: 'Leadership',    weight: 0.25, targetValue: 5, actualValue: 4, supervisorRating: 4, peerRating: 4 },
    { criterionKey: 'teamwork',      criterionName: 'Teamwork',      weight: 0.25, targetValue: 5, actualValue: 5, supervisorRating: 5, peerRating: 5 },
    { criterionKey: 'communication', criterionName: 'Communication', weight: 0.25, targetValue: 4, actualValue: 3, supervisorRating: 4, peerRating: 3 },
    { criterionKey: 'problem_solving',criterionName: 'Problem Solving',weight: 0.25, targetValue: 4, actualValue: 4, supervisorRating: 4, peerRating: 5 }
  ];

  for (const c of criteria) {
    const { computedBonusEur } = computeSocialRecordBonus({ ...c, year, salesmanEmployeeId: employeeId });
    await SocialPerformanceRecord.findOneAndUpdate(
      { salesmanEmployeeId: employeeId, year, criterionKey: c.criterionKey },
      { $set: { salesmanEmployeeId: employeeId, year, ...c, computedBonusEur, createdBy: 'seed' } },
      { upsert: true }
    );
  }
}

async function seedOrderRecords(employeeId, year) {
  const orders = [
    { orderId: `order-${year}-1`, productName: 'Product A', clientName: 'ACME Corp',  clientRanking: 1, closingProbability: 0.85, itemsCount: 100, revenueEur: 8000 },
    { orderId: `order-${year}-2`, productName: 'Product B', clientName: 'Beta GmbH',  clientRanking: 2, closingProbability: 0.60, itemsCount: 50,  revenueEur: 3500 },
    { orderId: `order-${year}-3`, productName: 'Product C', clientName: 'Gamma AG',   clientRanking: 3, closingProbability: 0.45, itemsCount: 20,  revenueEur: 1200 }
  ];

  for (const o of orders) {
    const { computedBonusEur } = computeOrderRecordBonus({ ...o, year, salesmanEmployeeId: employeeId });
    await OrderEvaluationRecord.findOneAndUpdate(
      { salesmanEmployeeId: employeeId, year, orderId: o.orderId },
      { $set: { salesmanEmployeeId: employeeId, year, ...o, computedBonusEur } },
      { upsert: true }
    );
  }
}

async function run() {
  const currentYear = new Date().getFullYear();
  const testYear = 2025; // matches Postman ?year=2025

  await connectMongo();

  // ── Users (N_FR1) ──────────────────────────────────────────────────────────
  await upsertUser({ username: 'ceo',    password: 'ceo123',   role: 'CEO' });
  await upsertUser({ username: 'hr',     password: 'hr123',    role: 'HR' });
  await upsertUser({ username: 'sales1', password: 'sales123', role: 'SALESMAN', employeeId: 'E001' });

  // ── Salesmen (MVP_FR1) ─────────────────────────────────────────────────────
  // E001 matches Postman {{employeeId}} variable (set by 1-5 Create Salesman)
  await Salesman.findOneAndUpdate(
    { employeeId: 'E001' },
    { $set: { employeeId: 'E001', name: 'Max Mustermann', department: 'Sales', performanceYear: testYear } },
    { upsert: true }
  );
  await Salesman.findOneAndUpdate(
    { employeeId: 'E002' },
    { $set: { employeeId: 'E002', name: 'Taylor Nguyen', department: 'Sales', performanceYear: testYear } },
    { upsert: true }
  );
  // EMP001 seeded so ERR-5 duplicate test returns 409
  await Salesman.findOneAndUpdate(
    { employeeId: 'EMP001' },
    { $set: { employeeId: 'EMP001', name: 'Duplicate Test', department: 'Sales', performanceYear: testYear } },
    { upsert: true }
  );

  // ── Social performance records (MVP_FR2) ───────────────────────────────────
  // Seed for both testYear (2025) and currentYear so GET/compute always finds data
  await seedSocialRecords('E001', testYear);
  if (currentYear !== testYear) {
    await seedSocialRecords('E001', currentYear);
  }

  // ── Order evaluation records (C_FR1) ──────────────────────────────────────
  await seedOrderRecords('E001', testYear);
  if (currentYear !== testYear) {
    await seedOrderRecords('E001', currentYear);
  }

  // eslint-disable-next-line no-console
  console.log(`Seed completed. Data seeded for E001, years: ${testYear}${currentYear !== testYear ? `, ${currentYear}` : ''}`);
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
