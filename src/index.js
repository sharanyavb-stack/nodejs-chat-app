const { request } = require('express');
const express = require('express');
const http = require('http');
const path = require('path');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const socketio = require('socket.io')
const Filter = require('bad-words')
const app = express();
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))
// when user connected
io.on('connection', (socket)=> {
    
    socket.on('join', ({username, room}, callback)=> {
        const {error, user} = addUser({id: socket.id, username, room})
        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        // .to is specific to memebers of the room
        socket.emit('message', generateMessage(user.username, 'Welcome!')) //// emits event fr one particular connection
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username, `${user.username} has joined!`)) // emits message to all users except the connected one
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback();
    })
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }        
        console.log(message);
        
        io.to(user.room).emit('message', generateMessage(user && user.username, message))  // emits event for all connections
        callback()
    })
    socket.on('sendLocation', (details, callback)=> {
        const user = getUser(socket.id)
        io.to(user.room).emit('messageLocation',generateLocationMessage(user && user.username,details) )
        callback()
    })
    // when user disconnected
    socket.on('disconnect', ()=> {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage(user.username, `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, ()=> {
    console.log('Server is up '+ port);
})