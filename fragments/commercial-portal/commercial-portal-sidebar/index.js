if (fragmentElement) {
  const navItems = fragmentElement.querySelectorAll('.nav-item');

  function updateActiveNav(key) {
    navItems.forEach(function (n) {
      n.classList.toggle('active', n.getAttribute('data-nav') === key);
    });
  }

  fragmentElement.addEventListener('click', function (e) {
    const el = e.target.closest('[data-nav]');
    if (el) {
      e.preventDefault();
      const key = el.getAttribute('data-nav');
      location.hash = key;
    }
  });

  window.addEventListener('hashchange', function () {
    const key = (location.hash || '#dashboard').replace('#', '');
    updateActiveNav(key);
  });

  // Initialize active navigation item
  const initialKey = (location.hash || '#dashboard').replace('#', '');
  updateActiveNav(initialKey);
}
