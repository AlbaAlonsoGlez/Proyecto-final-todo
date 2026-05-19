var API_BASE = (location.port === '5500' || location.protocol === 'file:')
    ? 'http://localhost:8080'
    : '';

function getAuthHeader() {
    var creds = sessionStorage.getItem('todo-auth');
    if (!creds) return null;
    return 'Basic ' + creds;
}

function isLoggedIn() {
    return sessionStorage.getItem('todo-auth') !== null;
}

function getStoredUser() {
    var raw = sessionStorage.getItem('todo-user');
    return raw ? JSON.parse(raw) : null;
}

function saveAuth(username, password, user) {
    var encoded = btoa(username + ':' + password);
    sessionStorage.setItem('todo-auth', encoded);
    sessionStorage.setItem('todo-user', JSON.stringify(user));
}

function clearAuth() {
    sessionStorage.removeItem('todo-auth');
    sessionStorage.removeItem('todo-user');
}

function apiFetch(path, options) {
    options = options || {};
    var headers = options.headers || {};
    var auth = getAuthHeader();
    if (auth) {
        headers['Authorization'] = auth;
    }
    if (options.body && typeof options.body === 'object') {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
    }
    options.headers = headers;
    return fetch(API_BASE + path, options);
}

function login(username, password) {
    var encoded = btoa(username + ':' + password);
    return fetch(API_BASE + '/users/me', {
        headers: { 'Authorization': 'Basic ' + encoded }
    }).then(function (res) {
        if (!res.ok) throw new Error('Credenciales incorrectas');
        return res.json();
    }).then(function (user) {
        saveAuth(username, password, user);
        return user;
    });
}

function register(username, email, password, verifyPassword) {
    return fetch(API_BASE + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password,
            verifyPassword: verifyPassword
        })
    }).then(function (res) {
        if (!res.ok) {
            return res.text().then(function (text) {
                throw new Error(text || 'Error al registrar');
            });
        }
        return res.json();
    });
}

function logout() {
    clearAuth();
    navigateTo('login');
}
