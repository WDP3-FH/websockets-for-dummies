window.onload = () => {
  /*----------  ScrollSpy  ----------*/
  const observer = new IntersectionObserver((entries) => {
    // entries are all the sections with an id
    entries.forEach((entry) => {
      const id = entry.target.getAttribute("id");

      /*
      When the section is in the viewport,
        add the active class to the corresponding nav link,
        otherwise remove it
      */
      if (entry.isIntersecting) {
        document
          .querySelector(`.scrollspy-nav li a[href="#${id}"]`)
          .classList.add("active");
      } else {
        document
          .querySelector(`.scrollspy-nav li a[href="#${id}"]`)
          .classList.remove("active");
      }
    });
  });

  // Add the observer to each section with an id
  document.querySelectorAll("section[id]").forEach((section) => {
    observer.observe(section);
  });

  /*----------  Dark Mode - Toggle  ----------*/
  document
    .getElementsByClassName("js-darkmode-toggle")[0]
    .addEventListener("click", () => {
      document
        .getElementsByClassName("js-darkmode-sun")[0]
        .classList.toggle("hidden");
      document
        .getElementsByClassName("js-darkmode-moon")[0]
        .classList.toggle("hidden");
    });
};
