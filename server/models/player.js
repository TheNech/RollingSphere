const mongoose = require('mongoose');

const PlayerSchema = mongoose.Schema({
    username: {
        type: String,
        unique: true,
        trim: true
    },
    password: String,
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
});

module.exports = mongoose.model('player', PlayerSchema);
