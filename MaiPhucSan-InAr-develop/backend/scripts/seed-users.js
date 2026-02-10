const mongoose = require("mongoose");
const env = require("../src/config/env");
const { User } = require("../src/models/user.model");

async function upsertUser({ username, password, role, employeeId = null }) {
  const existing = await User.findOne({ username }).exec();
  if (existing) {
    console.log(`✅ User exists: ${username} (${existing.role})`);
    return;
  }

  const passwordHash = await User.hashPassword(password);
  await User.create({ username, passwordHash, role, employeeId });

  console.log(`🟢 Created user: ${username} (${role})`);
}

(async () => {
  await mongoose.connect(env.mongoUri, { dbName: env.mongoDbName });
  console.log(`Connected to DB: ${env.mongoDbName}`);

  // Create minimal accounts needed for the process
  await upsertUser({ username: "ceo", password: "Ceo123!", role: "CEO" });
  await upsertUser({ username: "hr", password: "Hr123!", role: "HR" });

  // Optional: salesman login (tie to an existing salesman employeeId if you have one)
  // Example: await upsertUser({ username: "sales1", password: "Sales123!", role: "SALESMAN", employeeId: "E001" });

  await mongoose.disconnect();
  console.log("Done.");
  process.exit(0);
})().catch(async (e) => {
  console.error(e);
  try { await mongoose.disconnect(); } catch (err) { console.warn("seed failed:", err.message);}
  process.exit(1);
});
