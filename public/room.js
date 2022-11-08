let roomTemplate = document.querySelector(".room-template");
let roomContainer = roomTemplate.parentElement;
let socket = io.connect();
let counter = document.querySelector("#counter");

roomTemplate.remove();

// async function createRoom() {
//   const res = await fetch("/room");
//   const roomArr = await res.json();
//   console.log("roomArr", roomArr);
//   for (let room of roomArr) {
//     console.log("room", room);
//     let node = roomTemplate.cloneNode(true);
//     node.querySelector(".room-button").textContent = room.content;
//     roomContainer.prepend(node);
//   }
// }

// createRoom();

function createRoom(input) {
  let roomArr = input;
  roomContainer.textContent = "";
  for (let room of roomArr) {
    let node = roomTemplate.cloneNode(true);
    node.querySelector(".room-button").textContent = room.content;
    roomContainer.prepend(node);
  }
}

socket.on("new-room", (value) => {
  console.log(value);
  createRoom(value);
  // roomContainer.prepend(node);
});

socket.on("connect", () => {
  console.log("connected to socket.io server");
  callServer();
});

async function callServer() {
  let res = await fetch("/room", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
}
