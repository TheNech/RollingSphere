const config = require('./config');

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
                coins: player.numberOfCoins,
                topscores: server().topArray
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
        server().io.to(config.ioAuthRoomName).emit('update-online', {
            pOnline: number
        });
    },

    sendUpdateTopScore (top) {
        server().io.to(config.ioAuthRoomName).emit('update-top-score', {
            scores: top
        });
    },

    sendChatMessage (message, from) {
        from.socket.broadcast.to(config.ioAuthRoomName).emit('chat-message', {
            message,
            user: from.username,
            private: false
        });
    },

    sendPrivateChatMessage (message, from, to) {
        to.socket.emit('chat-message', {
            message,
            user: from.username,
            private: true
        });
    }
};
