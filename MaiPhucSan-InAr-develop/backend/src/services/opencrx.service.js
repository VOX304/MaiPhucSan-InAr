/**
 * OpenCRX client wrapper (TR4 / C_FR1..C_FR4).
 *
 * OpenCRX commonly uses HTTP basic auth and exposes REST resources.
 * Since exact endpoints vary between deployments, this client is configurable
 * via env vars.
 */
const axios = require('axios');
const env = require('../config/env');

function fillTemplate(template, params) {
  let result = template;
  Object.entries(params).forEach(([k, v]) => {
    result = result.replace(`{${k}}`, encodeURIComponent(String(v)));
  });
  return result;
}

class OpenCRXService {
  /**
   * @param {{baseUrl?:string, http?:typeof axios, timeoutMs?:number, username?:string, password?:string}} [opts]
   */
  constructor(opts = {}) {
    this.baseUrl = opts.baseUrl || env.opencrxBaseUrl;
    this.username = opts.username ?? env.opencrxUsername;
    this.password = opts.password ?? env.opencrxPassword;
    this.http = opts.http || axios;
    this.timeoutMs = opts.timeoutMs || 7000;
  }

  buildAuth() {
    if (!this.username || !this.password) return undefined;
    return { username: this.username, password: this.password };
  }

  async ping() {
    try {
      await this.http.get(this.baseUrl, {
        timeout: this.timeoutMs,
        auth: this.buildAuth()
      });
      return true;
    } catch (_err) {
      return false;
    }
  }

  /**
   * Fetch orders for a given salesman from OpenCRX.
   */
  async fetchOrders(employeeId, year) {
    const path = fillTemplate(env.opencrxOrdersEndpoint, { employeeId, year });
    const url = `${this.baseUrl}${path}`;

    const res = await this.http.get(url, {
      timeout: this.timeoutMs,
      auth: this.buildAuth()
    });

    const items = Array.isArray(res.data) ? res.data : res.data?.items || [];

    return items.map((x) => ({
      orderId: String(x.orderId || x.id || x.salesOrderId || ''),
      productName: String(x.productName || x.product || x.product?.name || ''),
      clientName: String(x.clientName || x.customer || x.accountName || ''),
      clientRanking: Number(x.clientRanking || x.ranking || 3),
      closingProbability: Number(x.closingProbability || x.probability || 0.5),
      itemsCount: Number(x.itemsCount || x.items || x.quantity || 1),
      revenueEur: Number(x.revenueEur || x.amount || x.total || 0),
      raw: x
    }));
  }
}

module.exports = {
  OpenCRXService
};
