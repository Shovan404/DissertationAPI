const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email address is required"]
    },
    feedbackmsg: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);