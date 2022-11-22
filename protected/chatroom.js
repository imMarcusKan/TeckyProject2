const socket = io.connect(); // You can pass in an optional parameter like "http://localhost:8080"

let url = new URL(window.location.href);
let roomID = url.searchParams.get("roomID");
console.log("roomID:", roomID);

const msgBox = document.querySelector(".message-chat");

let receivedMsg = document.querySelector("#message receiveMsg");
let sentMsg = document.querySelector("#message my-message");
let messagePanel = document.querySelector(".message-panel");

let user_id = document.querySelector("#user_id");
/* send message to the server */
let submitBtn = document.querySelector(".send-message-button");
let message = document.querySelector(".send-message-text");
let navBarRoomID = document.getElementById("navigation-content-roomID");
let navBarTopic = document.getElementById("navigation-content-topic");

var username;

async function isPermittedToThisPage() {
    let res = await fetch(`/getPermissionToRoom?roomID=${roomID}`);
    let result = await res.json();

    return result.status;
}

window.onbeforeunload = function () {
    window.location.href = "/homepage.html";
    console.log("refreshed to homepage");
};

window.onload = async function () {
    let isAccessible = await isPermittedToThisPage();

    if (!isAccessible) {
        location.href = "/homepage.html";
    }

    delTime();
    topic();

    fetch(`/messages/${roomID}`)
        .then((res) => res.json())
        .then((data) => {
            username = data.username;
            console.log("username", username);

            let messages = data.messages;
            for (let message of messages) {
                msgBox.innerHTML += createMsgBox(message, false);
                document
                    .querySelector(".messages-panel")
                    .scrollTo(0, document.querySelector(".messages-panel").scrollHeight);
            }

        });
    return username;
};

async function topic() {
    const res = await fetch(`/topic/${roomID}`);
    const result = await res.json();

    console.log("result.rows", result);

    navBarRoomID.textContent += "Room:" + roomID.toString();
    navBarTopic.textContent += result[0].topic;
}

clearTimeout();

function showUserList(value) {
    console.log("add value to user-list");
    let userlistContainer = document.querySelector("#userlistContainer");

    if (value.length > 0) {
        console.log("v.value:", value.length);

        userlistContainer.innerHTML = "";

        for (let v of value) {
            console.log("for loop");
            userlistContainer.innerHTML += `
      <li class="nav-item d-flex userListClick">
        <img class="w-10" src="${v.profile_pic}" alt=""> 
        <div class="userlist" id=${v.username} >${v.username}</div>
      </li>`;
        }

        let userlist = document.querySelectorAll(".userlist");

        for (let user of userlist) {
            let current_username = user.textContent;
            fetch(`/user-list/${current_username}`)
                .then((res) => res.json())
                .then((data) => {
                    user.addEventListener("click", () => {
                        let loopedHtml = ``;

                        for (let each of data) {
                            if (each.content == null) {
                                loopedHtml += `<div class="content"><div class="create_room_content">開房記錄</div>
              <div class="create_room_count">0</div></div>`;
                            } else {
                                loopedHtml += `<div class="content"><div class="create_room_content">${each.content}</div>
              <div class="create_room_count">${each.count}</div></div>`;
                            }
                        }

                        let htmlElm =
                            `<div class="nameCard">
<div class="profilepic"><img src ="${data[0].profile_pic}" class="container"/></div>
<div class="username">${data[0].username}</div>
<div class="gender">${data[0].gender}</div>` +
                            loopedHtml +
                            `<div class="heart">
  <i class="fa-solid fa-heart fa-beat"></i>
</div>
</div>`;

                        Swal.fire({
                            html: htmlElm,
                            showCloseButton: true,
                            showCancelButton: true,
                            focusConfirm: false,
                        });

                        /* click heart to send invited */
                        let heart = document.querySelector(".heart");

                        heart.addEventListener("click", () => {
                            console.log(username, "clicked heart:", `${data[0].username}`);
                            if (username != data[0].username) {
                                socket.emit("user_invited", {
                                    invitee: data[0].username,
                                    inviter: username,
                                });
                            }
                        });

                    });
                });
        }
    }
}

// inviter get invited
socket.on("getInvited", (data) => {
    // console.log("socket.on(getInvited) is ok");
    // console.log("getInvited by:", data.inviter);
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            cancelButton: "btn btn-danger",
            confirmButton: "btn btn-success",
        },
        buttonsStyling: false,
    });

    swalWithBootstrapButtons
        .fire({
            title: data.inviter,
            text: "邀請你展開激情對話",
            // icon: 'warning',
            imageUrl: "https://unsplash.it/400/200",
            imageWidth: 200,
            imageHeight: 100,
            imageAlt: "Custom image",
            showCancelButton: true,
            confirmButtonText: "Yes, Open Room!",
            cancelButtonText: "No, Reject!",
            reverseButtons: true,
        })
        .then((result) => {
            if (result.isConfirmed) {
                /* 接受 */
                userAccepted(data);
            } else if (
                /* Read more about handling dismissals below */
                result.dismiss === Swal.DismissReason.cancel
            ) {
                /* 拒絕 */
                userRejected(data);
            }
        });
});

/* 接受 one on one chat */
function userAccepted(data) {
    // console.log("userAccepted")
    console.log("userAccepted,data:", data);
    socket.emit("user_accept_invite", {
        data: data,
    });
    //todo : create room and join room （踢user去新room）
    location.href = `/secretroom.html?user_id=${data.invitee}&otheruser=${data.inviter}&socket_id=${data.inviterSocketId}&room_id=${data.inviteeSocketId}${data.inviterSocketId} `;
}

/* got accepted */
socket.on("getAccept", (data) => {
    // todo : 對面接受邀請，踢user去新room
    console.log("getAccept");
    // socket.join()

    location.href = `/secretroom.html?user_id=${data.inviter}&otheruser=${data.invitee}&socket_id=${data.inviteeSocketId}&room_id=${data.inviteeSocketId}${data.inviterSocketId} `;
    // location.href = "/chatroom.html?user_id=" + data.userId;
});

/* 拒絕 one on one chat */
function userRejected(data) {
    console.log("userRejected");
    console.log("data:", data);
    socket.emit("user_reject_invite", {
        data: data,
    });
}

/* got reject */
socket.on("getReject", (data) => {
    console.log("getReject");
    console.log("data:", data);
    let invitee = data.invitee;
    Swal.fire({
        title: data.invitee + "已拒絕你的邀請",
        width: 600,
        padding: "3em",
        color: "#716add",
        backdrop: `
    rgba(0,0,123,0.4)
    url("https://sweetalert2.github.io/images/nyan-cat.gif")
      left top
      no-repeat
    `,
    });
});

socket.on("user-list", (value) => {
    console.log("user-list", value);
    showUserList(value);
});

function deleteDIV(leftUsername) {
    document.querySelector(`#${username}`).remove();
}

async function callUserList() {
    let res = await fetch(`/userlist/${roomID}`, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
    });
}

async function delTime() {
    //TODO check if users have set password for room
    const res = await fetch("/rooms");
    const result = await res.json();

    console.log("result", result);
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

        console.log("delete time", deleteTime);
        console.log("timeDiff", timeDiff);

        if (deleteTime != null) {
            setTimeout(() => {
                window.location.href = "/homepage.html";
            }, timeDiff);
        }

    }
}

let current_user_id;
let socketId = null;

let numUsersInRoom = 0;

let isConnect = true;
let isFromSocket = true;

socket.on("connect", () => {
    console.log("testing connection");
    callUserList();
});

socket.on("hello_user", (data) => {
    current_user_id = data.userId;
    socketId = data.socketId;
    console.log("user:", current_user_id, "(socketId):", socketId);
});

// "current_pages"
socket.emit("join_room", { room: roomID });
socket.emit("current_pages", {
    current_pages: "chat_room",
    current_room: roomID,
});

socket.on("receive_data_from_server", (data) => {
    console.log("data.sendUser", data.sendUser);
    console.log("current_user", current_user_id);

    msgBox.innerHTML += createMsgBox(data, true);

    document
        .querySelector(".messages-panel")
        .scrollTo(0, document.querySelector(".messages-panel").scrollHeight);
});

/* (listen) notify other clients someone join */
socket.on("user_joined", (data) => {
    if (roomID == data.roomID) {
        showToast(data.userId, true);
    }
});

/* (listen)notify other clients someone left */
socket.on("user_left", (data) => {
    console.log("showToast:", data.userId, "left");
    deleteDIV(data.userId);
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
    let date = Date.now();
    socket.emit("user_message", { data: message.value, roomID, date });
    message.value = "";
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

function createMsgBox(data, isFromSocket) {
    let time = isFromSocket
        ? convertToTime(data.msgTime)
        : convertToTime(data.created_at);

    let sender = isFromSocket ? data.sendUser : data.username;
    let message = isFromSocket ? data.receivedData.data : data.content;

    return `
    <div class="message ${sender !== username ? "receiveMsg" : "my-message"}">
        <div class="message-body">
            <div class="message-info">
                <h4> ${sender} </h4>
                <h5> <i class="fa fa-clock-o"></i> ${time} </h5>
            </div>
            <hr>
            <div class="message-text">
               ${message}
            </div>
        </div>
        <br>
    </div>
    `;
}
