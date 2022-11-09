let roomTemplate = document.querySelector(".room-template");
let roomContainer = roomTemplate.parentElement;
let socket = io.connect();
let counter = document.querySelector("#counter");

roomTemplate.remove();

function removeNode(input) {
  input.remove();
}

function createRoom(input) {
  let roomArr = input;

  roomContainer.textContent = "";
  for (let room of roomArr) {
    let node = roomTemplate.cloneNode(true);
    node.querySelector(".room-id").textContent = room.id;
    node.querySelector(".room-content").textContent = room.content;
    //TOGO headcount, waiting for log-in system to link up db to present how many people accessed chat room
    node.querySelector(".room-headcount").textContent = `1/${room.headcount}`;
    roomContainer.prepend(node);
  }
  setTimeout(removeNode(node, input.timer));
}

socket.on("new-room", (value) => {
  createRoom(value);
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
