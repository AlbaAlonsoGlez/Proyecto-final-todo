var PAGE_TITLES = {
    dashboard:  'Dashboard',
    tasks:      'Tareas',
    categories: 'Categorías',
    tags:       'Etiquetas',
    users:      'Usuarios',
    profile:    'Mi Perfil',
    login:      'Iniciar Sesión'
};

function initRouter() {
    var navLinks = document.querySelectorAll('#sidebar [data-page]');

    navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            var page = this.getAttribute('data-page');
            navigateTo(page);
        });
    });

    if (isLoggedIn()) {
        navigateTo('dashboard');
    } else {
        navigateTo('login');
    }

    document.getElementById('app-wrapper').classList.add('app-ready');
}

function navigateTo(pageName) {
    if (pageName !== 'login' && !isLoggedIn()) {
        pageName = 'login';
    }

    var onLogin = pageName === 'login';
    var sidebar = document.getElementById('sidebar');
    var topBar = document.getElementById('top-bar');

    if (onLogin) {
        sidebar.classList.add('d-none');
        topBar.classList.add('d-none');
    } else {
        sidebar.classList.remove('d-none');
        topBar.classList.remove('d-none');
    }

    var sections = document.querySelectorAll('.page-section');
    sections.forEach(function (s) {
        s.classList.add('d-none');
    });

    var target = document.getElementById('page-' + pageName);
    if (target) {
        target.classList.remove('d-none');
    }

    if (pageName === 'dashboard' && typeof loadDashboard === 'function') {
        loadDashboard();
    }

    if (pageName === 'tasks' && typeof loadTasks === 'function') {
        loadTasks();
    }

    if (pageName === 'categories' && typeof loadCategories === 'function') {
        loadCategories();
    }

    if (pageName === 'tags' && typeof loadTags === 'function') {
        loadTags();
    }

    if (pageName === 'users' && typeof loadUsers === 'function') {
        loadUsers();
    }

    if (pageName === 'profile' && typeof loadProfile === 'function') {
        loadProfile();
    }

    var title = document.getElementById('page-title');
    var titleWrapper = title.parentElement;
    if (onLogin) {
        titleWrapper.classList.add('d-none');
    } else {
        titleWrapper.classList.remove('d-none');
        title.textContent = PAGE_TITLES[pageName] || pageName;
    }

    var createTaskBtn = document.getElementById('btn-create-task');
    if (createTaskBtn) {
        if (pageName === 'tasks') {
            createTaskBtn.classList.remove('d-none');
            createTaskBtn.classList.add('d-flex');
        } else {
            createTaskBtn.classList.add('d-none');
            createTaskBtn.classList.remove('d-flex');
        }
    }

    var createCatBtn = document.getElementById('btn-create-category');
    if (createCatBtn) {
        var showCatBtn = pageName === 'categories' && typeof canManageCategories === 'function' && canManageCategories();
        if (showCatBtn) {
            createCatBtn.classList.remove('d-none');
            createCatBtn.classList.add('d-flex');
        } else {
            createCatBtn.classList.add('d-none');
            createCatBtn.classList.remove('d-flex');
        }
    }

    var createTagBtn = document.getElementById('btn-create-tag');
    if (createTagBtn) {
        var showTagBtn = pageName === 'tags' && typeof canManageTags === 'function' && canManageTags();
        if (showTagBtn) {
            createTagBtn.classList.remove('d-none');
            createTagBtn.classList.add('d-flex');
        } else {
            createTagBtn.classList.add('d-none');
            createTagBtn.classList.remove('d-flex');
        }
    }

    var createUserBtn = document.getElementById('btn-create-user');
    if (createUserBtn) {
        var showUserBtn = pageName === 'users' && typeof isAdmin === 'function' && isAdmin();
        if (showUserBtn) {
            createUserBtn.classList.remove('d-none');
            createUserBtn.classList.add('d-flex');
        } else {
            createUserBtn.classList.add('d-none');
            createUserBtn.classList.remove('d-flex');
        }
    }

    var navLinks = document.querySelectorAll('#sidebar [data-page]');
    navLinks.forEach(function (link) {
        var icon = link.querySelector('i[data-icon]');
        var isActive = link.getAttribute('data-page') === pageName;

        link.classList.toggle('active', isActive);

        if (icon) {
            var base = icon.getAttribute('data-icon');
            icon.className = isActive
                ? 'bi bi-' + base + '-fill fs-5'
                : 'bi bi-' + base + ' fs-5';
        }
    });

    var isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile && !onLogin) {
        sidebar.classList.add('collapsed');
        updateOpenButton(sidebar, document.getElementById('btn-sidebar-open'), true);
    }
}
