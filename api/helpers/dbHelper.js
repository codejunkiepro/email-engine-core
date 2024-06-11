const mongoose = require('mongoose');
const Subscription = require('../models/subscription');

module.exports = {
    ensureDatabase: async () => {
        // Mongoose handles database creation automatically, no need to manually create it
        console.log('MongoDB connected and ensured.');
    },

    getSubscription: async (subscriptionId) => {
        try {
            const subscription = await Subscription.findOne({ subscriptionId });
            return subscription;
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    },

    getSubscriptionsByUserAccountId: async (userAccountId) => {
        try {
            const subscriptions = await Subscription.find({ userAccountId });
            return subscriptions;
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    },

    addSubscription: async (subscriptionId, userAccountId) => {
        try {
            const subscription = new Subscription({ subscriptionId, userAccountId });
            await subscription.save();
            return true;
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    },

    deleteSubscription: async (subscriptionId) => {
        try {
            await Subscription.deleteOne({ subscriptionId });
            return true;
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    },
};
