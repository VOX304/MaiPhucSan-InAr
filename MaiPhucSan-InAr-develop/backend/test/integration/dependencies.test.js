const { expect } = require('chai');
const sinon = require('sinon');

const axios = require('axios');

const { OrangeHRMService } = require('../../src/services/orangehrm.service');
const { OpenCRXService } = require('../../src/services/opencrx.service');
const { MongoService } = require('../../src/services/mongo.service');

describe('Integration tests: depending services (stubbed)', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('OrangeHRM service reachability', () => {
    it('Service is online (reachable)', async () => {
      sinon.stub(axios, 'get').resolves({ status: 200 });
      const service = new OrangeHRMService({ baseUrl: 'http://orangehrm.local' });

      const ok = await service.ping();
      expect(ok).to.equal(true);
    });

    it('Service is offline (not reachable)', async () => {
      sinon.stub(axios, 'get').rejects(new Error('ENOTFOUND'));
      const service = new OrangeHRMService({ baseUrl: 'http://orangehrm.local' });

      const ok = await service.ping();
      expect(ok).to.equal(false);
    });
  });

  describe('OpenCRX service reachability', () => {
    it('Service is online (reachable)', async () => {
      sinon.stub(axios, 'get').resolves({ status: 200 });
      const service = new OpenCRXService({ baseUrl: 'http://opencrx.local' });

      const ok = await service.ping();
      expect(ok).to.equal(true);
    });

    it('Service is offline (not reachable)', async () => {
      sinon.stub(axios, 'get').rejects(new Error('ECONNREFUSED'));
      const service = new OpenCRXService({ baseUrl: 'http://opencrx.local' });

      const ok = await service.ping();
      expect(ok).to.equal(false);
    });
  });

  describe('MongoDB service reachability', () => {
    it('Service is online (reachable)', async () => {
      const command = sinon.stub().resolves({ ok: 1 });
      const db = sinon.stub().returns({ command });
      const connect = sinon.stub().resolves();
      const close = sinon.stub().resolves();

      const fakeClient = { connect, db, close };

      const service = new MongoService({ client: fakeClient, dbName: 'iar' });
      const ok = await service.ping();

      expect(ok).to.equal(true);
      sinon.assert.calledOnce(connect);
      sinon.assert.calledOnce(db);
      sinon.assert.calledOnce(command);
      sinon.assert.calledOnce(close);
    });

    it('Service is offline (not reachable)', async () => {
      const connect = sinon.stub().rejects(new Error('Mongo down'));
      const close = sinon.stub().resolves();
      const db = sinon.stub();

      const fakeClient = { connect, db, close };
      const service = new MongoService({ client: fakeClient, dbName: 'iar' });

      const ok = await service.ping();
      expect(ok).to.equal(false);
      sinon.assert.calledOnce(connect);
      // Even if connect fails, we try to close gracefully.
      sinon.assert.calledOnce(close);
    });
  });
});
