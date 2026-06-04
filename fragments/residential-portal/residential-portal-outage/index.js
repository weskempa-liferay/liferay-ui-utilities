if (fragmentElement) {
  // Toggle Switches & Alerts
  fragmentElement.addEventListener('click', function (e) {
    const switchEl = e.target.closest('.switch');
    if (switchEl) {
      switchEl.classList.toggle('on');
    }
    const closeBtn = e.target.closest('.banner .b-close');
    if (closeBtn) {
      const banner = closeBtn.closest('.banner');
      if (banner) {
        banner.style.display = 'none';
      }
    }
  });
}
