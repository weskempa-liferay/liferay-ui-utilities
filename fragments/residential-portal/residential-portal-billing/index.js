if (fragmentElement) {
  // Toggle Switches
  fragmentElement.addEventListener('click', function (e) {
    const switchEl = e.target.closest('.switch');
    if (switchEl) {
      switchEl.classList.toggle('on');
    }
  });
}
