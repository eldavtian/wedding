/* ===========================================================
   ADMIN.JS
   Handles:
   1. Password login / logout (session-based)
   2. Fetching all RSVP submissions from Google Sheets
   3. Rendering them in a table with summary stats
   4. Search, filter, and sort controls
   =========================================================== */

var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzcxuJp0hARL4lUH8Z_Oo6MZOs__mCBAWPrsVArpb7j3fYQpSSJCYR9yvhlyonAwtDo/exec';

// Change this to whatever password you want.
// IMPORTANT: this is frontend-only password protection - fine
// for a personal wedding site, but not suitable for protecting
// truly sensitive data. It keeps casual visitors out, which
// is all we need here.
var ADMIN_PASSWORD = 'hartsanik2027';

// In-memory store of all fetched submissions - we keep this
// so search/filter/sort can re-render from the full dataset
// without making a new network request each time.
var allSubmissions = [];

// Current active filter
var currentFilter = 'all';

document.addEventListener('DOMContentLoaded', function () {
    checkExistingSession();
    setupLoginForm();
    setupLogout();
    setupSearch();
    setupFilters();
    setupSort();
});

/* ===========================================================
   AUTH
   =========================================================== */

/**
 * If the admin already logged in during this browser session,
 * skip straight to the dashboard without re-entering password.
 */
function checkExistingSession() {
    if (sessionStorage.getItem('admin_auth') === 'true') {
        showDashboard();
    }
}

function setupLoginForm() {
    var loginBtn      = document.getElementById('login-btn');
    var passwordInput = document.getElementById('admin-password');

    // Allow pressing Enter in the password field to log in
    passwordInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') attemptLogin();
    });

    loginBtn.addEventListener('click', attemptLogin);
}

function attemptLogin() {
    var entered = document.getElementById('admin-password').value;
    var errorEl = document.getElementById('login-error');

    if (entered === ADMIN_PASSWORD) {
        sessionStorage.setItem('admin_auth', 'true');
        errorEl.hidden = true;
        showDashboard();
    } else {
        errorEl.hidden = false;
        document.getElementById('admin-password').value = '';
        document.getElementById('admin-password').focus();
    }
}

function setupLogout() {
    document.getElementById('logout-btn').addEventListener('click', function () {
        sessionStorage.removeItem('admin_auth');
        document.getElementById('dashboard').hidden = true;
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('admin-password').value = '';
    });
}

/* ===========================================================
   DASHBOARD
   =========================================================== */

function showDashboard() {
    document.getElementById('login-screen').style.display  = 'none';
    document.getElementById('dashboard').hidden = false;
    fetchSubmissions();
}

/**
 * Fetches all RSVP rows from Google Sheets via Apps Script GET request.
 */
function fetchSubmissions() {
    var loadingEl = document.getElementById('loading-message');
    loadingEl.hidden = false;

    fetch(APPS_SCRIPT_URL + '?action=list')
        .then(function (res) { return res.json(); })
        .then(function (response) {
            loadingEl.hidden = true;

            if (response.success) {
                allSubmissions = response.data;
                renderAll();
            } else {
                loadingEl.textContent = 'Տվյալները բեռնելու սխալ։';
            }
        })
        .catch(function () {
            loadingEl.textContent = 'Կապի սխալ։ Թարմացրեք էջը։';
        });
}

/**
 * Applies current search text, filter, and sort to allSubmissions
 * then re-renders the table and stats. Called any time any
 * control changes - one function handles everything so there's
 * no risk of controls getting out of sync with each other.
 */
function renderAll() {
    var searchText = document.getElementById('search-input').value.trim().toLowerCase();
    var sortValue  = document.getElementById('sort-select').value;

    // 1. Filter by search text
    var filtered = allSubmissions.filter(function (s) {
        return s.name.toLowerCase().includes(searchText);
    });

    // 2. Filter by attendance/side button
    if (currentFilter === 'attending') {
        filtered = filtered.filter(function (s) { return s.willAttend; });
    } else if (currentFilter === 'not-attending') {
        filtered = filtered.filter(function (s) { return !s.willAttend; });
    } else if (currentFilter === 'bride') {
        filtered = filtered.filter(function (s) { return s.side === 'bride'; });
    } else if (currentFilter === 'groom') {
        filtered = filtered.filter(function (s) { return s.side === 'groom'; });
    }

    // 3. Sort
    filtered.sort(function (a, b) {
        if (sortValue === 'oldest') {
            return a.id < b.id ? -1 : 1;
        } else if (sortValue === 'name-az') {
            return a.name.localeCompare(b.name);
        } else {
            // newest (default)
            return a.id > b.id ? -1 : 1;
        }
    });

    renderTable(filtered);
    renderStats(allSubmissions); // stats always reflect the FULL dataset, not the filtered view
}

/**
 * Renders the table rows from a given array of submissions.
 */
function renderTable(submissions) {
    var tbody      = document.getElementById('rsvp-tbody');
    var emptyMsg   = document.getElementById('empty-message');
    tbody.innerHTML = '';

    if (submissions.length === 0) {
        emptyMsg.hidden = false;
        return;
    }
    emptyMsg.hidden = true;

    submissions.forEach(function (s) {
        var tr = document.createElement('tr');

        var sideLabel = s.side === 'bride'
            ? '👰 Հարսի կողմից'
            : s.side === 'groom'
                ? '🤵 Փեսայի կողմից'
                : '—';

        var attendBadge = s.willAttend
            ? '<span class="badge yes">Այո</span>'
            : '<span class="badge no">Ոչ</span>';

        tr.innerHTML =
            '<td>' + escapeHtml(s.name) + '</td>' +
            '<td>' + sideLabel + '</td>' +
            '<td>' + attendBadge + '</td>' +
            '<td>' + (s.willAttend ? s.guestCount : '—') + '</td>' +
            '<td>' + escapeHtml(String(s.date)) + '</td>' +
            '<td>' + escapeHtml(String(s.time)) + '</td>';

        tbody.appendChild(tr);
    });
}

/**
 * Updates the four summary stat cards at the top.
 */
function renderStats(submissions) {
    var attending    = submissions.filter(function (s) { return s.willAttend; });
    var notAttending = submissions.filter(function (s) { return !s.willAttend; });
    var totalGuests  = attending.reduce(function (sum, s) {
        return sum + (parseInt(s.guestCount, 10) || 0);
    }, 0);

    document.getElementById('stat-total').textContent        = submissions.length;
    document.getElementById('stat-attending').textContent    = attending.length;
    document.getElementById('stat-not-attending').textContent = notAttending.length;
    document.getElementById('stat-guests').textContent       = totalGuests;
}

/* ===========================================================
   CONTROLS
   =========================================================== */

function setupSearch() {
    document.getElementById('search-input').addEventListener('input', renderAll);
}

function setupFilters() {
    var buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            buttons.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderAll();
        });
    });
}

function setupSort() {
    document.getElementById('sort-select').addEventListener('change', renderAll);
}

/* ===========================================================
   UTILITIES
   =========================================================== */

/**
 * Escapes special HTML characters in user-submitted text before
 * inserting it into the DOM as innerHTML. This prevents a type
 * of security issue called XSS (Cross-Site Scripting), where a
 * malicious user could submit a name like "<script>..." and
 * have it execute as code in your admin page.
 */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}