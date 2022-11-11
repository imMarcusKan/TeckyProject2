const usernameBox = document.querySelector(".username");

async function getName() {
  let res = await fetch("/current-user");
  let result = await res.json();
  console.log("get session:", result);
  usernameBox.textContent = result.user;
}

getName();

async function getID() {
  let res = await fetch("/userID");
  let result = await res.json();
  return result;
}

function logout() {
  document.location.href = "/login.html";
}
