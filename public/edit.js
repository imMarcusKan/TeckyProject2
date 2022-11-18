const editBtn = document.getElementById("editBtn");

const box = document.querySelector(".box");

editBtn.addEventListener("click", () => {
  Swal.fire({
    html: `
        <div>
        <div class="box">
        <div class="a">
        <label class="ChangeProfilePicture">Change Profile Picture</label>
        <form
        id="profile"
        method="post"
        enctype="multipart/form-data"
        action="/edit-profile"
        >
        <div class="profile-pic">
        <img src="blank.png" alt="profilePic" id="photo" />
        </div>
        <input type="file" name="image" id="file" />
        <input type="submit" value="submit" id="uploadBtn" />
        </form>
        <label class="ChangeUsername">Change Username</label>
        </div>
        
        <div class="b">
        <form
        id="editusername"
        method="post"
        class="editusername"
        action="/edit-username"
        >
        <label for="name">New Username:</label>
        <input type="username" id="username" name="username" /><br />
        <div class="submitButton">
        <button type="submit" id="submit" class="btn">submit</button>
        </div>
        </form>
        </div>
        
        <div class="c">
        <form
        id="editpassword"
        method="post"
        class="editpassword"
        action="/edit-password"
        >
        <label for="password">New Password:</label>
        <input type="password" id="password" name="password" /><br />
        <label for="password2">Confirm Your Password:</label>
        <input type="password" id="password2" name="password2" /><br />
        <div class="submitButton">
        <button type="submit" id="submit" class="btn">submit</button>
        </div>
        </form>
        </div>
        </div>`,
    showCloseButton: true,
    showCancelButton: true,
    focusConfirm: false,
  });

  const img = document.querySelector("#photo");
  const file = document.querySelector("#file");
  const editProfile = document.querySelector("#profile");

  editProfile.addEventListener("submit", async (event) => {
    event.preventDefault();
    let form = editProfile;
    let formData = new FormData(form);
    let res = await fetch("/edit-profile", {
      method: form.method,
      body: formData,
    });
  });

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
});

// const imgDiv = document.querySelector(".profile-pic");

// const uploadBtn = document.querySelector("#uploadBtn");

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
