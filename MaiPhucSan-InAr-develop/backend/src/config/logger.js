const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const formatLog = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  const dataStr = Object.keys(data).length > 0 ? JSON.stringify(data) : '';
  return `[${timestamp}] ${level}: ${message} ${dataStr}`.trim();
};

const logger = {
  info: (message, data = {}) => {
    const log = formatLog('INFO', message, data);
    console.log(log);
    fs.appendFileSync(path.join(logsDir, 'app.log'), log + '\n', (err) => {
      if (err) console.error('Failed to write app log:', err);
    });
  },

  error: (message, error = {}) => {
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: error.stack
    } : error;
    const log = formatLog('ERROR', message, errorData);
    console.error(log);
    fs.appendFileSync(path.join(logsDir, 'error.log'), log + '\n', (err) => {
      if (err) console.error('Failed to write error log:', err);
    });
  },

  warn: (message, data = {}) => {
    const log = formatLog('WARN', message, data);
    console.warn(log);
    fs.appendFileSync(path.join(logsDir, 'app.log'), log + '\n', (err) => {
      if (err) console.error('Failed to write app log:', err);
    });
  },

  debug: (message, data = {}) => {
    if (process.env.DEBUG === 'true') {
      const log = formatLog('DEBUG', message, data);
      console.log(log);
      fs.appendFileSync(path.join(logsDir, 'debug.log'), log + '\n', (err) => {
        if (err) console.error('Failed to write debug log:', err);
      });
    }
  }
};

module.exports = logger;
