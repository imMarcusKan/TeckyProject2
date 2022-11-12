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
  console.log(result);
  let data = await getRoomStatus();
  console.log("roomHeadCount:", data);

  for (let i = 0; i < result.length; i++) {
    if (result[i].id == roomID) {
      for (let v of data) {
        if (v.room_id == roomID) {
          console.log(result[i].id, v.room_id, roomID);
          if (v.roomstatus >= result[i].headcount) {
            console.log("data roomstatus", data[i].roomstatus);
            Swal.fire("The room is fulled");
            return;
          }
        }
      }
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

async function createRoom(input) {
  let data = await getRoomStatus();
  let roomArr = input;

  roomContainer.textContent = "";
  for (let room of roomArr) {
    //clone room design and add info.
    let node = roomTemplate.cloneNode(true);
    let roomStatus = node.querySelector(".room-headcount");

    if ("dev") {
      node.querySelector(".room-id").textContent = `ROOM: ${room.id}`;
      node.querySelector(".room-content").textContent = room.topic;
      node.querySelector(".room-button button").onclick = () =>
        checkPassword(room.id);
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
      // get time to compare
      let deleteTime = new Date(room.deleted_at);
      let timeDiff = deleteTime.getTime() - Date.now();

      if (timeDiff <= 0) {
        node.remove();
        clearInterval(setup);
        return;
      }
      for (let i = 0; i < data.length; i++) {
        if (data[i].room_id == room.id) {
          console.log("room status, head:", data[i].roomstatus);
          if (data[i].room_id > 0) {
            roomStatus.textContent = `${data[i].roomstatus}/${room.headcount}`;
          }
        }
      }
      let time = new Date(timeDiff);
      let minutes = time.getMinutes();
      timeRemain.textContent = `time remaining: ${minutes} minutes`;
    };
    let timer = setInterval(setup, 2000);
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
