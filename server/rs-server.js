const app = require('http').createServer(require('./static-handler')), // eslint-disable-line no-mixed-requires
    io = require('socket.io')(app),
    config = require('./config'),
    format = require('util').format,
    db = require('./database'), // eslint-disable-line no-unused-vars
    PModel = require('./models/player'),
    Player = require('./player-wrapper'),
    Messages = require('./messages'),
    logger = config.logger;


class Server {
    constructor () {
        logger.info('Server starting...');

        this.__io = io;
        this.__players = new Map();
        this.__globalTopScore = new Set();

        this.__io.on('connection', (socket) => {
            this.newConnection(socket);
        });

        this.__startServer();
    }

    __startServer () { // eslint-disable-line class-methods-use-this
        app.listen(config.port);
        logger.info(format('Server started. Listening port %d.', config.port));
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
        if (this.__globalTopScore.size < 10) {
            this.__globalTopScore.add({
                username: player.username,
                score: player.lastScore,
                time: Date.now()
            });
        } else {
            const result = Array.from(this.__globalTopScore)
                .reduce((min, current) => {
                    return current.score < min.score ||
                        (current.score === min.score && current.time > min.time)
                        ? current
                        : min;
                });

            if (result.score < player.lastScore) {
                this.__globalTopScore.delete(result);
                this.__globalTopScore.add({
                    username: player.username,
                    score: player.lastScore,
                    time: Date.now()
                });
            } else {
                return;
            }
        }

        const top = [];

        this.__globalTopScore.forEach((item) => {
            top.push({
                user: item.username,
                score: item.score
            });
        });

        Messages.sendUpdateTopScore(top);
    }

    get io () {
        return this.__io;
    }
}

const server = new Server();

module.exports = server;
