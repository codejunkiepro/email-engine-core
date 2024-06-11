const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
    subscriptionId: {
        type: String,
        required: true,
        unique: true,
    },
    userAccountId: {
        type: String,
        required: true,
    },
});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);
module.exports = Subscription;
