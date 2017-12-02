const app = require('http').createServer(require('./static-handler'));
const io = require('socket.io')(app);
const format = require('util').format;
const logger = require('./config').logger;
const Player = require('./player');

class Server {
    constructor(io, port = 8080) {
        logger.info('Server starting...');

        this.__io = io;
        this.__idCounter = 0;
        this.__players = new Map();
        this.__globalTopScore = new Set();

        this.__io.on('connection', (socket) => {
            this.newPlayer(socket);
        });

        this.startServer(port);
    }

    startServer(port) {
        app.listen(port);
        logger.info(format('Server started. Listening port %d.', port));
    }

    newPlayer(socket) {
        socket.on('auth', (data) => {
            let player = new Player(socket, data.nickname);
            this.__players.set(player.name, player);

            this.__io.emit('new-player-connected', {
                id: player.id,
                pNumber: this.__players.size
            });
        });
    }

    playerDisconnect(player) {
        this.__players.delete(player.name);

        this.__io.emit('player-disconnected',
            {
                id: player.id,
                pNumber: this.__players.size
            }
        );
    }

    newGameScore(player) {
        if (this.__globalTopScore.size < 10) {
            this.__globalTopScore.add({ 
                nickname: player.nickname,
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
                    nickname: player.nickname,
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
                name: item.nickname,
                score: item.score
            });
        });

        this.__io.emit('new-global-top-score', top);
    }

    get nextId() {
        return ++this.__idCounter;
    }
}

const server = new Server(io);
module.exports = server;
