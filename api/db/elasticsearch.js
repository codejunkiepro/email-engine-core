const { Client } = require("@elastic/elasticsearch");

// Initialize Elasticsearch client
const client = new Client({ node: "http://elasticsearch:9200" });

// Function to create indices for email data
async function createIndices() {
    try {
        // Check if email_messages index already exists
        const emailMessagesIndexExists = await client.indices.exists({ index: 'email_messages' });
        if (!emailMessagesIndexExists.valueOf())
            // Create index for email messages
            await client.indices.create({
                index: "email_messages",
                body: {
                    mappings: {
                        properties: {
                            message_id: { type: "keyword" }, // Unique identifier for the email message
                            user_id: { type: "keyword" }, // Local user ID associated with the message
                            subject: { type: "text" }, // Subject of the email
                            sender: { type: "text" }, // Sender's email address
                            sender_name: { type: "text" }, // Sender's name
                            recipient: { type: "text" }, // Recipient's name or email address
                            body: { type: "text" }, // Body content of the email
                            timestamp: { type: "date" }, // Timestamp when the email was received/sent
                            read: { type: "boolean" }, // Indicates whether the email has been read
                            folder: { type: "keyword" }, // Folder where the email is stored (e.g., Inbox, Sent, etc.)
                            flag: { type: "text" }
                        },
                    },
                },
            });
        // Check if mailboxes index already exists
        const mailboxIndexExists = await client.indices.exists({ index: 'mailboxes' });
        if (!mailboxIndexExists.valueOf())
            // Create index for mailbox details
            await client.indices.create({
                index: "mailboxes",
                body: {
                    mappings: {
                        properties: {
                            user_id: { type: "keyword" }, // Local user ID associated with the mailbox
                            mailbox_name: { type: "keyword" }, // Name of the mailbox (e.g., Inbox, Sent, etc.)
                            total_emails: { type: "integer" }, // Total number of emails in the mailbox
                            unread_count: { type: "integer" }, // Number of unread emails in the mailbox
                            last_sync: { type: "date" }, // Timestamp of the last synchronization with Outlook
                        },
                    },
                },
            });

        // Check if email_metadata index already exists
        const emailMetadataIndexExists = await client.indices.exists({ index: 'email_metadata' });
        if (!emailMetadataIndexExists.valueOf())
            // Create Index: email metadata
            await client.indices.create({
                index: "email_metadata",
                body: {
                    mappings: {
                        properties: {
                            metadata_id: { type: "keyword" }, // Unique identifier for the metadata
                            message_id: { type: "keyword" }, // ID of the email message the metadata belongs to
                            key: { type: "keyword" }, // Metadata key (e.g., importance, sensitivity, etc.)
                            value: { type: "text" }, // Metadata value
                        },
                    },
                },
            });

        console.log("Indices created successfully.");
    } catch (error) {
        console.error("Error creating indices:", error);
    }
}

async function indexEmailMessage(id, message) {
    try {
        const response = await client.index({
            index: "email_messages",
            id: id,
            body: message,
        });
        console.log("Indexed email message:", response.result);
    } catch (error) {
        console.error("Error indexing email message:", error);
    }
}

async function indexMailboxes(id, message) {
    try {
        const response = await client.index({
            index: "mailboxes",
            id: id,
            body: message,
        });
        console.log("Indexed mailbox message:", response.result);
    } catch (error) {
        console.error("Error indexing mailbox message:", error);
    }
}


async function indexEmailMetadata(message) {
    try {
        const response = await client.index({
            index: "email_metadata",
            body: message,
        });
        console.log("Indexed email message:", response.result);
    } catch (error) {
        console.error("Error indexing email message:", error);
    }
}

async function getAllEmailMessage(userId) {
    try {
        const data = await client.search({
            index: 'email_messages',
            body: {
                query: {
                    match_all: {
                        userId
                    } // Match all documents
                }
            }
        });

        return data.hits.hits.map(hit => hit._source); // Extract source data
    } catch (error) {
        console.error("Error retrieving indexed data:", error);
        throw error;
    }
}

async function getAllMailboxes() {
    try {
        const data = await client.search({
            index: 'mailboxes',
            body: {
                query: {
                    match_all: {} // Match all documents
                }
            }
        });

        return data.hits.hits.map(hit => hit._source); // Extract source data
    } catch (error) {
        console.error("Error retrieving indexed data:", error);
        throw error;
    }
}

module.exports = {
    client,
    createIndices,
    indexEmailMessage,
    indexEmailMetadata,
    indexMailboxes,
    getAllEmailMessage,
    getAllMailboxes
};
