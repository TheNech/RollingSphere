const app = require('http').createServer(require('./static-handler'));
const io = require('socket.io')(app);
const config = require('./config');
const logger = config.logger;
const format = require('util').format;
const Player = require('./player-wrapper');


class Server {
    constructor(io) {
        logger.info('Server starting...');

        this.__io = io;
        this.__players = new Map();
        this.__globalTopScore = new Set();

        this.__io.on('connection', (socket) => {
            this.newPlayer(socket);
        });

        this.__startServer();
    }

    __startServer(port) {
        app.listen(config.port);
        logger.info(format('Server started. Listening port %d.', config.port));
    }

    newPlayer(socket) {
        socket.on('auth', (data) => {
            // TODO: auth via db and registration event
            let player = new Player(socket);
            this.__players.set(player.username, player);

            this.__io.emit('update-online', {
                pOnline: this.__players.size
            });
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
                return current.score < min.score ? current : min;
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
