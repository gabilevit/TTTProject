const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const fs = require("fs");
const mongoose = require('mongoose');
const usersRoutes = require('./api/routes/users');
const bodyParser = require("body-parser");
const socket = require("socket.io");
const user = require("./api/models/user");
const { disconnect } = require("process");
const { on } = require("./api/models/user");

app.use(cors());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json({ limit: "50mb" }));

const server = app.listen(1902, () => {
    console.log("Server is up");
})


const mongoDBPAss = 'mFdyWUSKBDiXpfD3';

mongoose.connect(`mongodb+srv://gabi:${mongoDBPAss}@usersdb.b5a9l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

mongoose.connection.on('connected', () => {
    console.log('mongoDB connected!');
})

app.use('/users', usersRoutes);

const users = [];
const usersNames = [];
const offlineUsers = [];

const priveGameRoomsNumbers = [];
const privateGameRommsContestens = [];
var roomNumber = 1;

const io = socket(server, {
    cors: {
        origin: '*',
    }
})

io.on('connection', (socket) => {
    socket.on('emitCurrentUser', (user) => {
        if (!users || !users.find(e => e == user)) {
            usersNames[user] = socket.id;
            users.push(user)
        } else {
            usersNames[user] = socket.id;
        }
        io.emit("userConected", users)
    })

    socket.on('updateOfflineUsers', (users) => {
        io.emit('emitOfflineUsers', users);
    })

    socket.on('userLogOut', (user) => {
        io.emit('userWentOffline', user);
    })   

    //for log out
    socket.on('logOut', () => {
        for (let index = 0; index < users.length; index++) {
            if (usersNames[users[index]] == socket.id) {
                usersNames.splice(users[index], 1);
                users.splice(index, 1);
            }
        }
        io.emit('userConected', users); 
    })

    //for close tab
    socket.on('disconnect', () => {
        for (let index = 0; index < users.length; index++) {
            if (usersNames[users[index]] == socket.id) {
                usersNames.splice(users[index], 1);
                users.splice(index, 1);
            }
        }
        io.emit('userConected', users);
    })  

    socket.on('userBackMenu', (data) => {
        socket.leave(priveGameRoomsNumbers[data.user]);
        io.emit('userConected', users);
    })

    socket.on('inviteToPlay', (data) => {
        priveGameRoomsNumbers[data.sender] = `Welcome to room number ${roomNumber}`;
        priveGameRoomsNumbers[data.reciver] = `Welcome to room number ${roomNumber}`;
        privateGameRommsContestens[priveGameRoomsNumbers[data.sender]] = data;
        socket.join(priveGameRoomsNumbers[data.sender]);
        io.to(usersNames[data.reciver]).emit('gotInvite', data);

    })

    socket.on('cancelInvite', (data) => {
        io.to(usersNames[privateGameRommsContestens[priveGameRoomsNumbers[data.sender]].reciver]).emit('senderCancelInvite');
    })

    socket.on('redirectReciverToGame', (data) => {
        privateGameRommsContestens[priveGameRoomsNumbers[data.reciver]] = data;
        io.to(usersNames[data.sender]).emit('redirectSenderToGame');
    })

    socket.on('declineInvite', (data) => {
        io.to(usersNames[data.sender]).emit('gotDecline', {
            message: `${privateGameRommsContestens[priveGameRoomsNumbers[data.sender]].reciver} has declined your invite`
        })
    })

    socket.on('sendDataToServer', (data) => {
        console.log(data);
        console.log('send data to game');
        io.to(priveGameRoomsNumbers[data.sender]).emit('sendDataToGame', data);
    })

    socket.on('startGame', (data) => {
        socket.join(priveGameRoomsNumbers[data.user]);
        if (data.user == privateGameRommsContestens[priveGameRoomsNumbers[data.user]].sender) {
            io.to(usersNames[data.user]).emit('getRoles', {
                myRole: 'X',
                turn: 'X',
                otherUser: privateGameRommsContestens[priveGameRoomsNumbers[data.user]].reciver
            })
        } else if (data.user == privateGameRommsContestens[priveGameRoomsNumbers[data.user]].reciver) {
            io.to(usersNames[data.user]).emit('getRoles', {
                myRole: 'O',
                turn: 'X',
                otherUser: privateGameRommsContestens[priveGameRoomsNumbers[data.user]].sender
            })
        }
    })

    socket.on('emitMove', (data) => {
        io.to(priveGameRoomsNumbers[data.user]).emit('updateMove', data);
    })

    socket.on('requestRematch', (data) => {
        if (privateGameRommsContestens[priveGameRoomsNumbers[data.user]].sender == data.user) {
            io.to(usersNames[privateGameRommsContestens[priveGameRoomsNumbers[data.user]].reciver]).emit('gotRematch', data);
        } else {
            io.to(usersNames[privateGameRommsContestens[priveGameRoomsNumbers[data.user]].sender]).emit('gotRematch', data);
        }

    })

    socket.on('emitRematch', (data) => {
        io.to(priveGameRoomsNumbers[data.user]).emit('restartGame');
    })

    socket.on('message', (data) => {
        io.in(priveGameRoomsNumbers[data.user]).emit('newMsg', data);
    })
})