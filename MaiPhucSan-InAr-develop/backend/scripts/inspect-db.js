const mongoose = require("mongoose");
const { connectMongo, disconnectMongo } = require("../src/db/mongoose");
const { User } = require("../src/models/user.model");

(async () => {
  await connectMongo();

  const db = mongoose.connection.db;
  console.log("Connected DB:", db.databaseName);

  const cols = await db.listCollections().toArray();
  console.log("Collections:", cols.map(c => c.name));

  const users = await User.find({}, { username: 1, role: 1, employeeId: 1 })
    .limit(10)
    .lean();

  console.log("Users (up to 10):", users);

  await disconnectMongo();
  process.exit(0);
})().catch(async (e) => {
  console.error(e);
  try { await disconnectMongo(); } catch (err) { console.warn("disconnectMongo failed:", err.message); }
  process.exit(1);
});
