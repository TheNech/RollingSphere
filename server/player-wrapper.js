const format = require('util').format,
    logger = require('./config').logger;

module.exports = class PlayerWrapper {
    constructor (socket, player) {
        this.__player = player;
        this.__lastScore = 0;

        socket.emit('authorized', {
            bestScore: this.bestScore,
            timeInGame: this.timeInGame,
            numberOfCoins: this.numberOfCoins
        });

        socket.on('disconnect', () => {
            this.__disconnect();
        });

        socket.on('game-over', (data) => {
            this.__gameOver(data);
        });

        logger.info(format('Player %s connected.', this.username));
    }

    __disconnect () {
        logger.info(format('Player %s disconnected.', this.username));

        this.__player.save();
        this.server.playerDisconnect(this);
    }

    __gameOver (data) {
        this.__player.time += data.time;
        this.__player.coins += data.coins;

        this.__lastScore = data.score;

        if (this.bestScore < this.lastScore) {
            this.__player.bestscore = this.lastScore;
        }

        logger.info(format('%s finished the game. Score: %d. Coins: %d. ' +
            'Time: %ds %dms.', this.username, data.score, data.coins,
            Math.floor(data.time / 1000), data.time % 1000)); // eslint-disable-line indent

        this.server.newScore(this);
    }

    save () {
        this.__player.save((err) => {
            if (err) {
                logger.error(err.message);
            }
        });
    }

    get timeInGame () {
        return this.__player.time;
    }

    get bestScore () {
        return this.__player.bestscore;
    }

    get lastScore () {
        return this.__lastScore;
    }

    get numberOfCoins () {
        return this.__player.coins;
    }

    get username () {
        return this.__player.username;
    }

    static get server () {
        return require('./rs-server'); // eslint-disable-line global-require
    }
};
