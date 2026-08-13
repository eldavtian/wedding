/* ===========================================================
   GALLERY.JS — continuous infinite running scroll
   Technique: duplicate slides + CSS animation on the track.
   No jumps, no pauses — smooth endless loop.
   =========================================================== */

document.addEventListener('DOMContentLoaded', function () {
    initGallery();
});

function initGallery() {
    var track = document.querySelector('.gallery-track');
    if (!track) return;

    var images = Array.from(document.querySelectorAll('.gallery-img'));
    if (images.length === 0) return;

    // Remove old dots and arrows — not needed for a running line
    var dotsContainer = document.getElementById('gallery-dots');
    var prevBtn       = document.getElementById('gallery-prev');
    var nextBtn       = document.getElementById('gallery-next');
    if (dotsContainer) dotsContainer.style.display = 'none';
    if (prevBtn)       prevBtn.style.display = 'none';
    if (nextBtn)       nextBtn.style.display = 'none';

    // Duplicate slides so the loop feels truly infinite.
    // We clone the entire set and append it — when the animation
    // reaches the end of the original set, it loops back to start
    // seamlessly because the clones look identical.
    images.forEach(function (img) {
        var clone = img.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
    });

    // Apply the continuous scroll animation via CSS class.
    // The animation duration controls speed — lower = faster.
    track.classList.add('running');

    // Pause on hover (desktop) — feels premium, lets user look
    var galleryEl = document.getElementById('gallery');
    galleryEl.addEventListener('mouseenter', function () {
        track.style.animationPlayState = 'paused';
    });
    galleryEl.addEventListener('mouseleave', function () {
        track.style.animationPlayState = 'running';
    });
}