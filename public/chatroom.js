const socket = io.connect(); // You can pass in an optional parameter like "http://localhost:8080"
let url = new URL(window.location.href);
let roomID = url.searchParams.get("roomID");

fetch(`/messages/${roomID}`)
  .then((res) => res.json())
  .then((messages) => {
    console.log(messages);
  });

clearTimeout();

async function delTime() {
  //TODO check if users have set password for room
  const res = await fetch("/rooms");
  const result = await res.json();
  for (let i = 0; i < result.length; i++) {
    if (result[i].id == roomID) {
      console.log("v.id:", result[i].id);
      deleteTime = new Date(result[i].deleted_at);
      timeDiff = deleteTime.getTime() - Date.now();
    }
  }
  setInterval(() => {
    console.log(timeDiff);
  }, 1000);
  setTimeout(() => {
    window.location.href = "/homepage.html";
  }, timeDiff);
}
window.onload = function () {
  console.log("onload window to set timeout");
  delTime();
};

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
const msgBox = document.querySelector(".message-chat");

let receivedMsg = document.querySelector("#message receiveMsg");
let sentMsg = document.querySelector("#message my-message");

let user_id = document.querySelector("#user_id");

// console.log(user_id);

// send message to the server
let submitBtn = document.querySelector(".send-message-button");
let message = document.querySelector(".send-message-text");

let current_user_id;

submitBtn.addEventListener("click", () => {
  // console.log(message.value);
  // fetch('/message', {
  //     method:'POST',
  //     headers: {
  //         'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({message: message.value})

  // })

  socket.emit("user_message", { data: message.value });
});

socket.on("hello_user", (data) => {
  // data has the content { msg: "Hello Client" }
  console.log(data);
  current_user_id = data.userId;
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

socket.on("user_joined", (data) => {
  // data has the content { msg: "Hello Client" }
  console.log("jointed la:", data.userId);
  showToast(data.userId);
});

function creatMsgBox(data) {
  return `
    <div class="message ${
      data.sendUser !== current_user_id ? "receiveMsg" : "my-message"
    }">
        <div class="message-body">
            <div class="message-info">
                <h4> ${data.sendUser} </h4>
                <h5> <i class="fa fa-clock-o"></i> 2:25 PM </h5>
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

function showToast(username) {
  // (library) https://github.com/apvarun/toastify-js
  Toastify({
    text: `${username} has enter the room`,
    duration: 3000,
  }).showToast();
}

//testing

async function exitroom() {
  const a = await fetch("/userID");
  const data = await a.json();
  let userID = data.id;

  const formObject = {};

  formObject["userID"] = userID;

  const res = await fetch("/record", {
    method: "delete",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formObject),
  });
}

let leaveroom = exitroom();
window.addEventListener("beforeunload", (event) => {
  exitroom();
});
