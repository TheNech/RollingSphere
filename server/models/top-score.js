const mongoose = require('mongoose');

const TopScoreSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    array: []
});

module.exports = mongoose.model('top', TopScoreSchema);
