const socket = io.connect(); // You can pass in an optional parameter like "http://localhost:8080"
let url = new URL(window.location.href);
let roomID = url.searchParams.get("roomID");
const msgBox = document.querySelector(".message-chat");

let receivedMsg = document.querySelector("#message receiveMsg");
let sentMsg = document.querySelector("#message my-message");
let messagePanel = document.querySelector(".message-panel");

let user_id = document.querySelector("#user_id");
/* send message to the server */
let submitBtn = document.querySelector(".send-message-button");
let message = document.querySelector(".send-message-text");

var username;

window.onload = function () {
  delTime();
  fetch(`/messages/${roomID}`)
    .then((res) => res.json())
    .then((data) => {
      username = data.username;
      console.log("username", username);
      let messages = data.messages;
      for (let message of messages) {
        msgBox.innerHTML += createMessage(message);
      }
    });
  return username;
};

clearTimeout();

async function delTime() {
  //TODO check if users have set password for room
  const res = await fetch("/rooms");
  const result = await res.json();
  for (let i = 0; i < result.length; i++) {
    let deleteTime;
    let timeDiff;
    if (result[i].id == roomID) {
      if (result[i].deleted_at == null) {
        deleteTime = null;
      } else {
        deleteTime = new Date(result[i].deleted_at);
        timeDiff = deleteTime.getTime() - Date.now();
      }
    }
    if (deleteTime == null) {
      return;
    } else {
      setTimeout(() => {
        window.location.href = "/homepage.html";
      }, timeDiff);
    }
  }
}

let current_user_id;

let numUsersInRoom = 0;

let isConnect = true;

socket.on("hello_user", (data) => {
  current_user_id = data.userId;
});

// "current_pages"
socket.emit("join_room", { room: roomID, pw: "ok" });
socket.emit("current_pages", {
  current_pages: "chat_room",
  current_room: roomID,
});

socket.on("receive_data_from_server", (data) => {
  console.log("data.sendUser", data.sendUser);
  console.log("current_user", current_user_id);
  msgBox.innerHTML += creatMsgBox(data);
  document
    .querySelector(".messages-panel")
    .scrollTo(0, document.querySelector(".messages-panel").scrollHeight);
});

/* (listen) notify other clients someone join */
socket.on("user_joined", (data) => {
  if (roomID == data.roomID){
    showToast(data.userId, true);
  }
});

/* (listen)notify other clients someone left */
socket.on("user_left", (data) => {
  console.log("showToast:", data.userId, "left");
  showToast(data.userId, false);
});

function showToast(username, isConnect) {
  /* (library) https://github.com/apvarun/toastify-js */
  Toastify({
    text: `${username} has ${isConnect ? "enter" : "left"} the room`,
    duration: 3000,
  }).showToast();
}

submitBtn.addEventListener("click", () => {
  if (!message.value) {
    console.log("no value sent");
    return;
  }
  let date = Date.now();
  socket.emit("user_message", { data: message.value, roomID, date });
  message.value = "";
});

message.addEventListener("keypress", (event) => {
  if (!message.value) {
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    let date = Date.now();
    socket.emit("user_message", { data: message.value, roomID, date });
    message.value = "";
  }
});

function convertToTime(time) {
  let times = new Date(time);
  let hours = times.getHours();
  let minutes = times.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}

function creatMsgBox(data) {
  let time = convertToTime(data.msgTime);

  return `
    <div class="message ${
      data.sendUser !== username ? "receiveMsg" : "my-message"
    }">
        <div class="message-body">
            <div class="message-info">
                <h4> ${data.sendUser} </h4>
                <h5> <i class="fa fa-clock-o"></i> ${time} </h5>
            </div>
            <hr>
            <div class="message-text">
               ${data.receivedData.data}
            </div>
        </div>
        <br>
    </div>
    `;
}

function createMessage(data) {
  let time = convertToTime(data.created_at);

  return `
    <div class="message ${
      data.username !== username ? "receiveMsg" : "my-message"
    }">
        <div class="message-body">
            <div class="message-info">
                <h4> ${data.username} </h4>
                <h5> <i class="fa fa-clock-o"></i> ${time} </h5>
            </div>
            <hr>
            <div class="message-text">
               ${data.content}
            </div>
        </div>
        <br>
    </div>
    `;
}
