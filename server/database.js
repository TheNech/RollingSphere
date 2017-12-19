const config = require('./config'),
    mongoose = require('mongoose');

const logger = config.logger;

mongoose.Promise = global.Promise;

mongoose.connect(config.db, {
    useMongoClient: true
}).catch(() => {
    logger.info('Exiting...');
    process.exit(0);
});

const db = mongoose.connection;

db.on('error', (err) => {
    logger.error(err.message);
});

db.on('open', () => {
    logger.info('Succesfully connected to database.');
});


module.exports = db;
