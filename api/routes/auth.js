const express = require('express');
const axios = require('axios');
const { User } = require('../models');
const { createSubscription } = require('../utils/createSubscription');

const router = express.Router();

const CLIENT_ID = process.env.OUTLOOK_CLIENT_ID;
const CLIENT_SECRET = process.env.OUTLOOK_CLIENT_SECRET;
const REDIRECT_URI = process.env.OUTLOOK_REDIRECT_URI;
const AUTHORIZATION_BASE_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

// User registration
router.post('/register', async (req, res) => {
    const { userId } = req.body;

    try {
        let user = await User.findOne({ userId: userId });
        
        if (!user) {
            user = await User.create({ userId });
        }

        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            response_type: 'code',
            redirect_uri: REDIRECT_URI + "?userId=" + userId,
            response_mode: 'query',
            scope: 'openid profile offline_access user.read mail.read',
            state: 'random_string_to_protect_against_csrf'
        });

        res.json({ url: `${AUTHORIZATION_BASE_URL}?${params.toString()}` });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Generate Outlook OAuth URL
router.get('/oauth/outlook', (req, res) => {

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        response_mode: 'query',
        scope: 'User.Read',
        state: 'random_string_to_protect_against_csrf'
    });

    res.json({ url: `${AUTHORIZATION_BASE_URL}?${params.toString()}` });
});

// Handle Outlook OAuth callback
router.get('/oauth/callback', async (req, res) => {
    const { code, userId } = req.query;

    try {
        const response = await axios.post(TOKEN_URL, new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI + "?userId=" + userId
        }));

        const { access_token } = response.data;

        // Fetch user details from Microsoft Graph API
        const graphApiUrl = 'https://graph.microsoft.com/v1.0/me';
        const graphApiHeaders = {
            Authorization: `Bearer ${access_token}`
        };

        const userResponse = await axios.get(graphApiUrl, { headers: graphApiHeaders });
        const userDetails = userResponse.data;
        

        const subscriptData = await createSubscription(access_token, userId);
        
        let user = await User.findOne({ userId });


        if (user) {
            user.outlookToken = access_token;
            user.email = userDetails.mail;
            user.id = userDetails.id;
            user.displayName = userDetails.displayName
            await user.save();
        }
        res.redirect('http://localhost:3000?userId=' + userId);
    } catch (error) {
        console.error(error.message);
        res.redirect('http://localhost:3000');
    }
});

module.exports = router;
