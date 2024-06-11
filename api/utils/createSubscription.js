const axios = require('axios');
const dbHelper = require('../helpers/dbHelper');


async function createSubscription(accessToken, userId) {
    try {
        const subscription = {
            changeType: 'created,updated,deleted',
            notificationUrl: 'https://7d83-45-250-255-140.ngrok-free.app/webhook',
            resource: '/me/messages',
            expirationDateTime: new Date(new Date().getTime() + 3600000).toISOString(), // 1 hour expiration
            clientState: process.env.OUTLOOK_CLIENT_SECRET
        };

        const response = await axios.post('https://graph.microsoft.com/v1.0/subscriptions', subscription, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(
            `Subscribed to user's inbox, subscription ID: ${response.data.id}`,
        );

        await dbHelper.addSubscription(response.data.id, userId);

        return response.data;
    } catch (error) {
        console.error(error.response.data, "Error creating subscription");
        throw error;
    }
}


module.exports = { createSubscription };