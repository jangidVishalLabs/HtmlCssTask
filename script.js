// Small, dependency-free navigation toggle
(function () {
  const header = document.querySelector(".nav-header");
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");

  if (!toggle || !menu || !header) return;

  function openMenu() {
    header.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    menu.classList.add("is-open");
  }

  function closeMenu() {
    header.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
  }

  toggle.addEventListener("click", function (e) {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    if (expanded) closeMenu();
    else openMenu();
  });

  // Close on ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  // Close when clicking outside the menu
  document.addEventListener("click", function (e) {
    if (!header.contains(e.target)) closeMenu();
  });

  // Close on navigation (tap) inside menu
  menu.addEventListener("click", function (e) {
    const target = e.target.closest("a,button");
    if (target) closeMenu();
  });
})();
