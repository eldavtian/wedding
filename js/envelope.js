/* ===========================================================
   ENVELOPE.JS
   Handles two things:
   1. Generating floating background particles
   2. The click-to-open envelope animation + screen transition
   =========================================================== */

// Run everything only after the full HTML document has loaded,
// so we know all elements (#envelope, #particles, etc.) exist.
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    setupEnvelopeClick();
});

/**
 * Creates a number of floating particle divs inside #particles,
 * each with randomized horizontal position, animation delay,
 * and animation duration, so they don't all move identically.
 */
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const PARTICLE_COUNT = 25;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Random horizontal start position across the screen width
        particle.style.left = `${Math.random() * 100}%`;

        // Random starting vertical position so they don't all start at the bottom together
        particle.style.bottom = `${Math.random() * 100}%`;

        // Randomize animation timing so movement feels organic, not robotic
        const duration = 8 + Math.random() * 10; // between 8s and 18s
        const delay = Math.random() * 10;         // up to 10s delay before starting
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;

        particlesContainer.appendChild(particle);
    }
}

/**
 * Listens for a click on the envelope. On click:
 * 1. Adds "is-open" class to #envelope (triggers flap + seal CSS animation)
 * 2. After a short delay (so the user sees the flap open first),
 *    fades out the whole envelope screen
 * 3. Reveals the #invitation section underneath
 */
function setupEnvelopeClick() {
    const envelope = document.getElementById('envelope');
    const envelopeScreen = document.getElementById('envelope-screen');
    const invitation = document.getElementById('invitation');
    const hint = document.getElementById('envelope-hint');

    envelope.addEventListener('click', () => {
        // Prevent double-clicking from re-triggering the animation
        if (envelope.classList.contains('is-open')) return;

        envelope.classList.add('is-open');
        hint.style.opacity = '0';

        // Wait for the flap-open animation to mostly finish before
        // fading the whole screen away. 900ms is tuned to match
        // the --transition-slow (1.2s) flap animation timing.
        setTimeout(() => {
            envelopeScreen.classList.add('fade-out');
        }, 900);

        // After the fade-out animation finishes, hide the envelope
        // screen completely and reveal the invitation. We remove it
        // from layout entirely (not just opacity:0) so it doesn't
        // block scrolling or clicks afterward.
        setTimeout(() => {
            envelopeScreen.style.display = 'none';
            invitation.hidden = false;

            // Smoothly scroll to the very top in case anything shifted
            window.scrollTo({ top: 0, behavior: 'instant' });
        }, 900 + 1200); // 900ms wait + 1200ms fade-out duration
    });
}