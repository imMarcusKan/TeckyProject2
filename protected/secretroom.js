const socket = io.connect(); // You can pass in an optional parameter like "http://localhost:8080"

let submitBtn = document.querySelector(".send-message-button");
let message = document.querySelector(".send-message-text");
let url = new URL(window.location.href);
let user_id = url.searchParams.get("user_id");
let otherUser = url.searchParams.get("otheruser");
let socketID = url.searchParams.get("socket_id");
const msgBox = document.querySelector(".message-chat");

let receivedMsg = document.querySelector("#message receiveMsg");
let sentMsg = document.querySelector("#message my-message");
let messagePanel = document.querySelector(".message-panel");

/* send message to the server */
let navBarRoomID = document.getElementById("navigation-content-roomID");
let navBarTopic = document.getElementById("navigation-content-topic");

var username;
window.onload = function () {
  fetch("/secretmessage")
    .then((res) => res.json())
    .then((data) => {
      username = data[0].username;
    });
};

console.log(user_id, otherUser, socketID);
socket.on("connect", () => {
  console.log("connected to secret room");
});

submitBtn.addEventListener("click", () => {
  if (!message.value) {
    return;
  }
  sendMessage();
});

message.addEventListener("keypress", (event) => {
  if (!message.value) {
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});

function sendMessage() {
  socket.emit("secretmessage", {
    data: message.value,
    user_id,
    otherUser,
    socketID,
  });
  message.value = "";
}

socket.on("sentSecret", (data) => {
  console.log("sentSecret", data);
  msgBox.innerHTML += createMsgBox(data);
});

function createMsgBox(data) {
  let time = convertToTime(Date.now());
  return `
      <div class="message ${
        data.data.user_id !== username ? "receiveMsg" : "my-message"
      }">
          <div class="message-body">
              <div class="message-info">
                  <h4> ${data.data.user_id} </h4>
                  <h5> <i class="fa fa-clock-o"></i> ${time} </h5>
              </div>
              <hr>
              <div class="message-text">
                 ${data.data.data}
              </div>
          </div>
          <br>
      </div>
      `;
}

function convertToTime(time) {
  let times = new Date(time);
  let hours = times.getHours();
  let minutes = times.getMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}
