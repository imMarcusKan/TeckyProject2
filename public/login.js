const x = document.getElementById("login");
const y = document.getElementById("register");
const z = document.getElementById("btn");

function register() {
  x.style.left = "-400px";
  y.style.left = "50px";
  z.style.left = "110px";
}
function login() {
  x.style.left = "50px";
  y.style.left = "450px";
  z.style.left = "0px";
}

const pwInput = document.querySelector("#pwInput");
pwInput.addEventListener("input", (e) => {
  if (pwInput.value.length < 8) {
    document.getElementById("text").hidden = false;
  } else {
    document.getElementById("text").hidden = true;
  }
});

document
  .querySelector("#register")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    // Serialize the Form afterwards
    const form = event.target;
    const formObject = {};

    formObject["username"] = form.username.value;
    formObject["email"] = form.email.value;
    formObject["password"] = form.password.value;

    const res = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formObject),
    });

    const result = await res.json();

    if (result.status) {
      alert(result.message);
      window.location = "/homepage.html";
    } else {
      alert(result.message);
    }
  });

document
  .querySelector("#login")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    // Serialize the Form afterwards
    const form = event.target;
    const formObject = {};

    formObject["username"] = form.username.value;
    formObject["password"] = form.password.value;

    const res = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formObject),
    });

    const result = await res.json();

    if (!result.status) {
      alert(result.message);
    } else {
      alert(result.message);
      window.location = result.redirectUrl;
    }
  });
