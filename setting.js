import { initNavigation } from "./app.js";

document.addEventListener("DOMContentLoaded", () => {
    initNavigation(); 
});

function handleColumns(section) {
  const opts = section.querySelectorAll('.unit-option');
  const cols = section.querySelectorAll('.unit-column');

  // reset
  cols.forEach(c => c.classList.remove('hide'));

  let activeIndex = -1;
  opts.forEach((o, i) => {
    if (o.classList.contains('active')) activeIndex = i;
  });

  // left
  if (activeIndex > 0) {
    const left = opts[activeIndex].previousElementSibling;
    if (left && left.classList.contains('unit-column')) left.classList.add('hide');
  }

  // right
  if (activeIndex < opts.length - 1) {
    const right = opts[activeIndex].nextElementSibling;
    if (right && right.classList.contains('unit-column')) right.classList.add('hide');
  }
}

document.querySelectorAll('.unit-options').forEach(section => {
  // default load
  handleColumns(section);

  const options = section.querySelectorAll('.unit-option');

  options.forEach((opt, i) => {
    opt.addEventListener("click", () => {
      options.forEach(x => x.classList.remove("active"));
      opt.classList.add("active");

      handleColumns(section);
    });
  });
});
