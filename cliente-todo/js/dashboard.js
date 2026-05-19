var calMonth;
var calYear;
var calTasks = [];

var MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
var DAY_HEADERS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

var PRIORITY_COLORS = {
    URGENTE: 'var(--bs-danger)',
    ALTA: 'var(--bs-danger)',
    MEDIA: 'var(--bs-warning)',
    BAJA: 'var(--bs-success)'
};

function initDashboard() {
    var today = new Date();
    calMonth = today.getMonth();
    calYear = today.getFullYear();

    document.getElementById('cal-prev').addEventListener('click', function () {
        calMonth--;
        if (calMonth < 0) { calMonth = 11; calYear--; }
        renderCalendar();
    });

    document.getElementById('cal-next').addEventListener('click', function () {
        calMonth++;
        if (calMonth > 11) { calMonth = 0; calYear++; }
        renderCalendar();
    });

    document.getElementById('cal-day-close').addEventListener('click', function () {
        closeDayPanel();
    });
}

function loadDashboard() {
    var loading = document.getElementById('dashboard-loading');
    var errorEl = document.getElementById('dashboard-error');
    var content = document.getElementById('dashboard-content');

    errorEl.classList.add('d-none');
    content.classList.add('d-none');
    loading.classList.remove('d-none');

    Promise.all([
        apiFetch('/tasks/dashboard').then(function (r) {
            if (!r.ok) throw new Error('Error al cargar el dashboard');
            return r.json();
        }),
        apiFetch('/tasks').then(function (r) {
            if (!r.ok) throw new Error('Error al cargar las tareas');
            return r.json();
        })
    ])
        .then(function (results) {
            renderDashboard(results[0]);
            calTasks = results[1];
            renderCalendar();
            content.classList.remove('d-none');
        })
        .catch(function (err) {
            errorEl.textContent = err.message;
            errorEl.classList.remove('d-none');
        })
        .finally(function () {
            loading.classList.add('d-none');
        });
}

function renderDashboard(data) {
    document.getElementById('dash-total').textContent = data.total;
    document.getElementById('dash-active').textContent = data.pending + data.inProgress;
    document.getElementById('dash-high-priority').textContent = data.highPriority;
    document.getElementById('dash-near-deadline').textContent = data.nearDeadline;
    document.getElementById('dash-categories').textContent = data.categoryCount;
    document.getElementById('dash-tags').textContent = data.tagCount;
}

function renderCalendar() {
    closeDayPanel();

    var title = document.getElementById('cal-title');
    title.textContent = MONTH_NAMES[calMonth] + ' ' + calYear;

    var grid = document.getElementById('cal-grid');
    grid.innerHTML = '';

    DAY_HEADERS.forEach(function (d) {
        var hdr = document.createElement('div');
        hdr.className = 'cal-header';
        hdr.textContent = d;
        grid.appendChild(hdr);
    });

    var firstDay = new Date(calYear, calMonth, 1);
    var startDow = (firstDay.getDay() + 6) % 7;
    var daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

    var tasksByDay = buildTaskMap();

    var today = new Date();
    var todayStr = today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');

    for (var i = 0; i < startDow; i++) {
        var empty = document.createElement('div');
        empty.className = 'cal-cell cal-empty';
        grid.appendChild(empty);
    }

    for (var day = 1; day <= daysInMonth; day++) {
        var dateStr = calYear + '-' +
            String(calMonth + 1).padStart(2, '0') + '-' +
            String(day).padStart(2, '0');

        var cell = document.createElement('div');
        cell.className = 'cal-cell';
        cell.dataset.date = dateStr;
        if (dateStr === todayStr) cell.classList.add('cal-today');

        var num = document.createElement('div');
        num.className = 'cal-day-num';
        num.textContent = day;
        cell.appendChild(num);

        var dayTasks = tasksByDay[dateStr];
        if (dayTasks) {
            cell.classList.add('cal-has-tasks');

            var dotsWrap = document.createElement('div');
            dotsWrap.className = 'cal-dots';

            var shown = dayTasks.slice(0, 3);
            shown.forEach(function (t) {
                var dot = document.createElement('span');
                dot.className = 'cal-dot';
                dot.style.backgroundColor = PRIORITY_COLORS[t.priority] || 'var(--bs-secondary)';
                dot.title = t.title;
                dotsWrap.appendChild(dot);
            });

            if (dayTasks.length > 3) {
                var more = document.createElement('span');
                more.className = 'cal-dot-more';
                more.textContent = '+' + (dayTasks.length - 3);
                dotsWrap.appendChild(more);
            }

            cell.appendChild(dotsWrap);

            (function (tasks, date) {
                cell.addEventListener('click', function () {
                    showDayTasks(tasks, date);
                });
            })(dayTasks, dateStr);
        }

        grid.appendChild(cell);
    }
}

function showDayTasks(tasks, dateStr) {
    var panel = document.getElementById('cal-day-panel');
    var titleEl = document.getElementById('cal-day-title');
    var list = document.getElementById('cal-day-list');

    var parts = dateStr.split('-');
    var dayNum = parseInt(parts[2], 10);
    titleEl.textContent = dayNum + ' de ' + MONTH_NAMES[parseInt(parts[1], 10) - 1];

    list.innerHTML = '';
    tasks.forEach(function (t) {
        var li = document.createElement('li');
        li.className = 'list-group-item d-flex align-items-center gap-2 py-2 px-3';

        var dot = document.createElement('span');
        dot.className = 'cal-dot flex-shrink-0';
        dot.style.backgroundColor = PRIORITY_COLORS[t.priority] || 'var(--bs-secondary)';
        li.appendChild(dot);

        var info = document.createElement('div');
        info.className = 'flex-grow-1 min-w-0';

        var name = document.createElement('div');
        name.className = 'text-truncate small fw-medium';
        name.textContent = t.title;
        info.appendChild(name);

        var badges = document.createElement('div');
        badges.className = 'd-flex gap-1 mt-1';

        if (t.status && STATUS_LABELS[t.status]) {
            var sb = document.createElement('span');
            sb.className = 'badge ' + STATUS_CLASSES[t.status];
            sb.style.fontSize = '0.65rem';
            sb.textContent = STATUS_LABELS[t.status];
            badges.appendChild(sb);
        }
        if (t.priority && PRIORITY_LABELS[t.priority]) {
            var pb = document.createElement('span');
            pb.className = 'badge ' + PRIORITY_CLASSES[t.priority];
            pb.style.fontSize = '0.65rem';
            pb.textContent = PRIORITY_LABELS[t.priority];
            badges.appendChild(pb);
        }

        info.appendChild(badges);
        li.appendChild(info);
        list.appendChild(li);
    });

    panel.classList.remove('d-none');

    document.querySelectorAll('.cal-cell.cal-selected').forEach(function (c) {
        c.classList.remove('cal-selected');
    });
    var cells = document.querySelectorAll('.cal-cell');
    cells.forEach(function (c) {
        if (c.dataset.date === dateStr) c.classList.add('cal-selected');
    });
}

function closeDayPanel() {
    document.getElementById('cal-day-panel').classList.add('d-none');
    document.querySelectorAll('.cal-cell.cal-selected').forEach(function (c) {
        c.classList.remove('cal-selected');
    });
}

function buildTaskMap() {
    var map = {};
    calTasks.forEach(function (t) {
        if (!t.deadline) return;
        var dateStr = t.deadline.substring(0, 10);
        var parts = dateStr.split('-');
        var m = parseInt(parts[1], 10) - 1;
        var y = parseInt(parts[0], 10);
        if (m === calMonth && y === calYear) {
            if (!map[dateStr]) map[dateStr] = [];
            map[dateStr].push(t);
        }
    });
    return map;
}
