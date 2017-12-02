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
    logger: log4js.getLogger()
};
