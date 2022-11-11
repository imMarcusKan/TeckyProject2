let roomTemplate = document.querySelector(".room-template");
let roomContainer = roomTemplate.parentElement;
let socket = io.connect();
let counter = document.querySelector("#counter");

roomTemplate.remove();

async function checkPw(id, pw) {
  const formObject = {};

  formObject["roomID"] = id;
  formObject["password"] = pw;

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
  userID = (await getID()).id;
};

async function checkRoomStatus() {
  const res = await fetch("/room_status");
  const result = await res.json();
  let roomHeadCount = result.roomstatus;
  return roomHeadCount;
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
  console.log(result);
  // let roomHeadCount = await checkRoomStatus();
  // console.log(roomHeadCount);

  for (let i = 0; i < result.length; i++) {
    if (result[i].id == roomID) {
      // if (roomHeadCount >= result[i].headcount) {
      //   return "room is fulled";
      // }
      if (result[i].haspassword == true) {
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
              window.location = "/chatroom.html";
              checkRoomStatus(userID, roomID);
            }
          },
        });
      } else {
        window.location = "/chatroom.html";
        checkRoomStatus(userID, roomID);
      }
    }
  }
}

function createRoom(input) {
  let roomArr = input;

  roomContainer.textContent = "";
  for (let room of roomArr) {
    //clone room design and add info.
    let node = roomTemplate.cloneNode(true);

    if ("dev") {
      node.querySelector(".room-id").textContent = `ROOM: ${room.id}`;
      node.querySelector(".room-content").textContent = room.topic;
      node.querySelector(".room-headcount").textContent = `1/${room.headcount}`;
      node.querySelector(".room-button button").onclick = () =>
        checkPassword(room.id);
      node.querySelector(".room-design .lock").hidden = !room.password;
    } else {
      node.querySelector(
        ".room-id"
      ).innerHTML = `<div id="id${room.id}">ROOM: ${room.id}</div>`;
    }
    let timeRemain = node.querySelector(".time-remain");
    let setup = () => {
      // get time to compare
      let deleteTime = new Date(room.deleted_at);
      let timeDiff = deleteTime.getTime() - Date.now();

      if (timeDiff <= 0) {
        node.remove();
        clearInterval(setup);
        return;
      }
      let time = new Date(timeDiff);
      let minutes = time.getMinutes();
      timeRemain.textContent = `time remaining: ${minutes} minutes`;
    };
    let timer = setInterval(setup, 1000);
    setup();

    roomContainer.prepend(node);
    // set timeout if room has time limit
    // set lock icon if room has password
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
