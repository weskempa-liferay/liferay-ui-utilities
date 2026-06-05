if (fragmentElement) {
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
}
