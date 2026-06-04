if (fragmentElement) {
  const navItems = fragmentElement.querySelectorAll('.nav-item');

  function updateActiveNav() {
    const currentPath = window.location.pathname.toLowerCase();
    let matched = false;

    navItems.forEach(function (n) {
      const key = n.getAttribute('data-nav');
      // Match if pathname ends with the key or contains it in path segments
      const isCurrent = currentPath.endsWith('/' + key) || currentPath.includes('/' + key + '/');
      n.classList.toggle('active', isCurrent);
      if (isCurrent) {
        matched = true;
      }
    });

    // Default to dashboard active state if no route matched
    if (!matched) {
      navItems.forEach(function (n) {
        if (n.getAttribute('data-nav') === 'dashboard') {
          n.classList.add('active');
        }
      });
    }
  }

  // Set active state on load
  updateActiveNav();
}
