const express = require('express');
const { syncEmails } = require('../utils/syncEmail');
const tokenHelper = require('../helpers/tokenHelper');
const dbHelper = require('../helpers/dbHelper');
const { User } = require('../models');
const { Client } = require("@microsoft/microsoft-graph-client");
const { indexEmailMessage, indexMailboxes, getAllEmailMessage, getAllMailboxes } = require('../db/elasticsearch');
// const ioServer = require('../helpers/socketHelper');

const router = express.Router();

// POST /webhook
router.post('/', async function (req, res) {
    if (req.query && req.query.validationToken) {
        res.set('Content-Type', 'text/plain');
        res.send(req.query.validationToken);
        return;
    }

    // console.log(JSON.stringify(req.body, null, 2));
    const broadcast = req.app.get('broadcast');

    let areTokensValid = true;
    if (req.body.validationTokens) {
        const appId = process.env.OUTLOOK_CLIENT_ID;
        const tenantId = process.env.OUTLOOK_TENANT_ID;
        const validationResults = await Promise.all(
            req.body.validationTokens.map((token) =>
                tokenHelper.isTokenValid(token, appId, tenantId),
            ),
        );

        areTokensValid = validationResults.reduce((x, y) => x && y);
    }
    // console.log(areTokensValid, "areTokensValid");

    if (areTokensValid) {
        for (let i = 0; i < req.body.value.length; i++) {
            const notification = req.body.value[i];
            // console.log(notification.clientState, process.env.SUBSCRIPTION_CLIENT_STATE)
            if (notification.clientState === process.env.OUTLOOK_CLIENT_SECRET) {
                const subscription = await dbHelper.getSubscription(notification.subscriptionId);
                console.log(subscription, "subscription")
                if (subscription) {
                    if (!notification.encryptedContent) {
                        await processNotification(
                            notification,
                            req.app.locals.msalClient,
                            subscription.userAccountId,
                            broadcast
                        );
                    }
                }
            }
        }
    }

    res.status(202).end();
});


async function processNotification(notification, msalClient, userAccountId, broadcast) {
    const messageId = notification.resourceData.id;

    // const client = graph.getGraphClientForUser(msalClient, userAccountId);

    const user = await User.findOne({ userId: userAccountId });
    const client = getAuthenticatedClient(user.outlookToken);

    try {
        const message = await client
            .api(`/me/messages/${messageId}`)
            // .select('subject,id')
            .get();

        await emitNotification(message, client, broadcast, userAccountId);
    } catch (err) {
        console.log(`Error getting message with ${messageId}:`);
        console.error(err);
    }
}

async function emitNotification(email, client, broadcast, userId) {
    await indexEmailMessage(email.id, {
        message_id: email.id,
        user_id: userId,
        subject: email.subject,
        sender: email.from ? email.from.emailAddress.address : '',
        senderName: email.from ? email.from.emailAddress.name : '',
        recipient: email.toRecipients.map(r => r.emailAddress.address).join(', '),
        body: email.body.content,
        timestamp: email.receivedDateTime,
        read: email.isRead,
        folder: email.parentFolderId,
        flag: email.flag ? email.flag.flagStatus : 'notFlagged',
    })

    const mailboxes = await fetchMailboxes(client);
    for (const mailbox of mailboxes) {
        await indexMailboxes(mailbox.id, {
            user_id: userId,
            mailbox_name: mailbox.displayName,
            total_emails: mailbox.totalItemCount,
            unread_count: mailbox.unreadItemCount,
            last_sync: new Date().toISOString(),
        });
    }
    
    if (broadcast) {
        broadcast({ type: 'emailUpdate', userId, data: await getAllEmailMessage() });
        broadcast({ type: 'mailboxUpdate', userId, data: await getAllMailboxes() });
    }
}

const fetchMailboxes = async (client) => {
    try {
        const response = await client.api('/me/mailFolders').get();
        return response.value;
    } catch (error) {
        throw error;
    }
};


const getAuthenticatedClient = (accessToken) => {
    const client = Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        },
    });
    return client;
};


module.exports = router;
