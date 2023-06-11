const nightModeBtn = document.getElementById("night-mode-btn");
nightModeBtn.addEventListener("click", function () {
  const dayModeCSS = document.querySelector('link[href="day.css"]');
  const nightModeCSS = document.querySelector('link[href="night.css"]');

  if (dayModeCSS.disabled) {
    dayModeCSS.disabled = false;
    nightModeCSS.disabled = true;
    localStorage.setItem('toggleState', 'on');
  } else {
    dayModeCSS.disabled = true;
    nightModeCSS.disabled = false;
    localStorage.setItem('toggleState', 'off');
  }
});

document.addEventListener("DOMContentLoaded", function() {
  var toggleState = localStorage.getItem('toggleState');

  if (toggleState === 'on') {
    const dayModeCSS = document.querySelector('link[href="day.css"]');
    const nightModeCSS = document.querySelector('link[href="night.css"]');
    dayModeCSS.disabled = false;
    nightModeCSS.disabled = true;
  } else {
    const dayModeCSS = document.querySelector('link[href="day.css"]');
    const nightModeCSS = document.querySelector('link[href="night.css"]');
    dayModeCSS.disabled = true;
    nightModeCSS.disabled = false;
  }
});