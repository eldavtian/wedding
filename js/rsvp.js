/* ===========================================================
   RSVP.JS (updated in Step 12)
   Now sends real data to Google Sheets via Apps Script.
   Local duplicate check remains for instant feedback,
   but the server performs the authoritative check before saving.
   =========================================================== */

// Your deployed Google Apps Script URL - the bridge between
// this form and your Google Sheet.
var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzcxuJp0hARL4lUH8Z_Oo6MZOs__mCBAWPrsVArpb7j3fYQpSSJCYR9yvhlyonAwtDo/exec';

document.addEventListener('DOMContentLoaded', function () {
    initRsvpForm();
});

function initRsvpForm() {
    var form = document.getElementById('rsvp-form');
    if (!form) return;

    var attendanceRadios = document.querySelectorAll('input[name="attendance"]');
    var guestCountWrapper = document.getElementById('guest-count-wrapper');

    // Show/hide guest count based on attendance selection
    attendanceRadios.forEach(function (radio) {
        radio.addEventListener('change', function () {
            if (radio.value === 'yes' && radio.checked) {
                guestCountWrapper.classList.add('visible');
            } else if (radio.value === 'no' && radio.checked) {
                guestCountWrapper.classList.remove('visible');
            }
        });
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        handleRsvpSubmit(form);
    });
}

function handleRsvpSubmit(form) {
    clearFieldErrors(form);

    var name       = form.querySelector('#guest-name').value.trim();
    var side       = form.querySelector('input[name="side"]:checked');
    var attendance = form.querySelector('input[name="attendance"]:checked');
    var guestCount = form.querySelector('#guest-count').value;

    // --- Client-side validation ---
    var isValid = true;

    if (name.length < 2) {
        markFieldInvalid(form.querySelector('#guest-name'));
        isValid = false;
    }
    if (!side) {
        markFieldInvalid(form.querySelector('#side-group'));
        isValid = false;
    }
    if (!attendance) {
        markFieldInvalid(form.querySelector('#attendance-group'));
        isValid = false;
    }

    if (!isValid) {
        showRsvpMessage('Խնդրում ենք լրացնել բոլոր դաշտերը։', 'error');
        return;
    }

    // --- Fast local duplicate check first ---
    // This gives the user instant feedback if they already
    // submitted from this same browser, without waiting for a
    // full server round-trip.
   

    // --- Build submission object ---
    var submission = {
        id:          generateId(),
        name:        name,
        side:        side.value,
        willAttend:  attendance.value === 'yes',
        guestCount:  attendance.value === 'yes' ? parseInt(guestCount, 10) : 0,
        submittedAt: new Date().toISOString()
    };

    // --- Disable button + show loading state ---
    var submitBtn = form.querySelector('#rsvp-submit');
    submitBtn.disabled  = true;
   submitBtn.textContent = '⏳ Ուղարկվում է...';

    // --- Send to Google Sheets ---
    sendToGoogleSheets(submission)
        .then(function (response) {
            if (response.success) {
                // Server accepted it - save locally too so our
                // fast local-duplicate-check works next time
               
                var isAttending = submission.willAttend;
var message = isAttending
    ? '🌸 Շնորհակալություն Ձեր պատասխանի համար։ Անհամբեր սպասում ենք Ձեզ մեր հարսանիքին։'
    : 'Շնորհակալություն Ձեր պատասխանի համար։ Շատ ափսոս, որ այդ օրը մեր կողքին չեք կարող լինել։ Մենք լիովին հասկանում ենք և հուսով ենք՝ շուտով կունենանք միասին հանդիպելու հնարավորություն։ Սիրով՝ Էլեն և Դավիթ ❤️';
showRsvpMessage(message, 'success');
                form.reset();
                document.getElementById('guest-count-wrapper').classList.remove('visible');
            } else if (response.error === 'duplicate') {
                // Server found a duplicate that our local check
                // didn't catch (submitted from a different device)
                showRsvpMessage(
                    'Այս անունով պատասխան արդեն գոյություն ունի։ Եթե դուք այլ անձ եք, խնդրում ենք նշել ազգանունը։',
                    'error'
                );
            } else {
                showRsvpMessage(
                    'Սխալ է տեղի ունեցել։ Խնդրում ենք կրկին փորձել։',
                    'error'
                );
            }
        })
        .catch(function () {
            showRsvpMessage(
                'Կապի սխալ։ Խնդրում ենք ստուգել ինտերնետ կապը և կրկին փորձել։',
                'error'
            );
        })
        .finally(function () {
            submitBtn.disabled    = false;
            submitBtn.textContent = 'Ուղարկել պատասխան';
        });
}

/**
 * Sends the submission object to Apps Script via a POST request.
 * Returns a Promise that resolves with the server's JSON response.
 *
 * Why 'no-cors' is NOT used here: Apps Script web apps support
 * real CORS when deployed as "Anyone" access, so we get back a
 * proper JSON response we can actually read.
 */
// WITH THIS:
function sendToGoogleSheets(submission) {
    return fetch(APPS_SCRIPT_URL, {
        method:      'POST',
        body:        JSON.stringify(submission)
        // No Content-Type header - this avoids the CORS
        // preflight OPTIONS request that Apps Script
        // can't respond to, which was causing the error.
        // Apps Script receives e.postData.contents either way.
    })
    .then(function (res) {
        return res.json();
    });
}

// ---------- Helper functions (unchanged from Step 11) ----------

function markFieldInvalid(el) {
    el.classList.add('field-invalid');
}

function clearFieldErrors(form) {
    form.querySelectorAll('.field-invalid').forEach(function (el) {
        el.classList.remove('field-invalid');
    });
}

function showRsvpMessage(text, type) {
    var messageEl       = document.getElementById('rsvp-message');
    messageEl.textContent = text;
    messageEl.className = type;
    messageEl.hidden    = false;

    // Scroll the message into view smoothly so the user
    // actually sees it without having to scroll manually
    messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function normalizeName(name) {
    return name.trim().toLowerCase();
}

function generateId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

