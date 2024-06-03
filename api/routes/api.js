const express = require('express');
const axios = require('axios');
const { User } = require('../models');
const { handleSyncRequest } = require('../utils/syncEmail');

const router = express.Router();


router.get('/sync', async (req, res) => {

    try {
        const { userId } = req.query;
        if (!userId || userId == undefined) return res.send('NO user!!');
        const user = await User.findOne({ userId });

        const broadcast = req.app.get('broadcast');

        await handleSyncRequest(userId, broadcast);
        res.send(user)
    } catch (error) {
        console.log(error.message)
        if (error.message.includes('JWT')) {
            res.status(500).send("Token expired. Again Link account!");
        } else {
            res.status(500).send(error.message)
        }
    }
});

module.exports = router;