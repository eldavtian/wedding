/* ===========================================================
   VINYL.JS
   Controls the vinyl record audio player:
   - Spins when playing, stops when paused
   - Click to toggle play/pause
   - Auto-starts when envelope opens (called from envelope.js)
   =========================================================== */

var audio  = null;
var isPlaying = false;

/**
 * Called by envelope.js after the opening animation completes.
 * Starts the music and shows the vinyl player.
 */
function startVinylAudio() {
    audio = document.getElementById('bg-audio');
    var btn  = document.getElementById('vinyl-btn');
    var disc = document.getElementById('vinyl-disc');

    if (!audio) return;

    // Attempt autoplay (works because we're inside a user-click chain)
    audio.volume = 0.55;
    audio.play()
        .then(function () {
            isPlaying = true;
            disc.classList.add('spinning');
        })
        .catch(function () {
            // Autoplay blocked (some browsers need explicit user gesture)
            // Vinyl will show as paused — user can click to start
            isPlaying = false;
        });

    btn.addEventListener('click', toggleVinyl);
}

function toggleVinyl() {
    var disc = document.getElementById('vinyl-disc');

    if (isPlaying) {
        audio.pause();
        disc.classList.remove('spinning');
        isPlaying = false;
    } else {
        audio.play();
        disc.classList.add('spinning');
        isPlaying = true;
    }
}