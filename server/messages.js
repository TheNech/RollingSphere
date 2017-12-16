function server () {
    return require('./rs-server'); // eslint-disable-line global-require
}

module.exports = {
    sendAuthRes (socket, status, player) {
        if (status) {
            player.socket.emit('auth', {
                successfully: true,
                bestscore: player.bestScore,
                time: player.timeInGame,
                coins: player.numberOfCoins
            });
        } else {
            socket.emit('auth', {
                successfully: false
            });
        }
    },

    sendRegisterRes (socket, status) {
        socket.emit('registration', {
            successfully: status
        });
    },

    sendPlayerData (player) {
        player.socket.emit('player-data', {
            bestscore: player.bestScore,
            time: player.timeInGame,
            coins: player.numberOfCoins
        });
    },

    sendUpdateOnline (number) {
        server().io.emit('update-online', {
            pOnline: number
        });
    },

    sendUpdateTopScore (top) {
        server().io.emit('update-top-score', {
            scores: top
        });
    }
};
