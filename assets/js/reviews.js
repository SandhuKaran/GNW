(function () {
    const track = document.querySelector('.reviews-track');
    const wrapper = document.querySelector('.reviews-track-wrapper');
    if (!track || !wrapper) return;

    let currentIndex = 0;
    let autoPlayInterval;
    let cardsToShow = 1;

    // Determine how many cards to show based on width
    function updateLayout() {
        const width = window.innerWidth;
        if (width > 992) {
            cardsToShow = 3;
        } else if (width > 600) {
            cardsToShow = 2;
        } else {
            cardsToShow = 1;
        }

        // Update card widths in CSS via style or class? 
        // We can set it here for strict control
        const cards = track.querySelectorAll('.review-card');
        const gap = 20; // assumed gap from CSS
        // Actually, let's handle width in CSS using standard logic, 
        // or set flex-basis here.
        // CSS is cleaner. We just need to know how much to shift.
        // But if CSS sets width, we need to match it.

        // Let's assume CSS sets width to (100% / cardsToShow) - gap adjustment
        // We will handle the shift logic here.
        moveTrack();
    }

    function moveTrack(detectEnd = true) {
        const cards = track.querySelectorAll('.review-card');
        const totalCards = cards.length;
        const cardWidthWithGap = 100 / cardsToShow; // Percentage shift

        // Check bounds
        if (currentIndex > totalCards - cardsToShow && detectEnd) {
            // If we reach the end where fewer than 'cardsToShow' are left,
            // wrap to 0? Or just stop?
            // User likely wants loop.
            currentIndex = 0;
        }

        const shift = currentIndex * (100 / cardsToShow);
        track.style.transform = `translateX(-${shift}%)`;
        track.style.transition = 'transform 0.5s ease-in-out';
    }

    function autoSlide() {
        currentIndex++;
        const cards = track.querySelectorAll('.review-card');

        // Seamless loop logic check
        if (currentIndex > cards.length - cardsToShow) {
            currentIndex = 0;
            // Optional: Disable transition for instant jump? 
            // For simple rewind, just allow transition back to 0
        }
        moveTrack();
    }

    function startAutoPlay() {
        stopAutoPlay();
        autoPlayInterval = setInterval(autoSlide, 3000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    // Event Listeners
    window.addEventListener('resize', () => {
        updateLayout();
        moveTrack(false);
    });

    // Init
    updateLayout();
    startAutoPlay();

    // Read More functionality
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('read-more')) {
            e.preventDefault();
            stopAutoPlay(); // Pause carousel so they can read

            const btn = e.target;
            const card = btn.closest('.review-card');
            const text = card.querySelector('.review-text');

            if (text.classList.contains('expanded')) {
                text.classList.remove('expanded');
                btn.textContent = 'Read more';
                startAutoPlay(); // Resume if they collapse
            } else {
                // Collapse all others first? Optional.
                // For now, simple toggle.
                text.classList.add('expanded');
                btn.textContent = 'Read less';
            }
        }
    });

    // Optional: Pause on hover
    wrapper.addEventListener('mouseenter', stopAutoPlay);
    wrapper.addEventListener('mouseleave', startAutoPlay);

})();
