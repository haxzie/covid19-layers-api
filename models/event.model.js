const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        required: true
    },
    value: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Event', eventSchema);