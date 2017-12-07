const app = require('http').createServer(require('./static-handler'));
const io = require('socket.io')(app);
const config = require('./config');
const logger = config.logger;
const format = require('util').format;
const db = require('./database');
const PModel = require('./models/player');
const Player = require('./player-wrapper');


class Server {
    constructor(io) {
        logger.info('Server starting...');

        this.__io = io;
        this.__players = new Map();
        this.__globalTopScore = new Set();

        this.__io.on('connection', (socket) => {
            this.newConnection(socket);
        });

        this.__startServer();
    }

    __startServer(port) {
        app.listen(config.port);
        logger.info(format('Server started. Listening port %d.', config.port));
    }

    newConnection(socket) {
        socket.on('auth', (data) => {
            PModel.findOne({username: data.username}, (err, user) => {
                socket.emit('auth', {
                    successfully: (!err && user) ? true : false
                });

                if (err) {
                    logger.error('Error in auth handler! Message: ' + err.message);
                } else if (!user) {
                    logger.info(format('%s authorization failed.', data.username));
                } else {
                    logger.info(format('%s authorized.', user.username));
                    this.newPlayer(socket, user);
                }
            });
        });

        socket.on('registration', data => {
            let user = new PModel({username: data.username});
            user.save((err, user) => {
                if (err) {
                    logger.info(format('Registration failed. Message: %s',
                        err.message));
                } else {
                    logger.info(format('%s registered.', user.username));
                }

                socket.emit('registration', {
                    successfully: !err
                });
            });
        });
    }

    newPlayer(socket, user) {
        let player = new Player(socket, user);

        this.__players.set(player.username, player);

        this.__io.emit('update-online', {
                pOnline: this.__players.size
        });
    }

    playerDisconnect(player) {
        this.__players.delete(player.username);

        this.__io.emit('update-online', {
                pOnline: this.__players.size
        });
    }

    newScore(player) {
        if (this.__globalTopScore.size < 10) {
            this.__globalTopScore.add({ 
                username: player.username,
                score: player.lastScore,
                time: Date.now()
            });
        } else {
            let result = Array.from(this.__globalTopScore).reduce((min, current) => {
                return current.score < min.score || (current.score === min.score &&
                    current.time > min. time) ? current : min;
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

        let top = [];
        this.__globalTopScore.forEach((item) => {
            top.push({
                user: item.username,
                score: item.score
            });
        });

        this.__io.emit('update-top-score', top);
    }
}

module.exports = new Server(io);
