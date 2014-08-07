var winston   = require("winston"),
    utilities = require("utilities");

var __DEV__ = false// utilities.env.variables.__DEV__;

var loggers = {};

// Remove default (basic) console logger.
winston.remove(winston.transports.Console);

// Provide a new logger each time we're called.
var newLogger = function newLogger(name) {
  // Verify if transport is already cached for that name.
  if (loggers.hasOwnProperty(name)) {
    return loggers[name];
  }

  // Create transport for that name.
  return loggers[name] = new (winston.Logger)({
    padLevels: true,
    transports: [
      new (winston.transports.Console)({
        level: __DEV__ ? "verbose" : "info",
        prettyPrint: true,
        colorize: true,
        timestamp: function() { return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); },
        label: (name || undefined)
      })
    ]
  });
}

module.exports = newLogger;
