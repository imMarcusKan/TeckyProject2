let socket = io.connect();

let counter = document.querySelector("#counter");
let roomTemplate = document.querySelector(".room-template");
let createRoomBtn = document.querySelector(".functionBtn");

let roomContainer = roomTemplate.parentElement;


socket.emit("current_pages", { current_pages: "home_page" });

roomTemplate.remove();

async function quick() {
    const res = await fetch("/quick");
    const result = await res.json();
    location.href = `/chatroom.html?roomID=${result.id}`;
}

async function search() {
    const { value: content } = await Swal.fire({
        title: "Search by keywords",
        input: "text",
        inputLabel: "Search by keywords",
        inputPlaceholder: "Search",
    });

    console.log("front:", content);

    if (!content) {
        Swal.fire("Enter something to search!");
        return;
    }

    const formObject = {};
    formObject["content"] = content;
    console.log("formObject", content);

    const res = await fetch("/search", {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formObject),
    });

    const result = await res.json();
    createRoom(result);

    let arr = document.querySelectorAll(".room-design");
    if (arr.length == 0) {
        document.querySelector(".room-container").textContent =
            "   Sorry! No relevant content :(";
    }
}

function showAll() {
    location.reload();
}

function public() {
    location.href = `/chatroom.html?roomID=1`;
}

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

    return userID;
}

let userID;

window.onload = async () => {
    userID = await getID();
    let result = await getRoomStatus();
    updateRoomWhenLoadedPage(result); //looking for headcount value
};

async function getRoomStatus() {
    const res = await fetch("/room_status");
    const result = await res.json();

    return result;
}

async function checkPassword(roomID) {
    //TODO check if users have set password for room
    const res = await fetch("/rooms");
    const result = await res.json();

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
                        }
                        else {
                            location.href = `/chatroom.html?roomID=${roomID}`;
                            console.log("forward to chatroom page");
                        }

                    },
                });

            }
            else {
                location.href = `/chatroom.html?roomID=${roomID}`;
                console.log("forward to chatroom page");
            }
        }
    }
}

function checkHead(value) {
    // let a = true;

    let current = value.substring(0, 1);
    let total = value.substring(2);

    if (value[5]) {
        a = false;
        return;
    }

    if (+current >= total) {
        a = false;
    }
    else {
        a = true;
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
    const res = await fetch("/category", {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formObject),
    });

    const value = await res.json();
    createRoom(value);
}

async function createRoom(input) {
    // let data = await getRoomStatus();
    let roomArr = input;

    roomContainer.textContent = "";
    for (let room of roomArr) {

        let str = setCategory(room.category_id);

        //clone room design and add info.
        let node = roomTemplate.cloneNode(true);
        let roomStatus = node.querySelector(".room-headcount");

        if ("dev") { //true
            node.querySelector(".room-category").textContent = str;
            node.querySelector(".room-id").textContent = `ROOM: ${room.id}`;
            node.querySelector(".room-content").textContent = room.topic;

            node.querySelector(".room-button button").onclick = () => {
                let a = checkHead(node.querySelector(".room-headcount").textContent);

                if (a) {
                    checkPassword(room.id);
                    return;
                } else {
                    Swal.fire("Fulled!");
                }
            };

            roomStatus.textContent = `0/${room.headcount}`;
            // roomStatus.textContent = `0/${room.headcount}`;
            node.querySelector(".room-design .lock").hidden = !room.password;
        }
        else {
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

    for (let room of rooms) {

        let room_id = room
            .querySelector(".room-id")
            .textContent.replace("ROOM: ", "");

        if (value[room_id]) {
            let counts = room.querySelector(".room-headcount").textContent.split("/");
            counts[0] = value[room_id];
            room.querySelector(".room-headcount").textContent = counts.join("/");
        }

    }
}

function updateRoomWhenLoadedPage(value) {
    let rooms = document.querySelectorAll(".room-design");

    for (let room of rooms) {

        let room_id = room
            .querySelector(".room-id")
            .textContent.replace("ROOM: ", "");

        for (let i = 0; i < value.length; i++) {

            if (value[i].room_id == room_id) {
                let counts = room
                    .querySelector(".room-headcount")
                    .textContent.split("/");

                counts[0] = value[i].roomstatus;
                room.querySelector(".room-headcount").textContent = counts.join("/");
            }

        }
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

socket.on("room_status", (value) => {
    updateRoom(value);
});

socket.on("connect", () => {
    console.log("connected to socket.io server");
    callRoomRouter();
});
