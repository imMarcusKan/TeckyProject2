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

async function getID() {
  const res = await fetch("/userID");
  const data = await res.json();
  let userID = data.id;
  console.log(data.id);
  return userID;
}

let userID;

window.onload = async function () {
  console.log("onload window to set timeout");
  delTime();
  userID = await getID();
};

window.onload = fetch(`/messages/${roomID}`)
  .then((res) => res.json())
  .then((messages) => {
    console.log(messages);
    for (let message of messages) {
      msgBox.innerHTML += createMessage(message);
    }
  });

// if ((message.id = userID)) {
//   let node = sentMsg.cloneNode(true);
//   node.querySelector(
//     ".message-info"
//   ).innerHTML = `<h4>${message.username}</h4><h5> <i class="fa fa-clock-o"></i>${message.created_at}</h5>`;
//   node.querySelector(".message-text").textContent = message.content;
//   msgBox.appendChild(node);
// } else {
//   let node = receivedMsg.cloneNode(true);
//   node.querySelector(
//     ".message-info"
//   ).innerHTML = `<h4 id=${message.id}>${message.username}</h4><h5> <i class="fa fa-clock-o"></i>${message.created_at}</h5>`;
//   node.querySelector(".message-text").textContent = message.content;
//   msgBox.appendChild(node);
// }

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

// let time = await delTime();
// let deleteTime = new Date(time);
// let timeDiff = deleteTime.getTime() - Date.now();
// console.log("timeDiff:", timeDiff);

// window.onload = function () {
//   setTimeout(() => {
//     window.location.href = "/homepage.html";
//     console.log(timeDiff);
//   }, 30000);
// };

//Set time out to kick user back to homepage when room is expired

// let msg = [
//   {
//     user_id: 1,
//     nickname: "Hardy",
//     content: "Let's go shopping!",
//     time: "2:25PM",
//   },
//   {
//     user_id: 2,
//     nickname: "Marcus",
//     content: "Where shall we go?",
//     time: "2:28PM",
//   },
//   { user_id: 3, nickname: "Dennis", content: "MegaBox", time: "2:32PM" },
// ];

// console.log(user_id);

let current_user_id;

let numUsersInRoom = 0;

let isConnect = true;

socket.on("hello_user", (data) => {
  // data has the content { msg: "Hello Client" }
  console.log(data);
  current_user_id = data.userId;
});

// "current_pages"
socket.emit("join_room", { room: "room-A", pw: "ok" });
socket.emit("current_pages", {
  current_pages: "chat_room",
  current_room: "room-A",
});

socket.on("receive_data_from_server", (data) => {
  // data has the content { msg: "Hello Client" }
  // console.log(data)
  // console.log(data.sendUser);
  // console.log(current_user_id);
  // msgBox.innerHTML += showToast();
  // $('.toast').toast('show');
  // showToast();

  msgBox.innerHTML += creatMsgBox(data);
  document
    .querySelector(".messages-panel")
    .scrollTo(0, document.querySelector(".messages-panel").scrollHeight);
});

/* (listen) notify other clients someone join */
socket.on("user_joined", (data) => {
  // data has the content { msg: "Hello Client" }
  // console.log("jointed la:", data.userId);
  console.log("showToast:", data.userId, "connected");
  showToast(data.userId, true);
});

/* (listen)notify other clients someone left */
socket.on("user_left", (data) => {
  console.log("showToast:", data.userId, "left");
  showToast(data.userId, false);
});

function showToast(username, isConnect) {
  /* (library) https://github.com/apvarun/toastify-js */
  // console.log("showToast:", username, isConnect);
  Toastify({
    text: `${username} has ${isConnect ? "enter" : "left"} the room`,
    duration: 3000,
  }).showToast();
}

submitBtn.addEventListener("click", () => {
  // console.log(message.value);
  // fetch('/message', {
  //     method:'POST',
  //     headers: {
  //         'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({message: message.value})

  // })

  socket.emit("user_message", { data: message.value, roomID });
});

function creatMsgBox(data) {
  return `
    <div class="message ${
      data.sendUser !== current_user_id ? "receiveMsg" : "my-message"
    }">
        <div class="message-body">
            <div class="message-info">
                <h4> ${data.sendUser} </h4>
                <h5> <i class="fa fa-clock-o"></i> 2:25pm </h5>
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
  return `
    <div class="message ${
      data.username !== current_user_id ? "receiveMsg" : "my-message"
    }">
        <div class="message-body">
            <div class="message-info">
                <h4> ${data.username} </h4>
                <h5> <i class="fa fa-clock-o"></i> ${data.created_at} </h5>
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
//testing

// async function exitroom() {
//   const a = await fetch("/userID");
//   const data = await a.json();
//   let userID = data.id;

//   const formObject = {};

//   formObject["userID"] = userID;

//   const res = await fetch("/record", {
//     method: "delete",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(formObject),
//   });
// }

// let leaveroom = exitroom();
// window.addEventListener("beforeunload", (event) => {
//   exitroom();
// });
