/**
 * Odoo integration (TR5 / N_FR6).
 *
 * Odoo exposes a JSON-RPC API at `/jsonrpc`.
 * This service is implemented as best-effort (can be disabled by leaving env vars empty).
 */
const axios = require('axios');
const env = require('../config/env');

class OdooService {
  /**
   * @param {{baseUrl?:string, http?:typeof axios, timeoutMs?:number}} [opts]
   */
  constructor(opts = {}) {
    this.baseUrl = opts.baseUrl || env.odooBaseUrl;
    this.http = opts.http || axios;
    this.timeoutMs = opts.timeoutMs || 8000;
  }

  async authenticate() {
    if (!env.odooDb || !env.odooUsername || !env.odooPassword) {
      const err = new Error('Odoo credentials not configured');
      err.status = 412;
      throw err;
    }

    const url = `${this.baseUrl}/jsonrpc`;
    const payload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'common',
        method: 'authenticate',
        args: [env.odooDb, env.odooUsername, env.odooPassword, {}]
      },
      id: Date.now()
    };

    const res = await this.http.post(url, payload, { timeout: this.timeoutMs });
    return res.data.result;
  }

  /**
   * Fetch employees from model `hr.employee`.
   */
  async fetchEmployees(limit = 20) {
    const uid = await this.authenticate();
    const url = `${this.baseUrl}/jsonrpc`;

    const payload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          env.odooDb,
          uid,
          env.odooPassword,
          'hr.employee',
          'search_read',
          [[]],
          { fields: ['name', 'work_email', 'company_id'], limit }
        ]
      },
      id: Date.now()
    };

    const res = await this.http.post(url, payload, { timeout: this.timeoutMs });
    const items = res.data.result || [];
    return items.map((x) => ({
      name: x.name,
      email: x.work_email,
      company: Array.isArray(x.company_id) ? x.company_id[1] : x.company_id
    }));
  }
}

module.exports = {
  OdooService
};
