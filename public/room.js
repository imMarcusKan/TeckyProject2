let roomTemplate = document.querySelector(".room-template");
let roomContainer = roomTemplate.parentElement;
let socket = io.connect();
let counter = document.querySelector("#counter");

socket.emit("current_pages", { current_pages: "home_page" });

roomTemplate.remove();

async function checkPw(id, pw) {
  const formObject = {};

  formObject["roomID"] = id;
  formObject["password"] = pw;
  console.log(formObject);
  const res = await fetch("/password", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formObject),
  });
  const result = await res.json();

  return result;
}

async function getID() {
  const res = await fetch("/userID");
  const data = await res.json();
  let userID = data.id;
  console.log(data.id);
  return userID;
}

let userID;

window.onload = async () => {
  userID = await getID();
  console.log(userID);
};

async function getRoomStatus() {
  const res = await fetch("/room_status");
  const result = await res.json();
  return result;
}

async function checkRoomStatus(userID, roomID) {
  const formObject = {};

  formObject["userID"] = userID;
  formObject["roomID"] = roomID;

  const res = await fetch("/user_room_ID", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formObject),
  });
}

async function checkPassword(roomID) {
  //TODO check if users have set password for room
  const res = await fetch("/rooms");
  const result = await res.json();
  console.log("result now", result);
  let data = await getRoomStatus();
  for (let i = 0; i < result.length; i++) {
    if (result[i].id == roomID) {
      if (result[i].haspassword) {
        const { value: password } = await Swal.fire({
          title: "Enter your password",
          name: "password",
          input: "text",
          inputLabel: "Password",
          inputPlaceholder: "Enter your password",
          inputAttributes: {
            maxlength: 10,
            autocapitalize: "off",
            autocorrect: "off",
          },
          inputValidator: async (password) => {
            let result = await checkPw(roomID, password);
            if (result.length == 0) {
              return "wrong password";
            } else {
              location.href = `/chatroom.html?roomID=${roomID}`;
              console.log("forward to chatroom page");
              // checkRoomStatus(userID, roomID);
            }
          },
        });
      } else {
        location.href = `/chatroom.html?roomID=${roomID}`;
        console.log("forward to chatroom page");

        // checkRoomStatus(userID, roomID);
      }
    }
  }
}
function checkHead(value) {
  let a = true;
  console.log(value);
  console.log(value[0]);
  console.log(value[2]);
  if (value[0] >= value[2]) {
    Swal.fire("Room is fulled!");
    a = false;
  }
  return a;
}

function setCategory(type) {
  let str;
  if (type == 1) {
    str = "吹水台";
  } else if (type == 2) {
    str = "心事台";
  } else if (type == 3) {
    str = "體育台";
  } else {
    str = "電玩台";
  }
  return str;
}
async function selectCate(category) {
  const formObject = {};

  formObject["categoryID"] = category;
  console.log("category", category);
  const res = await fetch("/category", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formObject),
  });
  const value = await res.json();
  console.log("value", value);

  createRoom(value);
}

async function createRoom(input) {
  let data = await getRoomStatus();
  let roomArr = input;

  roomContainer.textContent = "";
  for (let room of roomArr) {
    let str = setCategory(room.category_id);
    //clone room design and add info.
    let node = roomTemplate.cloneNode(true);
    let roomStatus = node.querySelector(".room-headcount");

    if ("dev") {
      node.querySelector(".room-category").textContent = str;
      node.querySelector(".room-id").textContent = `ROOM: ${room.id}`;
      node.querySelector(".room-content").textContent = room.topic;
      node.querySelector(".room-button button").onclick = () => {
        let a = checkHead(node.querySelector(".room-headcount").textContent);
        if (!a) {
          Swal.fire("Room is fulled!");
          return;
        } else {
          checkPassword(room.id);
        }
      };

      roomStatus.textContent = `0/${room.headcount}`;
      // roomStatus.textContent = `0/${room.headcount}`;
      node.querySelector(".room-design .lock").hidden = !room.password;
    } else {
      node.querySelector(
        ".room-id"
      ).innerHTML = `<div id="id${room.id}">ROOM: ${room.id}</div>`;
    }
    let timeRemain = node.querySelector(".time-remain");
    let setup = () => {
      let deleteTime;
      let timeDiff;
      // get time to compare
      if (room.deleted_at == null) {
        deleteTime = null;
      } else {
        deleteTime = new Date(room.deleted_at);
        timeDiff = deleteTime.getTime() - Date.now();
      }

      if (timeDiff <= 0) {
        node.remove();
        clearInterval(setup);
        return;
      }
      // if (headcount.roomID > room.headcount) {
      //   return "room is fulled";
      // } else {
      //   roomStatus.textContent = `${headcount.roomID}/${room.headcount}`;
      // }
      if (deleteTime == null) {
        timeRemain.textContent = `No Limit Time`;
      } else {
        let time = new Date(timeDiff);
        let minutes = time.getMinutes();
        timeRemain.textContent = `time remaining: ${minutes} minutes`;
      }
    };
    let timer = setInterval(setup, 2000);
    setup();

    roomContainer.prepend(node);
  }
}

function updateRoom(value) {
  let rooms = document.querySelectorAll(".room-design");
  console.log(rooms);
  for (let room of rooms) {
    let room_id = room
      .querySelector(".room-id")
      .textContent.replace("ROOM: ", "");
    console.log(room_id);
    console.log(value[room_id]);
    if (value[room_id]) {
      console.log("here");
      let counts = room.querySelector(".room-headcount").textContent.split("/");
      console.log({ counts });
      counts[0] = value[room_id];
      room.querySelector(".room-headcount").textContent = counts.join("/");
    }
  }
}

socket.on("new-room", (value) => {
  createRoom(value);
  console.log("value", value);
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

socket.on("room_status", (value) => {
  console.log("room_status", value);
  updateRoom(value);
});

socket.on("connect", () => {
  console.log("connected to socket.io server");
  callRoomRouter();
});
