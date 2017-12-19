const log4js = require('log4js');

log4js.configure({
    appenders: {
        out: {
            type: 'stdout',
            layout: {
                type: 'pattern',
                pattern: '%[[%d{yyyy-MM-dd hh:mm:ss}][%p] %m%]'
            }
        }
    },
    categories: {
        default: {
            appenders: ['out'],
            level: 'all'
        }
    }
});

module.exports = {
    port: process.env.PORT || 8080,
    logger: log4js.getLogger(),
    db: 'mongodb://127.0.0.1/rolling-sphere'
};
