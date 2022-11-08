let roomTemplate = document.querySelector(".room-template");
let roomContainer = roomTemplate.parentElement;
let socket = io.connect();
let counter = document.querySelector("#counter");

roomTemplate.remove();

function createRoom(input) {
  let roomArr = input;
  roomContainer.textContent = "";
  for (let room of roomArr) {
    let node = roomTemplate.cloneNode(true);
    let str = `room:${room.content}`;
    node.querySelector(".room-button").innerHTML = str;
    roomContainer.prepend(node);
  }
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
