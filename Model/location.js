const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Location name is required"]
    },
    latitude: {
        type: String,
        required: [true, "Latitude is required"]
    },
    longitude: {
        type: String,
        required: [true, "Longitude is required"]
    },
    additionalInfo: {
        type: String
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

module.exports = mongoose.model('Location', locationSchema);