const app = require('http').createServer(require('./static-handler'));
const io = require('socket.io')(app);

const Player = require('./player');


class Server {
    constructor(io, port = 8080) {
        console.log('Server starting...');

        this.__io = io;
        this.__idCounter = 0;
        this.__players = new Map();

        this.__io.on('connection', (socket) => {
            this.newPlayer(socket);
        });

        this.startServer(port);
    }

    startServer(port) {
        app.listen(port);
        console.log('Server started. Listening port ' + port);
        console.log();
    }

    newPlayer(socket) {
        let player = new Player(socket, this.nextId);
        this.__players.set(player.name, player);

        this.__io.emit('new-player-connected',
            {
                id: player.id,
                pNumber: this.__players.size
            }
        );
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

    get nextId() {
        this.__idCounter++;
        return this.__idCounter;
    }
}

const server = new Server(io);
module.exports = server;
//module.exports.playerDisconnect = server.playerDisconnect;
