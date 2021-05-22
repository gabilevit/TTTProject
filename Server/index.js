const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
//const { request } = require("http");
const fs = require("fs");
//const path = require("path");
const mongoose = require('mongoose');
const usersRoutes = require('./api/routes/users');
const bodyParser = require("body-parser");
const socket = require("socket.io");
const user = require("./api/models/user");

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
        console.log(user);
        usersNames[user] = socket.id;
        users.push(user);
        io.emit('userConected', users);
    })

    socket.on('inviteToPlay', (data) => {
        //console.log(data);
        priveGameRoomsNumbers[data.sender] = `Welcome to room number ${roomNumber}`;
        priveGameRoomsNumbers[data.reciver] = `Welcome to room number ${roomNumber}`;
        privateGameRommsContestens[priveGameRoomsNumbers[data.sender]] = data;
        socket.join(priveGameRoomsNumbers[data.sender]);
        //console.log(usersNames);
        //console.log(usersNames[data.reciver]);
        io.to(usersNames[data.reciver]).emit('gotInvite', data);

    })

    socket.on('redirectReciverToGame', (data) => {       
        socket.join(priveGameRoomsNumbers[data.reciver]);
        privateGameRommsContestens[priveGameRoomsNumbers[data.reciver]] = data;
        io.to(usersNames[data.reciver]).emit('redirectSenderToGame');
    })

    socket.on('sendDataToServer', (data) => {
        console.log(data);
        console.log('send data to game');
        io.to(priveGameRoomsNumbers[data.sender]).emit('sendDataToGame', data);
        //io.emit('sendDataToGame', data);
    })

    socket.on('startGame', (data) =>{
        console.log(data);
        if(getRandomInt(2) == 0){
            //socket.join(priveGameRoomsNumbers[data.sender]);
            io.to(priveGameRoomsNumbers[data.user]).emit('getRoles', {
                //sender: data.sender,
                //reciver: data.reciver,
                senderRole: 'X',
                reciverRole: 'O',
                turn: 'X'
            })
        } else{
            //socket.join(priveGameRoomsNumbers[data.sender]);
            io.to(priveGameRoomsNumbers[data.user]).emit('getRoles', {
                sender: data.sender,
                //reciver: data.reciver,
                senderRole: 'O',
                reciverRole: 'X',
                turn: 'X'
            })
        }
    })
    //const socketid = socket.id;
    //users.push(socketid);
})

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

