/**
 * MongoDB health wrapper (TR2).
 *
 * We use Mongoose for the application database, but for integration testing
 * we keep a small boundary that can be stubbed (online/offline scenarios).
 */
const { MongoClient } = require('mongodb');
const env = require('../config/env');

class MongoService {
  /**
   * @param {{uri?:string, dbName?:string, client?:MongoClient}} [opts]
   */
  constructor(opts = {}) {
    this.uri = opts.uri || env.mongoUri;
    this.dbName = opts.dbName || env.mongoDbName;
    this.client = opts.client || new MongoClient(this.uri, { ignoreUndefined: true });
  }

  /**
   * Reachability check used by integration tests.
   */
  async ping() {
    try {
      await this.client.connect();
      await this.client.db(this.dbName).command({ ping: 1 });
      return true;
    } catch (_err) {
      return false;
    } finally {
      try {
        await this.client.close();
      } catch (_err) {
        // ignore
      }
    }
  }
}

module.exports = {
  MongoService
};
