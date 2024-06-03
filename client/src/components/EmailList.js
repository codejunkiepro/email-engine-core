import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MailboxTable from './MailboxTable';
import EmailsTable from './EmailsTable';

const EmailList = () => {
    const [emails, setEmails] = useState([]);
    const [mailboxes, setMailboxes] = useState([]);
    const [user, setUser] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmails = async () => {
            const localUserId = localStorage.getItem('userId');
            const ws = new WebSocket('ws://localhost:4000');
            
            try {
                // Fetch user data from the API

                const { data } = await axios.get(`/api/sync?userId=${localUserId}`);
                setUser(data);
                // WebSocket event handlers
                ws.onopen = () => {
                    console.log('Connected to WebSocket server');
                };

                ws.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    if (message.userId === localUserId) {
                        switch (message.type) {
                            case 'emailUpdate':
                                setEmails(message.data);
                                break;
                            case 'mailboxUpdate':
                                setMailboxes(message.data);
                                break;
                            default:
                                break;
                        }
                    }
                };

                ws.onclose = () => {
                    console.log('Disconnected from WebSocket server');
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setError('WebSocket error');
                };
            } catch (error) {
                console.error('Error fetching emails:', error);
                setError(error.response ? error.response.data : error.message);
            }
            
            return () => {
                ws.close();
            };
        };

        fetchEmails();
    }, []);

    return (
        <div>
            <h2>{user.email ? `Email List For: ${user.userId}/${user.email}` : ''}</h2>
            {error && <p className='error-message'>{error}</p>}
            <h3>Emails</h3>
            {emails.length ? <EmailsTable data={emails} /> : ''}
            <h3>Mailboxes</h3>
            {mailboxes.length ? <MailboxTable data={mailboxes} /> : ''}
        </div>
    );
};

export default EmailList;
