var winston = require('winston');

// Remove default (basic) console logger.
winston.remove(winston.transports.Console);

// Provide a new logger each time we're called.
var newLogger = function newLogger(name) {
  return new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        prettyPrint: true,
        colorize: true,
        timestamp: function() { return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); },
        label: (name || undefined)
      })
    ]
  });
}

module.exports = newLogger;

// Temporary. For unupdated modules that don't instanciate logger explicitely.
module.exports.info = winston.info;
