document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initSidebar();
    initRouter();
    initDashboard();
    initTasks();
    initCategories();
    initTags();
    initUsers();
    initProfile();
    initAuth();
});

function initAuth() {
    var formLogin = document.getElementById('form-login');
    var formRegister = document.getElementById('form-register');
    var showRegister = document.getElementById('show-register');
    var showLogin = document.getElementById('show-login');
    var btnLogout = document.getElementById('btn-logout');

    showRegister.addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById('login-form-wrapper').classList.add('d-none');
        document.getElementById('register-form-wrapper').classList.remove('d-none');
        clearAlerts();
    });

    showLogin.addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById('register-form-wrapper').classList.add('d-none');
        document.getElementById('login-form-wrapper').classList.remove('d-none');
        clearAlerts();
    });

    formLogin.addEventListener('submit', function (e) {
        e.preventDefault();
        var username = document.getElementById('login-username').value.trim();
        var password = document.getElementById('login-password').value;
        var alert = document.getElementById('login-alert');

        if (!username || !password) {
            showAlert(alert, 'Completa todos los campos.');
            return;
        }

        var btn = document.getElementById('btn-login');
        btn.disabled = true;
        btn.textContent = 'Entrando...';

        login(username, password)
            .then(function (user) {
                updateTopbarUser(user);
                updateTopbarAvatar(user);
                updateSidebarForRole();
                formLogin.reset();
                navigateTo('dashboard');
            })
            .catch(function (err) {
                showAlert(alert, err.message);
            })
            .finally(function () {
                btn.disabled = false;
                btn.textContent = 'Iniciar Sesión';
            });
    });

    formRegister.addEventListener('submit', function (e) {
        e.preventDefault();
        var username = document.getElementById('reg-username').value.trim();
        var email = document.getElementById('reg-email').value.trim();
        var password = document.getElementById('reg-password').value;
        var password2 = document.getElementById('reg-password2').value;
        var alert = document.getElementById('register-alert');
        var success = document.getElementById('register-success');

        success.classList.add('d-none');

        if (!username || !email || !password || !password2) {
            showAlert(alert, 'Completa todos los campos.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showAlert(alert, 'El formato del email no es válido.');
            return;
        }
        if (password !== password2) {
            showAlert(alert, 'Las contraseñas no coinciden.');
            return;
        }

        var btn = document.getElementById('btn-register');
        btn.disabled = true;
        btn.textContent = 'Registrando...';

        register(username, email, password, password2)
            .then(function () {
                alert.classList.add('d-none');
                success.textContent = 'Cuenta creada. Ya puedes iniciar sesión.';
                success.classList.remove('d-none');
                formRegister.reset();
            })
            .catch(function (err) {
                showAlert(alert, err.message);
            })
            .finally(function () {
                btn.disabled = false;
                btn.textContent = 'Registrarse';
            });
    });

    var logoutModal = document.getElementById('logoutModal');
    btnLogout.addEventListener('click', function () {
        bootstrap.Modal.getOrCreateInstance(logoutModal).show();
    });
    document.getElementById('btn-confirm-logout').addEventListener('click', function () {
        bootstrap.Modal.getInstance(logoutModal).hide();
        logout();
    });

    if (isLoggedIn()) {
        var user = getStoredUser();
        if (user) {
            updateTopbarUser(user);
            updateTopbarAvatar(user);
            updateSidebarForRole();
        }
    }

    buildLoginDecorations();
}

function buildLoginDecorations() {
    var container = document.getElementById('login-decorations');
    if (!container) return;
    container.innerHTML = '';

    var colors = ['#c87a9a', '#6e2d44'];
    var iconSize = 24;
    var gapX = 48;
    var gapY = 28;
    var w = window.innerWidth;
    var h = window.innerHeight;
    var cols = Math.ceil(w / (iconSize + gapX)) + 2;
    var rows = Math.ceil(h / (iconSize + gapY)) + 2;

    for (var r = 0; r < rows; r++) {
        var row = document.createElement('div');
        row.className = 'deco-row' + (r % 2 === 1 ? ' deco-offset' : '');
        for (var c = 0; c < cols; c++) {
            var isCat = (r + c) % 2 === 0;
            var el;
            if (isCat) {
                el = document.createElement('span');
                el.className = 'deco deco-cat';
            } else {
                el = document.createElement('i');
                el.className = 'deco deco-heart bi bi-heart-fill';
            }
            el.style.color = colors[(r + c) % 2];
            row.appendChild(el);
        }
        container.appendChild(row);
    }
}

var decoResizeTimer;
window.addEventListener('resize', function () {
    clearTimeout(decoResizeTimer);
    decoResizeTimer = setTimeout(buildLoginDecorations, 200);
});

function updateTopbarUser(user) {
    var el = document.getElementById('topbar-username');
    if (el && user) {
        el.textContent = user.username || 'Mi Perfil';
    }
}

function showAlert(el, message) {
    el.textContent = message;
    el.classList.remove('d-none');
}

function clearAlerts() {
    var alerts = document.querySelectorAll('#page-login .alert');
    alerts.forEach(function (a) { a.classList.add('d-none'); });
}
