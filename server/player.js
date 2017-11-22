module.exports = class Player {
    constructor(socket, nickname) {
        this.__id = this.server.nextId;
        this.__bestScore = 0
        this.__lastScore = 0;
        this.__timeInGame = 0;
        this.__nickname = nickname || this.name;

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

        console.log('Player "' + this.nickname + '" connected\n');
    }

    disconnect() {
        this.server.playerDisconnect(this);

        console.log('Player "' + this.nickname + '" disconnected\n');
    }

    endGame(data) {
        this.__timeInGame += data.time;
        
        this.__lastScore = data.score;

        if (this.bestScore < this.lastScore) {
            this.__bestScore = this.lastScore;
        }

        console.log('Player "' + this.nickname + '" finished game.');
        console.log('New score:\t' + this.lastScore);
        console.log('Best score:\t' + this.bestScore);
        console.log('Game time:\t' + data.time);
        console.log('Total time:\t' + this.timeInGame);
        console.log();

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
