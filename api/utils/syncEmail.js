
const { Client } = require("@microsoft/microsoft-graph-client");
const { User } = require("../models");
const { indexEmailMessage, indexMailboxes, client: esClient, getAllEmailMessage, getAllMailboxes } = require("../db/elasticsearch");
const cron = require('node-cron');

const activeCronJobs = {}; // To keep track of active cron jobs

const getAuthenticatedClient = (accessToken) => {
    const client = Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        },
    });
    return client;
};

const fetchEmails = async (client) => {
    try {
        const response = await client.api('/me/messages').get();
        return response.value;
    } catch (error) {
        throw error;
    }
};


const fetchMailboxes = async (client) => {
    try {
        const response = await client.api('/me/mailFolders').get();
        return response.value;
    } catch (error) {
        throw error;
    }
};


const syncEmails = async (userId, broadcast) => {
    const user = await User.findOne({ userId });
    const client = getAuthenticatedClient(user.outlookToken);

    try {
        const emails = await fetchEmails(client);
        const mailboxes = await fetchMailboxes(client);

        for (const email of emails) {
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
        }

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

        return emails
    } catch (error) {
        // res.status(500).send('Error fetching emails');
        // console.error(error, "Send email")
        throw error;
    }
};

const scheduleSyncJob = (userId, broadcast) => {
    if (activeCronJobs[userId]) {
        console.log(`Cron job for user ${userId} is already scheduled.`);
        return;
    }

    // Schedule a cron job to run every hour
    const cronJob = cron.schedule('*/15 * * * *', async () => {
        console.log(`Running cron job for user ${userId}`);
        await syncEmails(userId, broadcast);
    });

    // Save the cron job to the activeCronJobs object
    activeCronJobs[userId] = cronJob;
    console.log(`Cron job for user ${userId} scheduled.`);
};

// handle a sync request
const handleSyncRequest = async (userId, broadcast) => {
    try {
        scheduleSyncJob(userId, broadcast);
        await syncEmails(userId, broadcast);
    } catch (error) {
        throw error;
    }
};

module.exports = { handleSyncRequest }