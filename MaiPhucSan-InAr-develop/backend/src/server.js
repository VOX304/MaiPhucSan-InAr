/**
 * Application entrypoint.
 *
 * Starts the HTTP server after connecting to MongoDB.
 */
const app = require('./app');
const env = require('./config/env');
const { connectMongo, disconnectMongo } = require('./db/mongoose');

let server;

app.get('/', (req, res) => {
    res.redirect('/api/v1');
});

async function start() {
  await connectMongo();

  server = app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${env.port}`);
    // eslint-disable-next-line no-console
    console.log(`Swagger UI on        http://localhost:${env.port}/api-docs`);
  });
}

async function shutdown() {
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await disconnectMongo();
  } catch (_err) {
    // ignore
  } finally {
    process.exit(0);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Startup failed:', err);
  process.exit(1);
});
