const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Restaurant name is required"]
    },
    about: {
        type: String
    },
    location: {
        type: String
    },
    image: String,
});

module.exports = mongoose.model('Restaurant', restaurantSchema);