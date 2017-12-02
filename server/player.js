const format = require('util').format;
const logger = require('./config').logger;

module.exports = class Player {
    constructor(socket, nickname) {
        this.__id = this.server.nextId;
        this.__bestScore = 0
        this.__lastScore = 0;
        this.__timeInGame = 0;

        if (!nickname || nickname.trim() === '') {
            this.__nickname = this.name;
            logger.warn('Player constructor: argument \'nickname\' is empty or undefined, using field \'name\' instead.');
        } else {
            this.__nickname = nickname;
        }

        socket.emit('connected', { 
            id: this.id,
            bestScore: this.bestScore,
            timeInGame: this.timeInGame
        });

        socket.on('disconnect', () => {
            this.disconnect();
        });

        socket.on('end-game', (data) => {
            this.endGame(data);
        });

        logger.info(format('Player %s connected. ID: %d.', this.nickname, this.id));
    }

    disconnect() {
        this.server.playerDisconnect(this);

        logger.info(format('Player %s disconnected.', this.nickname));
    }

    endGame(data) {
        this.__timeInGame += data.time;
        
        this.__lastScore = data.score;

        if (this.bestScore < this.lastScore) {
            this.__bestScore = this.lastScore;
        }

        logger.info(format('Player %s finished the game. Score: %d. Time: %ds %dms.',
            this.nickname, data.score, Math.floor(data.time/1000), data.time%1000));

        this.server.newGameScore(this);
    }

    get id() {
        return this.__id;
    }

    get timeInGame() {
        return this.__timeInGame;
    }

    get bestScore() {
        return this.__bestScore;
    }

    get lastScore() {
        return this.__lastScore;
    }

    get nickname() {
        return this.__nickname;
    }

    get name() {
        return this.constructor.name + this.id;
    }

    get server() {
        return require('./rs-server');
    }
};
