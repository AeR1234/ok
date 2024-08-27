const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map();

io.on('connection', (socket) => {

  socket.on('joinRoom', (room) => {
    socket.join(room);
    if (!rooms.has(room)) {
      rooms.set(room, new Map());
    }
    const memberNumber = rooms.get(room).size + 1;
    rooms.get(room).set(socket.id, memberNumber);
    socket.emit('memberNumber', memberNumber);
  });

  socket.on('sendMessage', ({ room, message }) => {
    const senderNumber = rooms.get(room).get(socket.id);
    io.to(room).emit('message', { senderNumber, encodedMessage: message });
  });

  socket.on('disconnect', () => {
    rooms.forEach((members, room) => {
      if (members.has(socket.id)) {
        members.delete(socket.id);
        if (members.size === 0) {
          rooms.delete(room);
        }
      }
    });
  });
});

const PORT = 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
