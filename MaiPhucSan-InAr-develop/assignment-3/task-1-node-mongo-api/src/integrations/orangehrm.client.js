// src/integrations/orangehrm.client.js
const axios = require("axios");

const BASE_URL = process.env.ORANGEHRM_BASE;
const CLIENT_ID = process.env.ORANGEHRM_CLIENT_ID;
const CLIENT_SECRET = process.env.ORANGEHRM_CLIENT_SECRET;
const USERNAME = process.env.ORANGEHRM_USERNAME;
const PASSWORD = process.env.ORANGEHRM_PASSWORD;

let cachedToken = null;
let tokenExpiresAt = 0;

async function getToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 60_000) return cachedToken;

  const form = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "password",
    username: USERNAME,
    password: PASSWORD,
  });

  const res = await axios.post(`${BASE_URL}/oauth/issueToken`, form.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  cachedToken = res.data.access_token;
  tokenExpiresAt = now + res.data.expires_in * 1000;
  return cachedToken;
}

async function getHttpClient() {
  const token = await getToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function getEmployees() {
  const client = await getHttpClient();
  const res = await client.get("/api/v1/employee/search");
  return res.data.data || res.data;
}

async function getEmployeeById(id) {
  const client = await getHttpClient();
  const res = await client.get(`/api/v1/employee/${id}`);
  return res.data;
}

module.exports = { getEmployees, getEmployeeById };
