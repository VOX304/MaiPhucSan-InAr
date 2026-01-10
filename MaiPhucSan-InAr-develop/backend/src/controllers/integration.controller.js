/**
 * Integration endpoints.
 *
 * Provides a reachability overview for depending systems:
 *  - OrangeHRM
 *  - OpenCRX
 *  - MongoDB
 *  - Camunda (optional, TR9)
 *
 * Used by:
 * - UI health view
 * - integration tests (Task 3 / TR8)
 */
const { OrangeHRMService } = require('../services/orangehrm.service');
const { OpenCRXService } = require('../services/opencrx.service');
const { MongoService } = require('../services/mongo.service');
const { CamundaService } = require('../services/camunda.service');

exports.getDependenciesHealth = async (_req, res) => {
  const orangehrm = new OrangeHRMService();
  const opencrx = new OpenCRXService();
  const mongo = new MongoService();
  const camunda = new CamundaService();

  const [orangeOk, opencrxOk, mongoOk, camundaOk] = await Promise.all([
    orangehrm.ping(),
    opencrx.ping(),
    mongo.ping(),
    camunda.ping()
  ]);

  res.json({
    data: {
      orangehrm: { reachable: orangeOk },
      opencrx: { reachable: opencrxOk },
      mongodb: { reachable: mongoOk },
      camunda: { reachable: camundaOk }
    }
  });
};
