// src/integrations/opencrx.client.js
const axios = require("axios");

const BASE_URL = process.env.OPENCRX_BASE;
const USERNAME = process.env.OPENCRX_USERNAME;
const PASSWORD = process.env.OPENCRX_PASSWORD;

const http = axios.create({
  baseURL: BASE_URL,
  auth: { username: USERNAME, password: PASSWORD },
  headers: { Accept: "application/json" },
});

async function listAccounts() {
  const res = await http.get(
    "/org.opencrx.kernel.account1/provider/CRX/segment/Standard/account"
  );
  return res.data.objects || res.data;
}

async function getAccount(uid) {
  const res = await http.get(
    `/org.opencrx.kernel.account1/provider/CRX/segment/Standard/account/${uid}`
  );
  return res.data;
}

module.exports = { listAccounts, getAccount };
