const usernameBox = document.querySelector(".username");

async function getName() {
  let res = await fetch("/current-user");
  let result = await res.json();
  usernameBox.textContent = result;
}

getName();

function logout() {
  document.location.href = "/login.html";
}

// async function submitForm(form) {
//   console.log(form);
//   let formData = new FormData(form);
//   let result = await fetch("/edit", {
//     method: "post",
//     body: formData,
//   });

//   let json = await result.json();
//   if (json.err) {
//     console.log("Something wrong with the formidable err");
//   }
//   console.log("success reset password");
//   console.log(json);
//   return;
// }

// let form = document.querySelector("#edit");
// form.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   let formObject = {};
//   formObject["username"] = form.username.value;
//   formObject["password"] = form.password.value;
//   formObject["password2"] = form.password2.value;
//   //console.log(formObject);
//   const res = await fetch("/edit", {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(formObject),
//   });

//   let result = await res.json();
//   alert(result.message);
// });
