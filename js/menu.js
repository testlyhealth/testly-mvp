import { $, $all } from './dom.js';

export function setupMenuToggle() {
  const burgerButton = $('#burger-button');
  const dropdown = $('#burger-dropdown');

  if (burgerButton && dropdown) {
    burgerButton.addEventListener("click", () => {
      dropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!burgerButton.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add("hidden");
      }
    });
  }
}
