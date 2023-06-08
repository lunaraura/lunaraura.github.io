const buttons = document.querySelectorAll("[data-carousel-button]");
let slidePosition = 0;
const slides = document.querySelector("[data-slides]");
const slideWidth = slides.firstElementChild.offsetWidth;
const totalSlides = slides.children.length;

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const offset = button.dataset.carouselButton === "next" ? 1 : -1;
    slidePosition += offset;

    if (slidePosition < 0) {
      slidePosition = 0;
    } else if (slidePosition > totalSlides - 3) {
      slidePosition = totalSlides - 3;
    }
    slides.style.transform = `translateX(-${
      slidePosition * slideWidth
    }px)`;
  });
});