window.onbeforeunload = function () {
  window.location.href = "/homepage.html";
  console.log("refreshed to homepage");
};
