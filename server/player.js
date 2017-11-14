module.exports = class Player {
    constructor(socket, id) {
        this.__id = id;

        socket.emit('connected', { id: this.id });

        socket.on('disconnect', () => {
            this.disconnect();
        });

        console.log(this.constructor.name + this.id + ' connected');
    }

    disconnect() {
        require('./rs-server').playerDisconnect(this);

        console.log(this.name + ' disconnected');
    }

    get id() {
        return this.__id;
    }

    get name() {
        return 'Player' + this.id;
    }
};
