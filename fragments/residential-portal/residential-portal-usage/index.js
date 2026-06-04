if (fragmentElement) {
  // Alert dismiss logic
  fragmentElement.addEventListener('click', function (e) {
    const closeBtn = e.target.closest('.banner .b-close');
    if (closeBtn) {
      const banner = closeBtn.closest('.banner');
      if (banner) {
        banner.style.display = 'none';
      }
    }
  });
}
