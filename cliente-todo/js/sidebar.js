function initSidebar() {
    var sidebar = document.getElementById('sidebar');
    var toggleBtn = document.getElementById('btn-sidebar-toggle');
    var openBtn = document.getElementById('btn-sidebar-open');
    var mql = window.matchMedia('(max-width: 768px)');

    var isMobile = mql.matches;
    var userPref = localStorage.getItem('todo-sidebar-collapsed') === 'true';

    if (isMobile || userPref) {
        collapse(sidebar);
    }

    updateToggleIcon(toggleBtn, sidebar.classList.contains('collapsed'));
    updateOpenButton(sidebar, openBtn, isMobile);

    toggleBtn.addEventListener('click', function () {
        var isCollapsed = sidebar.classList.toggle('collapsed');
        if (!isMobile) {
            localStorage.setItem('todo-sidebar-collapsed', isCollapsed);
        }
        updateToggleIcon(toggleBtn, isCollapsed);
        updateOpenButton(sidebar, openBtn, isMobile);
    });

    openBtn.addEventListener('click', function () {
        sidebar.classList.remove('collapsed');
        if (!isMobile) {
            localStorage.setItem('todo-sidebar-collapsed', false);
        }
        updateToggleIcon(toggleBtn, false);
        updateOpenButton(sidebar, openBtn, isMobile);
    });

    mql.addEventListener('change', function (e) {
        isMobile = e.matches;
        if (isMobile) {
            collapse(sidebar);
        } else {
            var pref = localStorage.getItem('todo-sidebar-collapsed') === 'true';
            if (pref) {
                collapse(sidebar);
            } else {
                expand(sidebar);
            }
        }
        updateToggleIcon(toggleBtn, sidebar.classList.contains('collapsed'));
        updateOpenButton(sidebar, openBtn, isMobile);
    });
}

function collapse(sidebar) {
    sidebar.classList.add('collapsed');
}

function expand(sidebar) {
    sidebar.classList.remove('collapsed');
}

function updateToggleIcon(btn, isCollapsed) {
    var icon = btn.querySelector('i');
    icon.className = isCollapsed
        ? 'bi bi-chevron-double-right'
        : 'bi bi-chevron-double-left';
}

function updateOpenButton(sidebar, openBtn, isMobile) {
    var isCollapsed = sidebar.classList.contains('collapsed');
    if (isMobile && isCollapsed) {
        openBtn.classList.remove('d-none');
    } else {
        openBtn.classList.add('d-none');
    }
}
