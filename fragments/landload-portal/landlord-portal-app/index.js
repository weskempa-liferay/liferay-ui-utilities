if (fragmentElement) {
  const views = fragmentElement.querySelectorAll('.page-view');

  function show(key) {
    let found = false;
    views.forEach(function (v) {
      const on = v.getAttribute('data-view') === key;
      v.classList.toggle('active', on);
      if (on) found = true;
    });

    if (!found) {
      const defaultView = fragmentElement.querySelector('[data-view="dashboard"]');
      if (defaultView) {
        defaultView.classList.add('active');
      }
    }

    window.scrollTo({ top: 0 });
  }

  // Handle local links inside the app that trigger navigation
  fragmentElement.addEventListener('click', function (e) {
    const el = e.target.closest('[data-nav]');
    if (el) {
      e.preventDefault();
      const key = el.getAttribute('data-nav');
      location.hash = key;
    }
  });

  window.addEventListener('hashchange', function() {
    const key = (location.hash || '#dashboard').replace('#', '');
    show(key);
  });

  // Premium Interactivity: Toggle Switches
  fragmentElement.addEventListener('click', function (e) {
    const switchEl = e.target.closest('.switch');
    if (switchEl) {
      switchEl.classList.toggle('on');
    }
  });

  // Premium Interactivity: Checkboxes
  fragmentElement.addEventListener('click', function (e) {
    const checkboxEl = e.target.closest('.checkbox');
    if (checkboxEl) {
      checkboxEl.classList.toggle('on');
      if (checkboxEl.classList.contains('on')) {
        checkboxEl.textContent = '✓';
      } else {
        checkboxEl.textContent = '';
      }
    }
  });

  // Initialize Routing
  const initialKey = (location.hash || '#dashboard').replace('#', '');
  show(initialKey);
}
