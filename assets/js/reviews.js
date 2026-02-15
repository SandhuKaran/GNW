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
        moveTrack();
    }

    function isMobile() {
        return window.innerWidth <= 992;
    }

    function moveTrack(detectEnd = true) {
        const cards = track.querySelectorAll('.review-card');
        const totalCards = cards.length;
        if (totalCards === 0) return;

        // Check bounds
        if (currentIndex > totalCards - cardsToShow && detectEnd) {
            currentIndex = 0;
        }
        if (currentIndex < 0) {
            currentIndex = 0;
        }

        if (isMobile()) {
            // On mobile: use scrollTo (works with scroll-snap CSS)
            const targetCard = cards[currentIndex];
            if (targetCard) {
                wrapper.scrollTo({
                    left: targetCard.offsetLeft - 20, // 20px padding offset
                    behavior: 'smooth'
                });
            }
        } else {
            // On desktop: use transform (CSS has overflow:hidden, no scroll-snap)
            const shift = currentIndex * (100 / cardsToShow);
            track.style.transform = `translateX(-${shift}%)`;
            track.style.transition = 'transform 0.5s ease-in-out';
        }
    }

    function autoSlide() {
        currentIndex++;
        const cards = track.querySelectorAll('.review-card');

        if (currentIndex > cards.length - cardsToShow) {
            currentIndex = 0;
        }
        moveTrack();
    }

    function startAutoPlay() {
        stopAutoPlay();
        autoPlayInterval = setInterval(autoSlide, 2000);
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
            stopAutoPlay();

            const btn = e.target;
            const card = btn.closest('.review-card');
            const text = card.querySelector('.review-text');

            if (text.classList.contains('expanded')) {
                text.classList.remove('expanded');
                btn.textContent = 'Read more';
                startAutoPlay();
            } else {
                text.classList.add('expanded');
                btn.textContent = 'Read less';
            }
        }
    });

    // Pause on hover (only on devices with mouse support)
    if (window.matchMedia('(hover: hover)').matches) {
        wrapper.addEventListener('mouseenter', stopAutoPlay);
        wrapper.addEventListener('mouseleave', startAutoPlay);
    }

})();
