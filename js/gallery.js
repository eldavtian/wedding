/* ===========================================================
   GALLERY.JS
   Controls the photo slider: next/prev arrows, clickable dots,
   and keeping the track position + active dot in sync.
   =========================================================== */

document.addEventListener('DOMContentLoaded', function () {
    initGallery();
});

function initGallery() {
    var track = document.querySelector('.gallery-track');
    if (!track) return; // gallery not on this page - exit safely

    var images = document.querySelectorAll('.gallery-img');
    var prevBtn = document.getElementById('gallery-prev');
    var nextBtn = document.getElementById('gallery-next');
    var dotsContainer = document.getElementById('gallery-dots');

    var currentIndex = 0;
    var totalSlides = images.length;

    createDots(dotsContainer, totalSlides, goToSlide);

    prevBtn.addEventListener('click', function () {
        goToSlide(currentIndex - 1);
    });

    nextBtn.addEventListener('click', function () {
        goToSlide(currentIndex + 1);
    });

    /**
     * Moves the slider to a given slide index, wrapping around
     * (e.g. going "previous" from slide 0 loops to the last slide).
     */
    function goToSlide(index) {
        // Wrap-around logic using modulo. Adding totalSlides before
        // the modulo handles negative numbers correctly (JS's %
        // can return negative results otherwise, e.g. -1 % 3 = -1,
        // not 2 like we'd want).
        currentIndex = (index + totalSlides) % totalSlides;

        track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
        updateActiveDot(dotsContainer, currentIndex);
    }
}

/**
 * Creates one clickable dot per slide, appending them into
 * the dots container.
 */
function createDots(container, count, onDotClick) {
    for (var i = 0; i < count; i++) {
        var dot = document.createElement('div');
        dot.classList.add('gallery-dot');
        if (i === 0) dot.classList.add('active');

        // We need to "capture" the current value of i for this
        // specific dot's click handler. Using a separate function
        // call here (rather than referencing i directly) avoids
        // a classic JS closure bug where every dot would
        // otherwise end up pointing to the same final index.
        (function (slideIndex) {
            dot.addEventListener('click', function () {
                onDotClick(slideIndex);
            });
        })(i);

        container.appendChild(dot);
    }
}

/**
 * Updates which dot has the "active" class to match the
 * currently displayed slide.
 */
function updateActiveDot(container, activeIndex) {
    var dots = container.querySelectorAll('.gallery-dot');
    dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === activeIndex);
    });
}