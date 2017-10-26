import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import { RequestHandler } from 'express';

function createLogger() {
  let logger: winston.LoggerInstance;

  logger = new winston.Logger({
    exitOnError: false
  });
  
  logger.add(winston.transports.Console, {
    level: process.env.NPM_CONFIG_LOGLEVEL,
    handleExceptions: true,
    colorize: true,
    timestamp: true
  });

  return logger;
  
}

export function expressMiddleware(): RequestHandler {
  return expressWinston.logger({
    level: 'silly',
    transports: [
      new winston.transports.Console({
        level: process.env.NPM_CONFIG_LOGLEVEL,
        json: false,
        colorize: true
      })
    ],
    meta: false, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: false, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    //ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
  });
}

export let logger = createLogger();
export default logger;