const box = document.querySelector(".box");
const editBtn = document.getElementById("editBtn");

editBtn.addEventListener("click", () => {
    Swal.fire({
        html: `
        <div style="height: 300px;">
        <div class="select" style="margin-bottom:80px;">
        <button class="pic" onclick="changeForm('#profile','#editusername','#editpassword')">Change Profile Pic</button>
        <button class="username"  onclick="changeForm('#editusername','#profile','#editpassword')">Change username</button>
        <button class="Password" onclick="changeForm('#editpassword','#profile','#editusername')">Change Password</button>
        </div>
  
        <form
        id="profile"
        method="post"
        enctype="multipart/form-data"
        action="/user/profile"
        >
        <div class="profile-pic">
        <img src="blank.png" alt="profilePic" id="photo" />
        </div>
        <input type="file" name="image" id="file" required/>
        <input type="submit" value="submit" id="uploadBtn" />
        </form>

        <form
        id="editusername"
        method="post"
        class="editusername"
        action="/user/username"
        style="display:none;"
        >
        <label for="name">New Username:</label>
        <input type="username" id="username" name="username" required/><br />
        <div class="submitButton">
        <button type="submit" id="submit" class="btn">submit</button>
        </div>
        </form>
        

        <form
        id="editpassword"
        method="post"
        class="editpassword"
        action="/edit-password"
        style="display:none;"
        >
        <label for="password">New Password:</label>
        <input type="password" id="password" name="password" required/><br />
        <label for="password2">Confirm Your Password:</label>
        <input type="password" id="password2" name="password2" required/><br />
        <div class="submitButton">
        <button type="submit" id="submit" class="btn">submit</button>
        </div>
        </form>
  
        </div>`,
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
    });

    const img = document.querySelector("#photo");
    const file = document.querySelector("#file");

    const editProfile = document.querySelector("#profile");
    const editusername = document.querySelector("#editusername");
    const editpassword = document.querySelector("#editpassword");

    editProfile.addEventListener("submit", async (event) => {
        event.preventDefault();

        let form = editProfile;
        let formData = new FormData(form);

        let res = await fetch("/user/profile", {
            method: form.method,
            body: formData,
        });
        let result = await res.json();

        if (result.err) {
            alert(result.err);
            return;
        }

        if (result.message) {
            alert(result.message);
        }

    });

    editusername.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formObject = {};
        formObject["username"] = editusername.username.value;

        let res = await fetch("/user/username", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formObject),
        });

        let result = await res.json();

        if (result.err) {
            alert(result.err);
            return;
        }

        if (result.message) {
            alert(result.message);
        }

    });

    editpassword.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formObject = {};

        formObject["password"] = editpassword.password.value;
        formObject["password2"] = editpassword.password2.value;

        let res = await fetch("/user/password", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formObject),
        });

        let result = await res.json();

        if (result.err) {
            alert(result.err);
            return;
        }

        if (result.message) {
            alert(result.message);
        }

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

function changeForm(show, hide1, hide2) {
    document.querySelector(show).style.display = "unset";
    document.querySelector(hide1).style.display = "none";
    document.querySelector(hide2).style.display = "none";
}

const imgDiv = document.querySelector(".profile-pic");

const uploadBtn = document.querySelector("#uploadBtn");

function previewFile() {
    const preview = document.querySelector("img");
    const file = document.querySelector("input[type=file]").files[0];
    const reader = new FileReader();

    reader.addEventListener(
        "load",
        function () {
            preview.src = reader.result;
        },
        false
    );

    if (file) {
        reader.readAsDataURL(file);
    }
}
// $(function () {
//   $("#profile-image1").on("click", function () {
//     $("#profile_pic").click();
//   });
// }
