const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Sirve los archivos estáticos del cliente
app.use(express.static('client'));

// Manejo de conexiones de socket
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado -------------');
    // Evento para unirse a un chat
    socket.on('join', ({ name, room }, callback) => {
        console.log('This is the name:' + name);
        console.log('This is the room:' + room);
        var socketID = String(socket.id);
        console.log(socketID);
        const { error, user } = addUser({ id: socket.id, name: name, room });
        if (error) {
            console.log(error);
            if (typeof callback === 'function') {
                return callback(error);
            };
            return;
        }
        socket.join(user.room);

        // socket.emit('message', { user: 'admin', text: `${user.name}, bienvenido al chat ${user.room}.` });
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} se ha unido.` });

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

        if (typeof callback === 'function') {
            callback();
        }
    });
 
    // Evento de envío de mensaje
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        if (user && user.room) {
            // console.log(message);
            let payload = JSON.parse(message);
            console.log(payload);
            // io.to(user.room).emit('message', { user: user.name, text: message });
            io.to(user.room).emit('message', payload);
            // Buscar menciones usando @nombre
            // const mentionedUsers = message.match(/@\w+/g);
            // if (mentionedUsers) {
            //     mentionedUsers.forEach((username) => {
            //         const name = username.slice(1).toLowerCase();
            //         const mentionedUser = getUsersInRoom(user.room).find(u => u.name === name);
            //         if (mentionedUser) {
            //             // io.to(mentionedUser.id).emit('message', { user: 'admin', text: `Fuiste mencionado por ${user.name}: ${message}` });
            //             let model = {
            //                 senderName: user.name,
            //                 markedsID: null,

            //             }
            //             io.to(mentionedUser.id).emit('message', { user: 'admin', text: `Fuiste mencionado por ${user.name}: ${message}` });
            //         }
            //     });
            // }
        }
        if (typeof callback === 'function') {
            callback();
        }
    });
    // socket.on('mentionUser', ({ userName, message }) => {
    //     const user = getUser(socket.id); // Obtener el usuario actual
    //     const mentionedUser = getUsersInRoom(user.room).find(u => u.name === userName.toLowerCase());
    //     if (mentionedUser) {
    //         io.to(mentionedUser.id).emit('message', { user: 'admin', text: `Fuiste mencionado por ${user.name}: ${message}` });
    //     }
    // });

    // Desconexión del socket
    socket.on('disconnect', () => {
        console.log('Cliente Desconectado');
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} ha dejado el chat.` });
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        }
    });
});

server.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
