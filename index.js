const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const setupSocket = require('./utils/socketHandler').setupSocket;
const gameRoutes = require('./routes/gameRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
setupSocket(io);
app.use('/api/games', gameRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use(express.json());
app.use('/api', gameRoutes);