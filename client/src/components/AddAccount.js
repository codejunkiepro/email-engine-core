import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AddAccount = () => {
    const [userId, setUserId] = useState('');
    const [oauthUrl, setOauthUrl] = useState('');

    useEffect(() => {
         // Parse URL parameters and set userId in localStorage
        const searchParams = new URLSearchParams(window.location.search);
        const paramsObj = {};
        for (let [key, value] of searchParams.entries()) {
            paramsObj[key] = value;
        }

        if (paramsObj.userId) {
            localStorage.setItem('userId', paramsObj.userId);
            window.location.href = '/';
        }
    }, []); // Ensuring the effect runs only once by providing an empty dependency array

    const handleAddAccount = async () => {
        // Post userId to register endpoint and set OAuth URL
        try {
            const response = await axios.post('/auth/register', { userId });
            setOauthUrl(response.data.url);
        } catch (error) {
            console.error('Error adding account:', error);
        }
    };

    return (
        <div>
            <h2>Add Account</h2>
            <input
                type="text"
                value={userId}
                name='userId'
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your userId"
            />
            <button onClick={handleAddAccount}>Add Account</button>
            {oauthUrl && <a href={oauthUrl}>Link Outlook Account</a>}
        </div>
    );
};

export default AddAccount;
