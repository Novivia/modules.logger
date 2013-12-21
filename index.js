var winston = require('winston');

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    colorize: true,
    timestamp: function() { return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); }
});

module.exports = winston;
