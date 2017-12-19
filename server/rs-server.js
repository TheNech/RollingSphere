const app = require('http').createServer(require('./static-handler')), // eslint-disable-line no-mixed-requires
    io = require('socket.io')(app),
    config = require('./config'),
    format = require('util').format,
    db = require('./database'), // eslint-disable-line no-unused-vars
    PModel = require('./models/player'),
    TSModel = require('./models/top-score'),
    Player = require('./player-wrapper'),
    Messages = require('./messages'),
    logger = config.logger;


class Server {
    constructor () {
        logger.info('Server starting...');

        this.__io = io;
        this.__players = new Map();
        this.__top = null;

        this.__io.on('connection', (socket) => {
            this.newConnection(socket);
        });

        this.__startServer();
    }

    __startServer () { // eslint-disable-line class-methods-use-this
        TSModel
            .findOne({name: 'topscore'}, (err, top) => {
                if (err) {
                    logger.warn(`Error in finding topscore. Message: ${err.message}`);
                }

                if (top) {
                    this.__top = top;
                } else {
                    this.__top = new TSModel({name: 'topscore'});
                    this.__top.save();
                }

                this.__globalTopScore = new Set(this.__top.array);
            })
            .then(() => {
                app.listen(config.port);
                logger.info(format('Server started. Listening port %d.', config.port));
            });
    }

    newConnection (socket) {
        socket.on('auth', (data) => {
            PModel.findOne({username: data.username}, (err, user) => {
                if (err) {
                    logger.error('Error in auth handler! Message: ', err.message);
                } else if (user && user.checkPassword(data.password)) {
                    logger.info(format('Auth success. User: %s', user.username));
                    this.newPlayer(socket, user);
                } else {
                    logger.info(format('Auth failed. User: %s', data.username));
                }
            });
        });

        socket.on('registration', (data) => {
            const player = new PModel({
                username: data.username,
                password: data.password
            });

            player.save((err, user) => {
                if (err) {
                    logger.info(format('Registration failed. User: %s. Message: %s',
                        data.username, err.message));
                } else {
                    logger.info(format('Registration success. User: %s', user.username));
                }

                Messages.sendRegisterRes(socket, !err);
            });
        });
    }

    newPlayer (socket, user) {
        const player = new Player(socket, user);

        this.__players.set(player.username, player);

        Messages.sendUpdateOnline(this.__players.size);
    }

    playerDisconnect (player) {
        this.__players.delete(player.username);

        Messages.sendUpdateOnline(this.__players.size);
    }

    newScore (player) {
        if (this.__top.array.length >= 7) {
            if (this.__top.array[this.__top.array.length - 1].score < player.lastScore) {
                this.__top.array.pop();
            } else {
                return;
            }
        }

        this.__top.array.push({
            username: player.username,
            score: player.lastScore,
            time: Date.now()
        });

        this.__top.array.sort((a, b) => {
            if (a.score < b.score) {
                return 1;
            }

            if (a.score > b.score) {
                return -1;
            }

            if (a.time > b.time) {
                return 1;
            }

            if (a.time < b.time) {
                return -1;
            }

            return 0;
        });

        this.__top.save();

        Messages.sendUpdateTopScore(this.__top.array);
    }

    get topArray () {
        return this.__top.array;
    }

    get io () {
        return this.__io;
    }
}

const server = new Server();

module.exports = server;
