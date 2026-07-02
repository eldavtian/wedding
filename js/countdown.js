/* ===========================================================
   COUNTDOWN.JS — updated with seconds + flip animation
   =========================================================== */

var WEDDING_DATE = new Date('2027-07-07T00:00:00');

document.addEventListener('DOMContentLoaded', function () {
    startCountdown();
});

function startCountdown() {
    updateCountdownDisplay();
    setInterval(updateCountdownDisplay, 1000);
}

function updateCountdownDisplay() {
    var now    = new Date();
    var diffMs = WEDDING_DATE - now;

    if (diffMs <= 0) {
        setCountdownValue('days',    0);
        setCountdownValue('hours',   0);
        setCountdownValue('minutes', 0);
        setCountdownValue('seconds', 0);
        return;
    }

    var totalSeconds = Math.floor(diffMs / 1000);
    var days         = Math.floor(totalSeconds / (60 * 60 * 24));
    var hours        = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    var minutes      = Math.floor((totalSeconds % (60 * 60)) / 60);
    var seconds      = totalSeconds % 60;

    setCountdownValue('days',    days);
    setCountdownValue('hours',   hours);
    setCountdownValue('minutes', minutes);
    setCountdownValue('seconds', seconds);
}

function setCountdownValue(elementId, value) {
    var el        = document.getElementById(elementId);
    var formatted = String(value).padStart(2, '0');

    if (el.textContent === formatted) return;

    el.textContent = formatted;

    // Flip animation: remove then re-add class so it retriggers
    // even if the same class was already present from a prior tick
    var flipCard = el.closest('.flip-card');
    flipCard.classList.remove('flip');
    // Force reflow so the browser registers the class removal
    // before we add it back - without this, the animation
    // won't restart if the same element flips twice in a row
    void flipCard.offsetWidth;
    flipCard.classList.add('flip');
}