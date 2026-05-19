function initTheme() {
    var saved = localStorage.getItem('todo-theme') || 'light';
    applyTheme(saved);

    var btn = document.getElementById('btn-theme-toggle');
    btn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-bs-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('todo-theme', next);
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);

    var icon = document.querySelector('#btn-theme-toggle i');
    if (theme === 'dark') {
        icon.className = 'bi bi-brightness-high-fill fs-5';
    } else {
        icon.className = 'bi bi-moon-stars-fill fs-5';
    }
}
