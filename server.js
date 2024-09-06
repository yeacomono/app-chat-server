const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const users = {}; // Almacena los usuarios conectados

io.on('connection', (socket) => {
    console.log('Usuario conectado: ' + socket.id);

    // Maneja la conexión de un nuevo usuario
    socket.on('join', (username) => {
        users[socket.id] = username;
        io.emit('userList', Object.values(users));
        console.log(`${username} se ha unido.`);
    });

    // Maneja el envío de un mensaje
    socket.on('message', (message) => {
        io.emit('message', { user: users[socket.id], message: message });
    });

    // Maneja la desconexión de un usuario
    socket.on('disconnect', () => {
        console.log(`${users[socket.id]} se ha desconectado.`);
        delete users[socket.id];
        io.emit('userList', Object.values(users));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
