window.addEventListener('scroll', function() {
    const stickyBanner = document.getElementById('sticky-banner');

    if (window.scrollY > 150) {
        stickyBanner.classList.add('scrolled');
    } else {
        stickyBanner.classList.remove('scrolled');
    }
});