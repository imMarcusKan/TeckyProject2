let roomTemplate = document.querySelector(".room-template");
let roomContainer = roomTemplate.parentElement;

roomTemplate.remove();

async function createRoom() {
  const res = await fetch("/room");
  const roomArr = await res.json();
  console.log("roomArr", roomArr);
  for (let room of roomArr) {
    console.log("room", room);
    let node = roomTemplate.cloneNode(true);
    node.querySelector(".room-button").textContent = room.content;
    roomContainer.prepend(node);
  }
}

createRoom();
