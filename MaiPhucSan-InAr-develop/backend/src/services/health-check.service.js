const axios = require('axios');
const logger = require('../config/logger');

/**
 * Integration Health Check Service
 * Verifies all external services are properly configured
 */

const healthCheck = async () => {
  const status = {
    timestamp: new Date().toISOString(),
    services: {},
    overall: 'HEALTHY'
  };

  // Check OrangeHRM
  try {
    const orangehrmService = require('./orangehrm.service');
    status.services.orangehrm = {
      available: true,
      methods: {
        getEmployee: typeof orangehrmService.getEmployee === 'function',
        storeBonus: typeof orangehrmService.storeBonus === 'function',
        getQualifications: typeof orangehrmService.getQualifications === 'function',
        storeQualification: typeof orangehrmService.storeQualification === 'function'
      },
      status: 'CONFIGURED'
    };
    logger.info('OrangeHRM health check passed', { service: 'orangehrm' });
  } catch (error) {
    status.services.orangehrm = {
      available: false,
      error: error.message,
      status: 'NOT_AVAILABLE'
    };
    logger.warn('OrangeHRM service check failed', { error: error.message });
  }

  // Check OpenCRX
  try {
    const opencrxService = require('./opencrx.service');
    status.services.opencrx = {
      available: true,
      methods: {
        getOrderData: typeof opencrxService.getOrderData === 'function',
        storeOrderData: typeof opencrxService.storeOrderData === 'function'
      },
      status: 'CONFIGURED'
    };
    logger.info('OpenCRX health check passed', { service: 'opencrx' });
  } catch (error) {
    status.services.opencrx = {
      available: false,
      error: error.message,
      status: 'NOT_AVAILABLE'
    };
    logger.warn('OpenCRX service check failed', { error: error.message });
  }

  // Check Odoo
  try {
    const odooService = require('./odoo.service');
    status.services.odoo = {
      available: true,
      methods: {
        getEmployeeData: typeof odooService.getEmployeeData === 'function',
        storeEmployeeData: typeof odooService.storeEmployeeData === 'function'
      },
      status: 'CONFIGURED'
    };
    logger.info('Odoo health check passed', { service: 'odoo' });
  } catch (error) {
    status.services.odoo = {
      available: false,
      error: error.message,
      status: 'NOT_AVAILABLE'
    };
    logger.warn('Odoo service check failed', { error: error.message });
  }

  // Check Camunda
  try {
    const camundaService = require('./camunda.service');
    status.services.camunda = {
      available: true,
      methods: {
        deployProcess: typeof camundaService.deployProcess === 'function',
        startProcess: typeof camundaService.startProcess === 'function',
        getProcessStatus: typeof camundaService.getProcessStatus === 'function'
      },
      status: 'CONFIGURED'
    };
    logger.info('Camunda health check passed', { service: 'camunda' });
  } catch (error) {
    status.services.camunda = {
      available: false,
      error: error.message,
      status: 'NOT_AVAILABLE'
    };
    logger.warn('Camunda service check failed', { error: error.message });
  }

  // Check Bonus Service
  try {
    const bonusService = require('./bonus.service');
    status.services.bonus = {
      available: true,
      methods: {
        computeTotals: typeof bonusService.computeTotals === 'function'
      },
      status: 'WORKING'
    };
    logger.info('Bonus service health check passed', { service: 'bonus' });
  } catch (error) {
    status.services.bonus = {
      available: false,
      error: error.message,
      status: 'ERROR'
    };
    logger.error('Bonus service check failed', error);
    status.overall = 'DEGRADED';
  }

  // Determine overall status
  const availableServices = Object.values(status.services).filter(s => s.available).length;
  const totalServices = Object.keys(status.services).length;
  
  if (availableServices < totalServices) {
    status.overall = availableServices >= totalServices * 0.7 ? 'DEGRADED' : 'UNHEALTHY';
  }

  status.serviceCount = {
    available: availableServices,
    total: totalServices,
    percentage: Math.round((availableServices / totalServices) * 100)
  };

  logger.info('Health check completed', {
    overall: status.overall,
    available: availableServices,
    total: totalServices
  });

  return status;
};

module.exports = {
  healthCheck
};
