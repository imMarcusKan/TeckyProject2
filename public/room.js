let roomTemplate = document.querySelector(".room-template");
let roomContainer = roomTemplate.parentElement;
let socket = io.connect();
let counter = document.querySelector("#counter");
// const fns = require("date-fns");

roomTemplate.remove();

function countDown(value) {
  let currentTime = new Date(Date.now());
  for (let x of value) {
    let deleteTime = new Date(x.deleted_at);
    let timeDiff = deleteTime.getTime() - currentTime.getTime();
    let time = new Date(timeDiff);
    let minutes = time.getMinutes();
    //break
    let target = (document.getElementById(
      "time@" + x.id
    ).textContent = `time remaining: ${minutes} minutes`);
  }
  console.log("remaining time updated");
}

// setInterval(countDown(result), 5000);

function createRoom(input) {
  let roomArr = input;
  let currentTime = new Date(Date.now());

  roomContainer.textContent = "";
  for (let room of roomArr) {
    let deleteTime = new Date(room.deleted_at);
    let timeDiff = deleteTime.getTime() - currentTime.getTime();
    let time = new Date(timeDiff);
    let minutes = time.getMinutes();
    console.log("min", minutes);
    let node = roomTemplate.cloneNode(true);
    node.querySelector(
      ".room-id"
    ).innerHTML = `<div id="id${room.id}">ROOM: ${room.id}</div>`;
    node.querySelector(".room-content").textContent = room.content;
    //TOGO headcount, waiting for log-in system to link up db to present how many people accessed chat room
    node.querySelector(".room-headcount").textContent = `1/${room.headcount}`;
    node.querySelector(
      ".time-remain"
    ).innerHTML = `<div id="time@${room.id}">room remaining time: ${minutes} minutes</div>`;
    roomContainer.prepend(node);
    setTimeout(() => {
      node.remove();
    }, timeDiff);
    //To check time, and remove node if delete time is exceeded
    // if (deleteTime > currentTime) {
    //   node.remove();
    //   return;
    // }
    console.log("running function createRoom");
  }
}

socket.on("new-room", (value) => {
  createRoom(value);
});
socket.on("interval", (value) => {
  countDown(value);
});

async function callRoomRouter() {
  let res = await fetch("/room", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
}

socket.on("connect", () => {
  console.log("connected to socket.io server");
  callRoomRouter();
});
