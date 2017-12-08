const config = require('./config');
const logger = config.logger;
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect(config.db, {
    useMongoClient: true
}).catch(error => {
    // logger.error(error.message);
});

const db = mongoose.connection;

db.on('error', err => {
    logger.error(err.message);
});

db.on('open', () => {
    logger.info('Succesfully connected to database.');
});


module.exports = db;
