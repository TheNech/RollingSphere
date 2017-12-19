const mongoose = require('mongoose'),
    crypto = require('crypto');

const PlayerSchema = mongoose.Schema({
    username: {
        type: String,
        minlength: [3, 'usernameTooShort'],
        required: [true, 'usernameRequired'],
        unique: [true, 'usernameNonUnique'],
        match: [/^[a-zA-Z0-9_]+$/, 'usernameIncorrect']
    },
    passwordHash: {
        type: String,
        required: [true, 'passwordRequired']
    },
    salt: {
        type: String,
        required: true
    },
    coins: {
        type: Number,
        min: 0,
        default: 0
    },
    bestscore: {
        type: Number,
        min: 0,
        default: 0
    },
    time: {
        type: Number,
        min: 0,
        default: 0
    }
}, {
    timestamps: true
});

PlayerSchema.virtual('password')
    .set(function (password) {
        if (password) {
            this.salt = crypto.randomBytes(256).toString('base64');
            this.passwordHash = this.encryptPassword(password);
        } else {
            this.salt = void 0;
            this.passwordHash = void 0;
        }
    })
    .get(() => {
        return 'This is a secret!';
    });

PlayerSchema.methods = {
    encryptPassword (password) {
        return crypto.pbkdf2Sync(password, this.salt, 1, 256, 'sha256').toString('base64');
    },

    checkPassword (password) {
        if (!password || !this.passwordHash) {
            return false;
        }

        return this.encryptPassword(password) === this.passwordHash;
    }
};

module.exports = mongoose.model('player', PlayerSchema);
