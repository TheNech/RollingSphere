const mongoose = require('mongoose');

const TopScoreSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    array: []
}, {
    timestamps: true
});

module.exports = mongoose.model('top', TopScoreSchema);
