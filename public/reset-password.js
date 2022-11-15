let params = new URL(document.location).searchParams;
let userId = params.get("userId");
let token = params.get("token");

document
  .querySelector("#reset-password-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const form = event.target;
    const formObject = {};

    formObject["password"] = form.password.value;
    formObject["password2"] = form.password2.value;

    const res = await fetch(`/reset-password/${userId}/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formObject),
    });

    const result = await res.json();
    form.reset();
    if (res.status == 200) {
      window.location = "/";
    } else {
      alert(result.message);
    }
  });
