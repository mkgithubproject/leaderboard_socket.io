const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const config = require('./config');
const { connectRedis } = require('./redis/client');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const socketHandler = require('./socket');
const leaderboardService = require('./services/leaderboardService');
const cors = require('cors');
async function start() {
    await connectRedis();

    const app = express();
    app.use(cors()); // Enable CORS for all origins by default
    app.use(bodyParser.json());
 
    app.use((req, res, next) => {
        console.log(`📩 ${req.method} ${req.url} hit at ${new Date().toISOString()}`);
        next();
    });

    app.use('/api/leaderboard', leaderboardRoutes);

    app.get('/health', (req, res) => res.json({ ok: true }));

    const server = http.createServer(app);
    const io = new Server(server, { cors: { origin: '*' } });

    // set up socket handlers
    socketHandler(io, leaderboardService);

    server.listen(config.port, () => {
        console.log(`server is ruuning on http://localhost:${config.port}`)
    });
}

start().catch((err) => {
    console.error('Failed to start', err);
    process.exit(1);
});
