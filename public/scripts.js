document.getElementById("loading").style.display = "none";
document.getElementById("players").style.display = "none";
document.getElementById("statistics").style.display = "none";
document.getElementById("bigCont").style.display = "none";
document.getElementById("resultCont").style.display = "none";

const socket = io();

let playing = false;
let name;
let roomObj;

document.getElementById("find").addEventListener('click', function(){
    name = document.getElementById("name").value;
    console.log(name);
    if(name == null || name === ""){
        alert("Please enter a name");
        return;
    }

    document.getElementById("user").innerText = name;

    socket.emit("find", {name: name});

    document.getElementById("loading").style.display = "block";
    document.getElementById("find").disabled = true;
})

document.getElementById("cont").addEventListener('click', (e) => {
    e.preventDefault();
    if (!playing) return;
    if (!e.target.classList.contains('btn')) return;
    if (document.getElementById("value").innerText !== document.getElementById("turn").innerText) return;
    if (e.target.innerText !== "") return;

    e.target.innerText = document.getElementById("value").innerText;
    e.target.classList.toggle("my-btn");
    console.log("innerText: ", e.target.innerText);

    const id = e.target.id;
    console.log(id);
    document.getElementById('turn').innerText = document.getElementById('turn').innerText === 'O'? 'X' : 'O';


    socket.emit("click", {from: name, id: id, room: roomObj});
})

socket.on("room", (room) => {
    console.log(room);
    roomObj = room;
    playing = true;

    document.getElementById('nameCont').style.display = "none";
    document.getElementById("find").style.display = "none";
    document.getElementById("loading").style.display = "none";
    document.getElementById("players").style.display = "flex";
    document.getElementById("statistics").style.display = "flex";
    document.getElementById("bigCont").style.display = "block";

    const me = (room.p1.name === name) ? room.p1 : room.p2;
    const opponent = (room.p1.name === name) ? room.p2 : room.p1;

    document.documentElement.setAttribute("data-value", me.value);

    document.getElementById("opponent").innerText = opponent.name;
    document.getElementById("value").innerText = me.value;
})

socket.on("getClick", (data) => {
    roomObj = data.room;
    const btn = document.getElementById(data.clickId);
    btn.innerText = document.getElementById("value").innerText === 'X'? 'O' : 'X';
    document.getElementById('turn').innerText = document.getElementById('turn').innerText === 'O'? 'X' : 'O';
})

socket.on("getResult", (data) => {
    console.log(data)
    const winner = data.winner;
    playing = false;

    for (let i = 0; i < 3; i++) {
        const btn = document.getElementById(data.btns[i]);
        if (winner.value === 'X') btn.classList.add("x-won");
        else btn.classList.add("o-won");
    }

    document.getElementById("result").innerText = winner.name;
    document.getElementById("resultCont").style.display = "block";
})

