/**
 * OrangeHRM client wrapper (TR4 / M_FR3 / M_FR5 / C_FR8).
 *
 * OrangeHRM instances differ between deployments. To keep this project portable,
 * this client is configured through env vars:
 *  - ORANGEHRM_BASE_URL
 *  - ORANGEHRM_API_TOKEN (optional Bearer token)
 *  - ORANGEHRM_EMPLOYEE_ENDPOINT (template)
 *  - ORANGEHRM_STORE_BONUS_ENDPOINT (template)
 *
 * If your tenant uses different endpoints/payloads, adapt:
 *  - `mapEmployeeResponseToSalesman`
 *  - `storeTotalBonus`
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

function mapEmployeeResponseToSalesman(employeeId, data) {
  const name =
    data?.name ||
    data?.fullName ||
    [data?.firstName, data?.lastName].filter(Boolean).join(' ') ||
    `Employee ${employeeId}`;

  const department =
    data?.department ||
    data?.unit ||
    data?.subunit ||
    data?.departmentName ||
    'Sales';

  const orangeHrmId = data?.id || data?.empNumber || data?.employeeNumber || null;

  return { employeeId, name, department, orangeHrmId };
}

class OrangeHRMService {
  /**
   * @param {{baseUrl?:string, http?:typeof axios, timeoutMs?:number, apiToken?:string}} [opts]
   */
  constructor(opts = {}) {
    this.baseUrl = opts.baseUrl || env.orangehrmBaseUrl;
    this.apiToken = opts.apiToken ?? env.orangehrmApiToken;
    this.http = opts.http || axios;
    this.timeoutMs = opts.timeoutMs || 5000;
  }

  buildHeaders() {
    const headers = {};
    if (this.apiToken) headers.Authorization = `Bearer ${this.apiToken}`;
    return headers;
  }

  async ping() {
    try {
      await this.http.get(this.baseUrl, {
        timeout: this.timeoutMs,
        headers: this.buildHeaders()
      });
      return true;
    } catch (_err) {
      return false;
    }
  }

  /**
   * M_FR5: Read salesman master data from OrangeHRM.
   */
  async fetchSalesmanMasterData(employeeId) {
    const path = fillTemplate(env.orangehrmEmployeeEndpoint, { employeeId });
    const url = `${this.baseUrl}${path}`;

    const res = await this.http.get(url, {
      timeout: this.timeoutMs,
      headers: this.buildHeaders()
    });

    return mapEmployeeResponseToSalesman(employeeId, res.data);
  }

  /**
   * M_FR3 / C_FR3: Store total bonus in OrangeHRM tenant.
   */
  async storeTotalBonus(employeeId, year, totalBonusEur) {
    const path = fillTemplate(env.orangehrmStoreBonusEndpoint, { employeeId });
    const url = `${this.baseUrl}${path}`;

    await this.http.post(
      url,
      { employeeId, year, totalBonusEur },
      { timeout: this.timeoutMs, headers: this.buildHeaders() }
    );

    return true;
  }

  /**
   * C_FR8: Store qualification in OrangeHRM (best-effort).
   *
   * Many OrangeHRM tenants do not expose such an endpoint. In that case keep the
   * qualification in Mongo and document it.
   */
  async storeQualification(employeeId, year, qualification) {
    const url = `${this.baseUrl}/api/v1/employees/${encodeURIComponent(employeeId)}/qualifications`;

    await this.http.post(
      url,
      { year, ...qualification },
      { timeout: this.timeoutMs, headers: this.buildHeaders() }
    );
    return true;
  }
}

module.exports = {
  OrangeHRMService,
  mapEmployeeResponseToSalesman
};
