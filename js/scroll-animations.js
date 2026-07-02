document.addEventListener('DOMContentLoaded', function () {
    observeFadeInSections();
    observeTimelineItems();
});

function observeFadeInSections() {
    var sections = document.querySelectorAll('.fade-in-section');
    var observer = createRevealObserver();

    for (var i = 0; i < sections.length; i++) {
        observer.observe(sections[i]);
    }
}

function observeTimelineItems() {
    var items = document.querySelectorAll('.timeline-item');
    var observer = createRevealObserver();

    for (var i = 0; i < items.length; i++) {
        observer.observe(items[i]);
    }
}

function createRevealObserver() {
    var options = {
        threshold: 0.15
    };

    var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, options);

    return observer;
}