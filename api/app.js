const express = require('express');
require('dotenv').config();
const WebSocket = require('ws');
const http = require('http');

const { createIndices } = require('./db/elasticsearch');
const bodyParser = require('body-parser');

const { connectDB, User } = require('./models');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const PORT = process.env.PORT || 4000;
createIndices();

// const {createind}
const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const clients = new Set();


wss.on('connection', (ws) => {
	console.log('Client connected');
    clients.add(ws);

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });
});

const broadcast = (data) => {
	for (const client of clients) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify(data));
		}
	}
};

app.set('broadcast', broadcast);

app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

app.get('/', async (req, res) => {
	res.json({ message: 'ok', });
});



connectDB().then(() => {
	server.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
})


