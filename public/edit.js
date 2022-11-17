const editBtn = document.getElementById("editBtn");
const modalContainer = document.getElementById("modalContainer");
const close = document.getElementById("close");
const editProfile = document.querySelector("#profile");

editBtn.addEventListener("click", () => {
  modalContainer.style.display = "block";
});

close.addEventListener("click", () => {
  modalContainer.style.display = "none";
});

editProfile.addEventListener("submit", async (event) => {
  event.preventDefault();
  let form = editProfile;
  let formData = new FormData(form);
  let res = await fetch("/edit-profile", {
    method: form.method,
    body: formData,
  });
});
// const imgDiv = document.querySelector(".profile-pic");
const img = document.querySelector("#photo");
const file = document.querySelector("#file");
// const uploadBtn = document.querySelector("#uploadBtn");

file.addEventListener("change", () => {
  const chooseFile = document.querySelector("input[type=file]").files[0];
  if (chooseFile) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      img.setAttribute("src", reader.result);
    });
    reader.readAsDataURL(chooseFile);
  }
});
// function previewFile() {
//   const preview = document.querySelector("img");
//   const file = document.querySelector("input[type=file]").files[0];
//   const reader = new FileReader();

//   reader.addEventListener(
//     "load",
//     function () {
//       preview.src = reader.result;
//     },
//     false
//   );

//   if (file) {
//     reader.readAsDataURL(file);
//   }
// }
// $(function () {
//   $("#profile-image1").on("click", function () {
//     $("#profile_pic").click();
//   });
// }
