const mongoose = require('mongoose');

const orderschema = new mongoose.Schema({
    users: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    foods: [{
        foodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Food'
        },
        quantity: {
            type: Number,
            default: 1
        },
        price: Number
    }],
    locations: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderschema);