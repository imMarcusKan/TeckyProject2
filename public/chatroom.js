const socket = io.connect(); // You can pass in an optional parameter like "http://localhost:8080"
let url = new URL(window.location.href);
console.log(url);
let roomID = url.searchParams.get("roomID");

fetch(`/messages/${roomID}`)
  .then((res) => res.json())
  .then((messages) => {
    console.log(messages);
  });
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

/* send message to the server */
let submitBtn = document.querySelector(".send-message-button");
let message = document.querySelector(".send-message-text");

let current_user_id;

let numUsersInRoom =0;

let isConnect = true;

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

// (listen) notify other clients someone join
socket.on("user_joined", (data) => {
  // data has the content { msg: "Hello Client" }
  // console.log("jointed la:", data.userId);
  console.log("showToast:", data.userId, "connected");
  showToast(data.userId, true);
});

/* (listen)notify other clients someone left */
socket.on("user_left", (data) =>{
  console.log("showToast:", data.userId, "left");
  showToast(data.userId, false);
});

function showToast(username, isConnect) {
  /* (library) https://github.com/apvarun/toastify-js */
  // console.log("showToast:", username, isConnect);
  Toastify({
    text: `${username} has ${isConnect? "enter" : "left"} the room`,
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

  socket.emit("user_message", { data: message.value });
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
