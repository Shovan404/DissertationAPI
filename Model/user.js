const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: [true, "Email address is required"]
    },
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    phoneNumber: {
        type: String,
        unique: true,
        required: [true, "Phone Number is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    image: String,
    admin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);