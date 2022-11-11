let roomTemplate = document.querySelector(".room-template");
let roomContainer = roomTemplate.parentElement;
let socket = io.connect();
let counter = document.querySelector("#counter");

roomTemplate.remove();

async function checkPw(id, pw) {
  const formObject = {};

  formObject["id"] = id;
  formObject["password"] = pw;

  const res = await fetch("/password", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formObject),
  });
  const result = await res.json();
  console.log("fetched result:", result);
  console.log("result length", result.length);
  return result;
}

async function checkPassword(roomID) {
  //TODO check if users have set password for room
  const res = await fetch("/rooms");
  const result = await res.json();
  console.log(result);

  for (let i = 0; i < result.length; i++) {
    if (result[i].id == roomID) {
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
            }
          },
        });
      } else {
        window.location = "/chatroom.html";
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
      node.querySelector(".room-content").textContent = room.content;
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
