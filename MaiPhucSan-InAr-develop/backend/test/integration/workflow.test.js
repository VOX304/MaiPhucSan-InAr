const { expect } = require('chai');
const request = require('supertest');
const app = require('../../src/app');
const logger = require('../../src/config/logger');

/**
 * TR8: Integration Tests
 * Tests complete workflows and error handling
 */

const runIntegration = process.env.RUN_INTEGRATION === 'true';
const describeIf = runIntegration ? describe : describe.skip;

describeIf('Complete Bonus Workflow (E2E)', () => {
  let authToken;
  const testUser = { username: 'ceo', password: 'Ceo123!' };

  before(async () => {
    logger.info('Starting integration tests');
  });

  describe('Authentication', () => {
    it('should successfully login with valid credentials', (done) => {
      request(app)
        .post('/api/v1/auth/login')
        .send(testUser)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          authToken = res.body.token;
          logger.info('Login successful');
          done(err);
        });
    });

    it('should reject invalid credentials', (done) => {
      request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'invalid', password: 'wrong' })
        .end((err, res) => {
          expect(res).to.have.status(401);
          logger.info('Invalid login rejected correctly');
          done(err);
        });
    });

    it('should reject requests without token', (done) => {
      request(app)
        .get('/api/v1/salesmen')
        .end((err, res) => {
          expect(res).to.have.status(401);
          logger.info('Unauthorized request rejected');
          done(err);
        });
    });
  });

  describe('Salesman Management', () => {
    it('should fetch salesmen list with valid token', (done) => {
      request(app)
        .get('/api/v1/salesmen')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          logger.info('Salesmen list fetched', { count: res.body.length });
          done(err);
        });
    });

    it('should fetch single salesman details', (done) => {
      request(app)
        .get('/api/v1/salesmen/E1001')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('employeeId');
          logger.info('Salesman details fetched', { employeeId: res.body.employeeId });
          done(err);
        });
    });

    it('should handle non-existent salesman gracefully', (done) => {
      request(app)
        .get('/api/v1/salesmen/INVALID')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).to.be.oneOf([404, 400]);
          logger.info('Invalid salesman request handled');
          done(err);
        });
    });
  });

  describe('Bonus Calculation', () => {
    it('should compute bonus for valid employee', (done) => {
      request(app)
        .post('/api/v1/bonus/compute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ employeeId: 'E1001', year: 2024 })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('total');
          expect(res.body.total).to.be.a('number');
          logger.info('Bonus computed', { employeeId: 'E1001', bonus: res.body.total });
          done(err);
        });
    });

    it('should return error for missing parameters', (done) => {
      request(app)
        .post('/api/v1/bonus/compute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .end((err, res) => {
          expect(res.status).to.be.oneOf([400, 422]);
          logger.info('Missing parameters rejected');
          done(err);
        });
    });

    it('should handle database errors gracefully', (done) => {
      request(app)
        .post('/api/v1/bonus/compute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ employeeId: '', year: -1 })
        .end((err, res) => {
          expect(res.status).to.be.oneOf([400, 422, 500]);
          logger.info('Invalid parameters handled');
          done(err);
        });
    });
  });

  describe('Performance Data', () => {
    it('should fetch social performance records', (done) => {
      request(app)
        .get('/api/v1/social-performance/E1001')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          logger.info('Social performance fetched', { count: res.body.length });
          done(err);
        });
    });

    it('should fetch order evaluation records', (done) => {
      request(app)
        .get('/api/v1/orders/E1001')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).to.be.oneOf([200, 404]);
          logger.info('Order evaluation records fetched');
          done(err);
        });
    });
  });

  describe('Error Handling & Recovery', () => {
    it('should handle network errors gracefully', (done) => {
      request(app)
        .get('/api/v1/nonexistent')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).to.be.oneOf([404, 500]);
          logger.info('Non-existent endpoint handled');
          done(err);
        });
    });

    it('should return error for malformed requests', (done) => {
      request(app)
        .post('/api/v1/bonus/compute')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .end((err, res) => {
          expect(res.status).to.be.oneOf([400, 422, 500]);
          logger.info('Malformed request handled');
          done(err);
        });
    });

    it('should handle concurrent requests', (done) => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          new Promise((resolve) => {
            request(app)
              .get('/api/v1/salesmen')
              .set('Authorization', `Bearer ${authToken}`)
              .end((err, res) => {
                resolve(res.status === 200);
              });
          })
        );
      }

      Promise.all(promises).then((results) => {
        expect(results).to.not.include(false);
        logger.info('Concurrent requests handled successfully');
        done();
      });
    });
  });

  describe('API Rate Limiting & Stability', () => {
    it('should maintain performance under normal load', (done) => {
      const start = Date.now();
      request(app)
        .get('/api/v1/salesmen')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          const duration = Date.now() - start;
          expect(duration).to.be.below(2000); // Should respond in < 2 seconds
          logger.info('Performance check passed', { duration: `${duration}ms` });
          done(err);
        });
    });
  });

  describe('Integration Service Health', () => {
    it('should have OrangeHRM service available', (done) => {
      try {
        const orangehrmService = require('../services/orangehrm.service');
        expect(orangehrmService).to.exist;
        expect(orangehrmService.getEmployee).to.be.a('function');
        expect(orangehrmService.storeBonus).to.be.a('function');
        logger.info('OrangeHRM service verified');
        done();
      } catch (err) {
        logger.error('OrangeHRM service check failed', err);
        done(err);
      }
    });

    it('should have OpenCRX service available', (done) => {
      try {
        const opencrxService = require('../services/opencrx.service');
        expect(opencrxService).to.exist;
        expect(opencrxService.getOrderData).to.be.a('function');
        logger.info('OpenCRX service verified');
        done();
      } catch (err) {
        logger.error('OpenCRX service check failed', err);
        done(err);
      }
    });

    it('should have Odoo service available', (done) => {
      try {
        const odooService = require('../services/odoo.service');
        expect(odooService).to.exist;
        expect(odooService.getEmployeeData).to.be.a('function');
        logger.info('Odoo service verified');
        done();
      } catch (err) {
        logger.error('Odoo service check failed', err);
        done(err);
      }
    });

    it('should have Camunda service available', (done) => {
      try {
        const camundaService = require('../services/camunda.service');
        expect(camundaService).to.exist;
        logger.info('Camunda service verified');
        done();
      } catch (err) {
        logger.error('Camunda service check failed', err);
        done(err);
      }
    });
  });

  after(() => {
    logger.info('Integration tests completed');
  });
});
