document.addEventListener("DOMContentLoaded", function() {
    var overlay = document.querySelector(".overlay");
    setTimeout(function() {
      overlay.style.opacity = 0;
    }, 2500);

    setTimeout(function() {
      overlay.classList.add("hidden");
    }, 3000);
  });
