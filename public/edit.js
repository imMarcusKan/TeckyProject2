const editBtn = document.getElementById("editBtn");
const modalContainer = document.getElementById("modalContainer");
const close = document.getElementById("close");

editBtn.addEventListener("click", () => {
  modalContainer.style.display = "block";
});

close.addEventListener("click", () => {
  modalContainer.style.display = "none";
});
