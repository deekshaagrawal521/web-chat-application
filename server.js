const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (index.html, script.js, style.css) from the current directory
app.use(express.static(path.join(__dirname)));

// WebSocket setup
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for text messages
    socket.on('sendMessage', (data) => {
        console.log('Message received:', data);
        // Broadcast the message to all users
        io.emit('receiveMessage', data);
    });

    // Listen for file uploads
    socket.on('fileUpload', (fileData) => {
        console.log('File received:', fileData.fileName);
        // Broadcast the file data to all users
        io.emit('receiveFile', fileData);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
