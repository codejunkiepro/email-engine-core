const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: false
    },
    outlookToken: {
        type: String,
        required: false
    },
    id: {
        type: String,
        unique: true,
        require: false
    },
    displayName: {
        type: String
    },
    userId: {
        type: String,
        require: true,
        unique: true
    }
});

// Hash password before saving the user
UserSchema.pre('save', async function (next) {
    next();
});

const User = mongoose.model('User', UserSchema);

// User.de

module.exports = User;
