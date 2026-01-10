/**
 * Centralized environment configuration.
 *
 * Keep all env-vars in one place to make local development and CI predictable.
 * Provide a `.env` (see `.env.example`) for local development.
 */
require('dotenv').config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',

  // HTTP server
  port: Number(process.env.PORT || 3000),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',

  // Security / Auth (N_FR1)
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10),

  // Depending systems (real deployments may differ; for tests we stub HTTP calls).
  orangehrmBaseUrl: process.env.ORANGEHRM_BASE_URL || 'http://localhost:8081',
  orangehrmApiToken: process.env.ORANGEHRM_API_TOKEN || '',
  orangehrmEmployeeEndpoint:
    process.env.ORANGEHRM_EMPLOYEE_ENDPOINT || '/api/v1/employees/{employeeId}',
  orangehrmStoreBonusEndpoint:
    process.env.ORANGEHRM_STORE_BONUS_ENDPOINT ||
    '/api/v1/employees/{employeeId}/bonus',

  opencrxBaseUrl: process.env.OPENCRX_BASE_URL || 'http://localhost:8082',
  opencrxUsername: process.env.OPENCRX_USERNAME || '',
  opencrxPassword: process.env.OPENCRX_PASSWORD || '',
  opencrxOrdersEndpoint:
    process.env.OPENCRX_ORDERS_ENDPOINT || '/api/v1/orders?salesmanId={employeeId}',

  // Odoo (TR5 / N_FR6)
  odooBaseUrl: process.env.ODOO_BASE_URL || 'http://localhost:8069',
  odooDb: process.env.ODOO_DB || '',
  odooUsername: process.env.ODOO_USERNAME || '',
  odooPassword: process.env.ODOO_PASSWORD || '',

  // Camunda (TR9 / N_FR2)
  camundaBaseUrl: process.env.CAMUNDA_BASE_URL || 'http://localhost:8080/engine-rest',
  camundaProcessDefinitionKey:
    process.env.CAMUNDA_BONUS_PROCESS_KEY || 'bonusApproval',

  // MongoDB (TR2)
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  mongoDbName: process.env.MONGODB_DB || 'iar',

  // Bonus computation config (TR10)
  socialBonusPoolEur: Number(process.env.SOCIAL_BONUS_POOL_EUR || 2000),
  ordersBonusPoolEur: Number(process.env.ORDERS_BONUS_POOL_EUR || 1500)
};
