const express = require('express');
const app = express();
const http = require('http').createServer(app); // buat HTTP server
const io = require('socket.io')(http);

const rooms = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('createRoom', (roomName) => {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        rooms[roomId] = {
            name: roomName,
            participants: [],
            arguments: [],
            votes: {}
        };
        socket.join(roomId);
        socket.emit('roomCreated', roomId);
    });

    socket.on('joinRoom', ({ roomId, name }) => {
        if (rooms[roomId]) {
            rooms[roomId].participants.push(name);
            socket.join(roomId);
            socket.emit('joinedRoom', rooms[roomId]);
            io.to(roomId).emit('participantsUpdate', rooms[roomId].participants);
        } else {
            socket.emit('errorMsg', 'Room ID tidak ditemukan.');
        }
    });

    socket.on('sendArgument', ({ roomId, argument, logicType }) => {
        rooms[roomId].arguments.push({ argument, logicType });
        rooms[roomId].votes[argument] = { agree: 0, disagree: 0 };
        io.to(roomId).emit('newArgument', { argument, logicType });
    });

    socket.on('vote', ({ roomId, argument, choice }) => {
        if (rooms[roomId] && rooms[roomId].votes[argument]) {
            rooms[roomId].votes[argument][choice]++;
            io.to(roomId).emit('voteUpdate', rooms[roomId].votes[argument]);
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
