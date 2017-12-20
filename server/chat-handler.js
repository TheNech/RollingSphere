const Messages = require('./messages');

const userOffMsg = 'Addressee is offline.';
const help = `Available commands
/help    - show available commands
/time    - show playtime
/regdate - show registration date`;

const bot = {username: 'Bot'};
const dateOpts = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
};

function server () {
    return require('./rs-server'); // eslint-disable-line global-require
}

function timeResMsg (msecs) {
    let time = msecs,
        days = 0,
        hours = 0,
        mins = 0,
        secs = 0;

    days = Math.floor(time / (1000 * 60 * 60 * 24));
    time -= days * 1000 * 60 * 60 * 24;
    hours = Math.floor(time / (1000 * 60 * 60));
    time -= hours * 1000 * 60 * 60;
    mins = Math.floor(time / (1000 * 60));
    time -= mins * 1000 * 60;
    secs = Math.floor(time / 1000);

    return [
        'You played in our game',
        days,
        'days,',
        hours,
        'hours,',
        mins,
        'minutes and',
        secs,
        'seconds'
    ].join(' ');
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

function isBotCmd (message, from) {
    if (message.startsWith('/')) {
        const command = message.substr(1).split(' ')[0];
        let msg = null;

        switch (command) {
            case 'help':
                msg = help;
                break;

            case 'regdate':
                msg = `You registered at ${from.regDate.toLocaleString('en-US', dateOpts)}`;
                break;

            case 'time':
                msg = timeResMsg(from.timeInGame);
                break;

            default:
                msg = 'Invalid command.';
                break;
        }

        Messages.sendPrivateChatMessage(msg, bot, from);

        return true;
    }

    return false;
}

module.exports = (player) => {
    player.socket.on('chat-message', data => {
        const msg = data.message.trim();

        if (isPrivateMsg(msg, player) || isBotCmd(msg, player)) {
            return;
        }

        Messages.sendChatMessage(msg, player);
    });
};
