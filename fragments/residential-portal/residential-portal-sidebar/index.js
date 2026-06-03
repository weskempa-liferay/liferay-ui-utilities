if (fragmentElement) {
  const navItems = fragmentElement.querySelectorAll('.nav-item');

  function updateActiveNav(key) {
    navItems.forEach(function (n) {
      const isCurrent = n.getAttribute('data-nav') === key;
      n.classList.toggle('active', isCurrent);
    });
  }

  // Handle sidebar navigation clicks
  fragmentElement.addEventListener('click', function (e) {
    const el = e.target.closest('[data-nav]');
    if (el) {
      e.preventDefault();
      const key = el.getAttribute('data-nav');
      location.hash = key;
    }
  });

  // Highlight navigation item on hashchange
  window.addEventListener('hashchange', function () {
    const key = (location.hash || '#dashboard').replace('#', '');
    updateActiveNav(key);
  });

  // Highlight initial route
  const initialKey = (location.hash || '#dashboard').replace('#', '');
  updateActiveNav(initialKey);
}
