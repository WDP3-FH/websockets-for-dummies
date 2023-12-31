function toggleDarkMode() {
  document
    .getElementsByClassName("js-darkmode-sun")[0]
    .classList.toggle("hidden");
  document
    .getElementsByClassName("js-darkmode-moon")[0]
    .classList.toggle("hidden");
  document.querySelector("body").classList.toggle("dark-mode");
}

window.onload = () => {
  /*----------  ScrollSpy  ----------*/
  const navHeight = document
    .querySelector(".top-nav")
    .getBoundingClientRect().height;
  const observer = new IntersectionObserver((entries) => {
    // entries are all the sections with an id
    entries.forEach((entry) => {
      const id = entry.target.getAttribute("id");
      const target = document.querySelector(
        `.scrollspy-nav li a[href="#${id}"]`
      );

      /*
      When the section is in the viewport,
        add the active class to the corresponding nav link,
        otherwise remove it
      */
      if (entry.isIntersecting) {
        target.classList.add("active");
      } else {
        target.classList.remove("active");
      }
    });
  });

  // Add the observer to each section with an id
  document.querySelectorAll("section[id]").forEach((section) => {
    observer.observe(section);
  });

  document
    .querySelectorAll(".project-team-member-content[id]")
    .forEach((section) => {
      observer.observe(section);
    });

  /*----------  Dark Mode - Toggle  ----------*/
  const systemPrefersDarkMode = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  if (systemPrefersDarkMode) {
    toggleDarkMode();
  }

  const toggleSwitch = document.getElementsByClassName("js-darkmode-toggle")[0];
  toggleSwitch.addEventListener("click", () => {
    toggleDarkMode();
  });
};
