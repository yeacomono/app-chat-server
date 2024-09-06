const socket = io();

// Función para unirse a una sala
const joinRoom = (name, room) => {
    socket.emit('join', { name, room }, (error) => {
        if (error) {
            alert(error);
        }
    });
};

// Unirse a una sala llamada "general" por defecto
joinRoom(prompt("Ingrese su nombre de usuario:"), "general");

const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send');
const output = document.getElementById('output');

sendButton.addEventListener('click', () => {
    const message = messageInput.value;
    socket.emit('sendMessage', message, () => {
        messageInput.value = '';
    });

    // Buscar menciones usando @nombre
    const mentionedUsers = message.match(/@\w+/g);
    if (mentionedUsers) {
        mentionedUsers.forEach(user => {
            const userName = user.slice(1);
            socket.emit('mentionUser', { userName, message });
        });
    }
});

socket.on('message', (message) => {
    output.innerHTML += `<p><strong>${message.user}:</strong> ${message.text}</p>`;
});

socket.on('roomData', ({ room, users }) => {
    console.log(`Usuarios en la sala ${room}:`, users);
});
