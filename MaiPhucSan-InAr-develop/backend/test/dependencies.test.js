const { expect } = require('chai');
const sinon = require('sinon');

const { OrangeHRMService } = require('../src/services/orangehrm.service');
const { OpenCRXService } = require('../src/services/opencrx.service');
const { MongoService } = require('../src/services/mongo.service');
const { CamundaService } = require('../src/services/camunda.service');

describe('Integration Tests - Dependency Reachability', () => {
  describe('OrangeHRMService', () => {
    it('Service is online (reachable)', async () => {
      const http = { get: sinon.stub().resolves({ status: 200 }) };
      const svc = new OrangeHRMService({ baseUrl: 'http://orange', http, timeoutMs: 10 });

      const ok = await svc.ping();
      expect(ok).to.equal(true);
      expect(http.get.calledOnce).to.equal(true);
    });

    it('Service is offline (not reachable)', async () => {
      const http = { get: sinon.stub().rejects(new Error('ECONNREFUSED')) };
      const svc = new OrangeHRMService({ baseUrl: 'http://orange', http, timeoutMs: 10 });

      const ok = await svc.ping();
      expect(ok).to.equal(false);
    });
  });

  describe('OpenCRXService', () => {
    it('Service is online (reachable)', async () => {
      const http = { get: sinon.stub().resolves({ status: 200, data: [] }) };
      const svc = new OpenCRXService({ baseUrl: 'http://opencrx', http, timeoutMs: 10 });

      const ok = await svc.ping();
      expect(ok).to.equal(true);
    });

    it('Service is offline (not reachable)', async () => {
      const http = { get: sinon.stub().rejects(new Error('ETIMEDOUT')) };
      const svc = new OpenCRXService({ baseUrl: 'http://opencrx', http, timeoutMs: 10 });

      const ok = await svc.ping();
      expect(ok).to.equal(false);
    });
  });

  describe('MongoService', () => {
    it('Service is online (reachable)', async () => {
      const client = {
        connect: sinon.stub().resolves(),
        db: sinon.stub().returns({ command: sinon.stub().resolves({ ok: 1 }) }),
        close: sinon.stub().resolves()
      };

      const svc = new MongoService({ uri: 'mongodb://example', dbName: 'iar', client });

      const ok = await svc.ping();
      expect(ok).to.equal(true);
      expect(client.connect.calledOnce).to.equal(true);
      expect(client.close.calledOnce).to.equal(true);
    });

    it('Service is offline (not reachable)', async () => {
      const client = {
        connect: sinon.stub().rejects(new Error('ECONNREFUSED')),
        db: sinon.stub(),
        close: sinon.stub().resolves()
      };

      const svc = new MongoService({ uri: 'mongodb://example', dbName: 'iar', client });

      const ok = await svc.ping();
      expect(ok).to.equal(false);
      expect(client.close.calledOnce).to.equal(true);
    });
  });

  describe('CamundaService', () => {
    it('Service is online (reachable)', async () => {
      const http = { get: sinon.stub().resolves({ status: 200, data: {} }) };
      const svc = new CamundaService({ baseUrl: 'http://camunda', http, timeoutMs: 10 });

      const ok = await svc.ping();
      expect(ok).to.equal(true);
    });

    it('Service is offline (not reachable)', async () => {
      const http = { get: sinon.stub().rejects(new Error('ECONNREFUSED')) };
      const svc = new CamundaService({ baseUrl: 'http://camunda', http, timeoutMs: 10 });

      const ok = await svc.ping();
      expect(ok).to.equal(false);
    });
  });
});
