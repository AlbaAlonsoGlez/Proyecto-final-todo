var ROLE_LABELS = { USER: 'Usuario', GESTOR: 'Gestor', ADMIN: 'Administrador' };
var ROLE_CLASSES = { USER: 'bg-secondary', GESTOR: 'bg-info text-dark', ADMIN: 'bg-primary' };

var AVATAR_COLORS = [
    '#883955', '#14342B', '#2c6e49', '#4a5568', '#6b46c1',
    '#c05621', '#2b6cb0', '#9b2c2c', '#276749', '#744210'
];

function getInitials(fullname, username) {
    if (fullname && fullname.trim()) {
        var parts = fullname.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return parts[0].substring(0, 2).toUpperCase();
    }
    return (username || '??').substring(0, 2).toUpperCase();
}

function getAvatarColor(username) {
    var hash = 0;
    for (var i = 0; i < (username || '').length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function avatarUrl(userId) {
    return API_BASE + '/users/' + userId + '/avatar?t=' + Date.now();
}

function renderAvatar(el, user, size) {
    if (!el || !user) return;
    var px = size || 80;
    el.style.width = px + 'px';
    el.style.height = px + 'px';

    if (user.hasAvatar) {
        el.textContent = '';
        el.style.backgroundColor = 'transparent';
        el.style.fontSize = '0';
        var img = el.querySelector('img');
        if (!img) {
            img = document.createElement('img');
            el.appendChild(img);
        }
        img.src = avatarUrl(user.id);
        img.alt = user.username;
    } else {
        var img = el.querySelector('img');
        if (img) img.remove();
        var initials = getInitials(user.fullname, user.username);
        var color = getAvatarColor(user.username);
        el.textContent = initials;
        el.style.fontSize = (px * 0.38) + 'px';
        el.style.backgroundColor = color;
    }
}

function initProfile() {
    var profileLink = document.querySelector('#top-bar [data-page="profile"]');
    if (profileLink) {
        profileLink.addEventListener('click', function () {
            navigateTo('profile');
        });
    }

    document.getElementById('btn-edit-profile').addEventListener('click', function () {
        showProfileEdit();
    });

    document.getElementById('btn-cancel-profile').addEventListener('click', function () {
        showProfileView();
    });

    document.getElementById('form-profile').addEventListener('submit', function (e) {
        e.preventDefault();
        saveProfile();
    });

    var wrapper = document.getElementById('avatar-upload-wrapper');
    var fileInput = document.getElementById('avatar-file-input');
    wrapper.addEventListener('click', function () {
        fileInput.click();
    });
    fileInput.addEventListener('change', function () {
        if (fileInput.files && fileInput.files[0]) {
            uploadAvatar(fileInput.files[0]);
            fileInput.value = '';
        }
    });

    document.getElementById('btn-remove-avatar').addEventListener('click', function () {
        removeAvatar();
    });
}

function loadProfile() {
    var alertEl = document.getElementById('profile-alert');
    var successEl = document.getElementById('profile-success');
    alertEl.classList.add('d-none');
    successEl.classList.add('d-none');

    apiFetch('/users/me')
        .then(function (res) {
            if (!res.ok) throw new Error('No se pudo cargar el perfil');
            return res.json();
        })
        .then(function (user) {
            sessionStorage.setItem('todo-user', JSON.stringify(user));
            renderProfileView(user);
            showProfileView();
        })
        .catch(function (err) {
            alertEl.textContent = err.message;
            alertEl.classList.remove('d-none');
        });
}

function renderProfileView(user) {
    document.getElementById('profile-fullname-display').textContent = user.fullname || user.username;
    document.getElementById('profile-username-display').textContent = user.username;
    document.getElementById('profile-email-display').textContent = user.email || '-';

    var badge = document.getElementById('profile-role-badge');
    badge.textContent = ROLE_LABELS[user.role] || user.role;
    badge.className = 'badge ' + (ROLE_CLASSES[user.role] || 'bg-secondary');

    renderAvatar(document.getElementById('profile-avatar'), user, 80);
    renderAvatar(document.getElementById('profile-avatar-edit'), user, 80);

    var removeBtn = document.getElementById('btn-remove-avatar');
    if (user.hasAvatar) {
        removeBtn.classList.remove('d-none');
    } else {
        removeBtn.classList.add('d-none');
    }
}

function showProfileView() {
    document.getElementById('profile-view').classList.remove('d-none');
    document.getElementById('profile-edit').classList.add('d-none');
}

function showProfileEdit() {
    var user = getStoredUser();
    if (!user) return;

    document.getElementById('profile-username-input').value = user.username || '';
    document.getElementById('profile-fullname-input').value = user.fullname || '';
    document.getElementById('profile-email-input').value = user.email || '';
    document.getElementById('profile-password-input').value = '';
    document.getElementById('profile-password2-input').value = '';

    document.getElementById('profile-view').classList.add('d-none');
    document.getElementById('profile-edit').classList.remove('d-none');
    document.getElementById('profile-alert').classList.add('d-none');
    document.getElementById('profile-success').classList.add('d-none');
}

function saveProfile() {
    var alertEl = document.getElementById('profile-alert');
    var successEl = document.getElementById('profile-success');
    alertEl.classList.add('d-none');
    successEl.classList.add('d-none');

    var username = document.getElementById('profile-username-input').value.trim();
    var fullname = document.getElementById('profile-fullname-input').value.trim();
    var email = document.getElementById('profile-email-input').value.trim();
    var password = document.getElementById('profile-password-input').value;
    var password2 = document.getElementById('profile-password2-input').value;

    if (!username || !email) {
        alertEl.textContent = 'Usuario y email son obligatorios.';
        alertEl.classList.remove('d-none');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alertEl.textContent = 'El formato del email no es válido.';
        alertEl.classList.remove('d-none');
        return;
    }

    if (password && password !== password2) {
        alertEl.textContent = 'Las contraseñas no coinciden.';
        alertEl.classList.remove('d-none');
        return;
    }

    var body = { username: username, fullname: fullname, email: email };
    if (password) body.password = password;

    var btn = document.getElementById('btn-save-profile');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    var oldUser = getStoredUser();

    apiFetch('/users/me', { method: 'PUT', body: body })
        .then(function (res) {
            if (!res.ok) return res.text().then(function (t) { throw new Error(t || 'Error al guardar'); });
            return res.json();
        })
        .then(function (updated) {
            if (password || username !== oldUser.username) {
                var loginUser = username || oldUser.username;
                var loginPass = password || atob(sessionStorage.getItem('todo-auth')).split(':').slice(1).join(':');
                saveAuth(loginUser, loginPass, updated);
            } else {
                sessionStorage.setItem('todo-user', JSON.stringify(updated));
            }

            updateTopbarUser(updated);
            updateTopbarAvatar(updated);
            renderProfileView(updated);
            showProfileView();
            successEl.textContent = 'Perfil actualizado correctamente.';
            successEl.classList.remove('d-none');
        })
        .catch(function (err) {
            alertEl.textContent = err.message;
            alertEl.classList.remove('d-none');
        })
        .finally(function () {
            btn.disabled = false;
            btn.textContent = 'Guardar';
        });
}

function uploadAvatar(file) {
    var alertEl = document.getElementById('profile-alert');
    var successEl = document.getElementById('profile-success');
    alertEl.classList.add('d-none');
    successEl.classList.add('d-none');

    if (file.size > 2 * 1024 * 1024) {
        alertEl.textContent = 'La imagen no puede superar los 2 MB.';
        alertEl.classList.remove('d-none');
        return;
    }

    var formData = new FormData();
    formData.append('file', file);

    var auth = getAuthHeader();
    var headers = {};
    if (auth) headers['Authorization'] = auth;

    fetch(API_BASE + '/users/me/avatar', {
        method: 'POST',
        headers: headers,
        body: formData
    })
        .then(function (res) {
            if (!res.ok) return res.text().then(function (t) { throw new Error(t || 'Error al subir la imagen'); });
            return res.json();
        })
        .then(function (updated) {
            sessionStorage.setItem('todo-user', JSON.stringify(updated));
            renderProfileView(updated);
            updateTopbarAvatar(updated);
            successEl.textContent = 'Foto de perfil actualizada.';
            successEl.classList.remove('d-none');
        })
        .catch(function (err) {
            alertEl.textContent = err.message;
            alertEl.classList.remove('d-none');
        });
}

function removeAvatar() {
    var alertEl = document.getElementById('profile-alert');
    var successEl = document.getElementById('profile-success');
    alertEl.classList.add('d-none');
    successEl.classList.add('d-none');

    apiFetch('/users/me/avatar', { method: 'DELETE' })
        .then(function (res) {
            if (!res.ok) return res.text().then(function (t) { throw new Error(t || 'Error al eliminar la imagen'); });
            return res.json();
        })
        .then(function (updated) {
            sessionStorage.setItem('todo-user', JSON.stringify(updated));
            renderProfileView(updated);
            updateTopbarAvatar(updated);
            successEl.textContent = 'Foto de perfil eliminada.';
            successEl.classList.remove('d-none');
        })
        .catch(function (err) {
            alertEl.textContent = err.message;
            alertEl.classList.remove('d-none');
        });
}

function updateTopbarAvatar(user) {
    renderAvatar(document.getElementById('topbar-avatar'), user, 32);
}
