const editBtn = document.getElementById("editBtn");
const modalContainer = document.getElementById("modalContainer");
const close = document.getElementById("close");

editBtn.addEventListener("click", () => {
  modalContainer.classList.add("show");
});

close.addEventListener("click", () => {
  modalContainer.classList.remove("show");
});
