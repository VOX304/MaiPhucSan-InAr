const express = require('express');
const logger = require('../config/logger');

/**
 * Middleware to log HTTP requests
 */
const loggingMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info('HTTP Request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    user: req.user?.username || 'anonymous'
  });

  // Log response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;
    logger.info('HTTP Response', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`
    });
    return originalSend.call(this, data);
  };

  next();
};

module.exports = loggingMiddleware;
