/**
 * Camunda integration (TR9 / N_FR2).
 *
 * Minimal Camunda Platform 7 REST integration:
 *  - start process instance
 *  - list tasks
 *  - complete tasks
 *
 * If Camunda is not running locally, workflow endpoints will return errors.
 */
const axios = require('axios');
const env = require('../config/env');

class CamundaService {
  /**
   * @param {{baseUrl?:string, http?:typeof axios, timeoutMs?:number}} [opts]
   */
  constructor(opts = {}) {
    this.baseUrl = opts.baseUrl || env.camundaBaseUrl;
    this.http = opts.http || axios;
    this.timeoutMs = opts.timeoutMs || 7000;
  }

  async ping() {
    try {
      await this.http.get(`${this.baseUrl}/engine`, { timeout: this.timeoutMs });
      return true;
    } catch (_err) {
      return false;
    }
  }

  async startProcess(processDefinitionKey, variables = {}) {
    const url = `${this.baseUrl}/process-definition/key/${encodeURIComponent(
      processDefinitionKey
    )}/start`;

    const camundaVars = {};
    Object.entries(variables).forEach(([k, v]) => {
      camundaVars[k] = { value: v };
    });

    const res = await this.http.post(
      url,
      { variables: camundaVars },
      { timeout: this.timeoutMs }
    );
    return res.data;
  }

  async listTasks(processInstanceId) {
    const url = `${this.baseUrl}/task`;
    const res = await this.http.get(url, {
      timeout: this.timeoutMs,
      params: { processInstanceId }
    });
    return res.data;
  }

  async completeTask(taskId, variables = {}) {
    const url = `${this.baseUrl}/task/${encodeURIComponent(taskId)}/complete`;

    const camundaVars = {};
    Object.entries(variables).forEach(([k, v]) => {
      camundaVars[k] = { value: v };
    });

    await this.http.post(url, { variables: camundaVars }, { timeout: this.timeoutMs });
    return true;
  }
}

module.exports = {
  CamundaService
};
