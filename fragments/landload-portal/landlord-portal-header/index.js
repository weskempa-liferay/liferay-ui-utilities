if (fragmentElement) {
  // Navigation event delegation for header links
  fragmentElement.addEventListener('click', function (e) {
    const el = e.target.closest('[data-nav]');
    if (el) {
      e.preventDefault();
      const key = el.getAttribute('data-nav');
      location.hash = key;
    }
  });
}
