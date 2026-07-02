/* ===========================================================
   CALENDAR.JS
   Dynamically generates a July 2027 calendar grid (weekday
   headers + day numbers, correctly offset) and highlights the
   7th. Built with JS instead of hardcoded HTML so the logic
   is reusable and accurate (correct starting weekday, correct
   number of days), not manually guessed.
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    renderCalendar(2027, 6); // month is 0-indexed in JS Date: 6 = July
});

// Armenian weekday abbreviations, starting from Monday
const WEEKDAYS_HY = ['Երկ', 'Երք', 'Չոր', 'Հնգ', 'Ուր', 'Շբթ', 'Կիր'];

/**
 * Renders a full month calendar grid into #calendar.
 * @param {number} year - e.g. 2027
 * @param {number} month - 0-indexed (0 = January, 6 = July)
 */
function renderCalendar(year, month) {
    const calendarEl = document.getElementById('calendar');

    const grid = document.createElement('div');
    grid.classList.add('calendar-grid');

    // 1. Render weekday headers
    WEEKDAYS_HY.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.classList.add('calendar-weekday');
        dayHeader.textContent = day;
        grid.appendChild(dayHeader);
    });

    // 2. Figure out what weekday the 1st of the month falls on.
    // JS's getDay() returns 0 for Sunday...6 for Saturday, but our
    // weekday header row starts with Monday, so we convert:
    // Sunday (0) needs to become the LAST column (index 6).
    const firstDayOfMonth = new Date(year, month, 1);
    let startOffset = firstDayOfMonth.getDay() - 1; // Monday becomes 0
    if (startOffset < 0) startOffset = 6;            // Sunday wraps to 6

    // 3. Add empty placeholder cells before day 1, so day 1 lands
    // in the correct weekday column.
    for (let i = 0; i < startOffset; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-day', 'empty');
        grid.appendChild(emptyCell);
    }

    // 4. Calculate how many days are in this month.
    // Trick: day 0 of the NEXT month is the last day of THIS month.
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 5. Render each day number, highlighting the 7th.
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');
        dayCell.textContent = day;

        if (day === 7) {
            dayCell.classList.add('highlight');
        }

        grid.appendChild(dayCell);
    }

    calendarEl.appendChild(grid);
}