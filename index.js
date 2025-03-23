const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const {on} = require("nodemon");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index.html');
})

let arr= [];
let playingArr= [];

function displayClickOnBoard(board, id, player){
    const btnsArr = ["btn1", "btn2", "btn3", "btn4", "btn5", "btn6", "btn7", "btn8", "btn9"];
    const index = btnsArr.indexOf(id);
    board[index] = player;
    return board;
}

function checkEnd(board) {
    console.log(board);
    const btnsArr = ["btn1", "btn2", "btn3", "btn4", "btn5", "btn6", "btn7", "btn8", "btn9"];
    for (let i = 0; i < 3; i++) {
        if (board[i * 3] !== 0 &&
            board[i * 3] === board[i * 3 + 1] &&
            board[i * 3 + 1] === board[i * 3 + 2])
            return {status: board[i * 3], btns: [btnsArr[i * 3], btnsArr[i * 3 + 1], btnsArr[i * 3 + 2]]};
        if (board[i] !== 0 &&
            board[i] === board[3 + i] &&
            board[3 + i] === board[6 + i])
            return {status: board[i], btns: [btnsArr[i], btnsArr[3 + i], btnsArr[6 + i]]};
    }
    if (board[0] !== 0 &&
        board[0] === board[4] &&
        board[4] === board[8])
        return {status: board[0], btns: [btnsArr[0], btnsArr[4], btnsArr[8]]};
    if (board[2] !== 0 &&
        board[2] === board[4] &&
        board[4] === board[6])
        return {status: board[2], btns: [btnsArr[2], btnsArr[4], btnsArr[6]]}
    return {status: 0};
}

io.on('connection', (socket) => {
    console.log('Client connected: ', socket.id);

    socket.on('find', (data)=> {
        console.log(data);
        if (data.name === null && data.name === "") {
            return;
        }
        arr.push({id: socket.id, name: data.name});

        if (arr.length === 2){
            let p1obj = {
                name: arr[0].name,
                id: arr[0].id,
                value: "X",
                move: ""
            };

            let p2obj = {
                name: arr[1].name,
                id: arr[1].id,
                value: "O",
                move: ""
            };

            let room = {
                p1: p1obj,
                p2: p2obj,
                board: [0, 0 , 0,
                        0, 0, 0,
                        0, 0, 0]
            };

            playingArr.push(room);
            arr.splice(0, 2);

            io.sockets.sockets.get(p1obj.id).emit("room", room);
            io.sockets.sockets.get(p2obj.id).emit("room", room);
        }
    })

    socket.on('click', (data)=> {
        const authorName = data.from;
        const room = data.room;
        const clickId = data.id;
        const opponent = room.p1.name !== authorName ? room.p1 : room.p2;

        room.board = displayClickOnBoard(room.board, clickId, opponent === room.p1 ? 2 : 1);
        const result = checkEnd(room.board);
        console.log(result);
        io.sockets.sockets.get(opponent.id).emit("getClick", {clickId: clickId, room: room});
        if (result.status === 1) {
            io.sockets.sockets.get(opponent.id).emit("getResult", {winner: room.p1, btns: result.btns});
            const author = room.p1.name === authorName ? room.p1 : room.p2;
            io.sockets.sockets.get(author.id).emit("getResult", {winner: room.p1, btns: result.btns});
        } else if (result.status === 2) {
            io.sockets.sockets.get(opponent.id).emit("getResult", {winner: room.p2, btns: result.btns});
            const author = room.p1.name === authorName ? room.p1 : room.p2;
            io.sockets.sockets.get(author.id).emit("getResult", {winner: room.p2, btns: result.btns});
        }
    })
})

server.listen(3001, () => {
    console.log("Listening on port 3000");
})