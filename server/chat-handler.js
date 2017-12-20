const Messages = require('./messages');

const userOffMsg = 'Addressee is offline.';
const bot = {username: 'Bot'};

function server () {
    return require('./rs-server'); // eslint-disable-line global-require
}

function isPrivateMsg (message, from) {
    if (message.startsWith('@')) {
        const msg = message.split(' ');
        const to = server().getPlayer(msg[0].substr(1));

        if (to) {
            msg.shift();
            Messages.sendPrivateChatMessage(msg.join(' '), from, to);
        } else {
            Messages.sendPrivateChatMessage(userOffMsg, bot, from);
        }

        return true;
    }

    return false;
}

function isBotCmd (message) {
    return false;
}

module.exports = (player) => {
    player.socket.on('chat-message', data => {
        const msg = data.message.trim();

        if (isPrivateMsg(msg, player) || isBotCmd(msg)) {
            return;
        }

        Messages.sendChatMessage(msg, player);
    });
};
