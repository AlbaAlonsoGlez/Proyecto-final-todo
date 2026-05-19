var usersCache = [];
var editingUserId = null;

function isAdmin() {
    var user = getStoredUser();
    return user && user.role === 'ADMIN';
}

function updateSidebarForRole() {
    var usersNav = document.querySelector('#sidebar [data-page="users"]');
    if (usersNav) {
        usersNav.closest('li').classList.toggle('d-none', !isAdmin());
    }
}

function initUsers() {
    document.getElementById('btn-create-user').addEventListener('click', openCreateUser);
    document.getElementById('form-user').addEventListener('submit', submitUser);
    document.getElementById('btn-edit-user').addEventListener('click', switchToEditUserMode);
    document.getElementById('btn-cancel-edit-user').addEventListener('click', switchToViewUserMode);
    document.getElementById('btn-delete-user').addEventListener('click', deleteUser);
}

function loadUsers() {
    var tbody = document.getElementById('users-tbody');
    var loading = document.getElementById('users-loading');
    var errorEl = document.getElementById('users-error');
    var emptyEl = document.getElementById('users-empty');
    var tableWrapper = document.getElementById('users-table-wrapper');

    tbody.innerHTML = '';
    errorEl.classList.add('d-none');
    emptyEl.classList.add('d-none');
    tableWrapper.classList.add('d-none');
    loading.classList.remove('d-none');

    apiFetch('/users')
        .then(function (res) {
            if (!res.ok) throw new Error('Error al cargar los usuarios');
            return res.json();
        })
        .then(function (data) {
            usersCache = data;
            renderUsers();
        })
        .catch(function (err) {
            errorEl.textContent = err.message;
            errorEl.classList.remove('d-none');
        })
        .finally(function () {
            loading.classList.add('d-none');
        });
}

function getRoleBadgeClass(role) {
    if (role === 'ADMIN') return 'bg-danger';
    if (role === 'GESTOR') return 'bg-warning text-dark';
    return 'bg-primary';
}

function getRoleLabel(role) {
    if (role === 'ADMIN') return 'Admin';
    if (role === 'GESTOR') return 'Gestor';
    return 'Usuario';
}

function renderUsers() {
    var tbody = document.getElementById('users-tbody');
    var emptyEl = document.getElementById('users-empty');
    var tableWrapper = document.getElementById('users-table-wrapper');

    tbody.innerHTML = '';

    if (usersCache.length === 0) {
        emptyEl.classList.remove('d-none');
        tableWrapper.classList.add('d-none');
    } else {
        emptyEl.classList.add('d-none');
        tableWrapper.classList.remove('d-none');
        usersCache.forEach(function (user) {
            tbody.appendChild(buildUserRow(user));
        });
    }
}

function buildUserRow(user) {
    var tr = document.createElement('tr');
    tr.style.cursor = 'pointer';

    var tdUsername = document.createElement('td');
    tdUsername.className = 'fw-semibold';
    var rowAvatar = document.createElement('span');
    rowAvatar.className = 'profile-avatar d-inline-flex me-2 align-middle';
    renderAvatar(rowAvatar, user, 28);
    tdUsername.appendChild(rowAvatar);
    tdUsername.appendChild(document.createTextNode(user.username));

    var tdFullname = document.createElement('td');
    tdFullname.textContent = user.fullname || '';
    tdFullname.className = 'text-muted';

    var tdEmail = document.createElement('td');
    tdEmail.textContent = user.email || '';

    var tdRole = document.createElement('td');
    var badge = document.createElement('span');
    badge.className = 'badge ' + getRoleBadgeClass(user.role);
    badge.textContent = getRoleLabel(user.role);
    tdRole.appendChild(badge);

    var tdActions = document.createElement('td');
    tdActions.className = 'text-end';

    var btnEdit = document.createElement('button');
    btnEdit.className = 'btn btn-sm btn-outline-primary me-1';
    btnEdit.title = 'Editar';
    btnEdit.innerHTML = '<i class="bi bi-pencil"></i>';
    btnEdit.addEventListener('click', function (e) {
        e.stopPropagation();
        openViewUser(user);
        switchToEditUserMode();
    });

    var btnDelete = document.createElement('button');
    btnDelete.className = 'btn btn-sm btn-outline-danger';
    btnDelete.title = 'Eliminar';
    btnDelete.innerHTML = '<i class="bi bi-trash"></i>';
    btnDelete.addEventListener('click', function (e) {
        e.stopPropagation();
        editingUserId = user.id;
        deleteUser();
    });

    tdActions.appendChild(btnEdit);
    tdActions.appendChild(btnDelete);

    tr.appendChild(tdUsername);
    tr.appendChild(tdFullname);
    tr.appendChild(tdEmail);
    tr.appendChild(tdRole);
    tr.appendChild(tdActions);

    tr.addEventListener('click', function () { openViewUser(user); });

    return tr;
}

function openCreateUser() {
    editingUserId = null;
    document.getElementById('userModalLabel').textContent = 'Nuevo usuario';
    document.getElementById('user-alert').classList.add('d-none');
    document.getElementById('user-username-input').value = '';
    document.getElementById('user-fullname-input').value = '';
    document.getElementById('user-email-input').value = '';
    document.getElementById('user-password-input').value = '';
    document.getElementById('user-role-input').value = 'USER';
    document.getElementById('user-password-hint').textContent = '*';

    document.getElementById('user-view').classList.add('d-none');
    document.getElementById('user-form-fields').classList.remove('d-none');

    document.getElementById('btn-edit-user').classList.add('d-none');
    document.getElementById('btn-delete-user').classList.add('d-none');
    document.getElementById('btn-cancel-edit-user').classList.add('d-none');
    document.getElementById('btn-save-user').classList.remove('d-none');
    document.getElementById('btn-save-user').textContent = 'Crear';

    bootstrap.Modal.getOrCreateInstance(document.getElementById('userModal')).show();
}

function openViewUser(user) {
    editingUserId = user.id;
    document.getElementById('userModalLabel').textContent = 'Usuario';
    document.getElementById('user-alert').classList.add('d-none');

    renderAvatar(document.getElementById('user-view-avatar'), user, 64);
    document.getElementById('user-view-username').textContent = user.username;
    document.getElementById('user-view-fullname').textContent = user.fullname || '—';
    document.getElementById('user-view-email').textContent = user.email || '—';

    var roleBadge = document.getElementById('user-view-role');
    roleBadge.className = 'badge ' + getRoleBadgeClass(user.role);
    roleBadge.textContent = getRoleLabel(user.role);

    document.getElementById('user-username-input').value = user.username;
    document.getElementById('user-fullname-input').value = user.fullname || '';
    document.getElementById('user-email-input').value = user.email || '';
    document.getElementById('user-password-input').value = '';
    document.getElementById('user-role-input').value = user.role;
    document.getElementById('user-password-hint').textContent = '(dejar vacio para no cambiar)';

    document.getElementById('user-view').classList.remove('d-none');
    document.getElementById('user-form-fields').classList.add('d-none');

    document.getElementById('btn-edit-user').classList.remove('d-none');
    document.getElementById('btn-delete-user').classList.remove('d-none');
    document.getElementById('btn-cancel-edit-user').classList.add('d-none');
    document.getElementById('btn-save-user').classList.add('d-none');

    bootstrap.Modal.getOrCreateInstance(document.getElementById('userModal')).show();
}

function switchToEditUserMode() {
    document.getElementById('userModalLabel').textContent = 'Editar usuario';
    document.getElementById('user-view').classList.add('d-none');
    document.getElementById('user-form-fields').classList.remove('d-none');

    document.getElementById('btn-edit-user').classList.add('d-none');
    document.getElementById('btn-cancel-edit-user').classList.remove('d-none');
    document.getElementById('btn-save-user').classList.remove('d-none');
    document.getElementById('btn-save-user').textContent = 'Guardar';
}

function switchToViewUserMode() {
    var user = usersCache.find(function (u) { return u.id === editingUserId; });
    if (user) openViewUser(user);
}

function submitUser(e) {
    e.preventDefault();
    var alert = document.getElementById('user-alert');
    alert.classList.add('d-none');

    var username = document.getElementById('user-username-input').value.trim();
    var email = document.getElementById('user-email-input').value.trim();
    var fullname = document.getElementById('user-fullname-input').value.trim() || null;
    var password = document.getElementById('user-password-input').value;
    var role = document.getElementById('user-role-input').value;

    if (!username) {
        alert.textContent = 'El nombre de usuario es obligatorio.';
        alert.classList.remove('d-none');
        return;
    }
    if (!email) {
        alert.textContent = 'El email es obligatorio.';
        alert.classList.remove('d-none');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert.textContent = 'El formato del email no es válido.';
        alert.classList.remove('d-none');
        return;
    }

    var isEdit = editingUserId !== null;

    if (!isEdit && !password) {
        alert.textContent = 'La contrasena es obligatoria para nuevos usuarios.';
        alert.classList.remove('d-none');
        return;
    }

    var body = { username: username, email: email, fullname: fullname, role: role };
    if (password) {
        body.password = password;
    }

    var btn = document.getElementById('btn-save-user');
    btn.disabled = true;

    var url = isEdit ? '/users/' + editingUserId : '/users';
    var method = isEdit ? 'PUT' : 'POST';

    apiFetch(url, { method: method, body: body })
        .then(function (res) {
            if (!res.ok) {
                return res.text().then(function (text) {
                    throw new Error(text || 'Error al guardar el usuario');
                });
            }
            return res.json();
        })
        .then(function () {
            bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
            loadUsers();
        })
        .catch(function (err) {
            alert.textContent = err.message;
            alert.classList.remove('d-none');
        })
        .finally(function () {
            btn.disabled = false;
        });
}

function deleteUser() {
    if (!editingUserId) return;
    if (!confirm('¿Seguro que quieres eliminar este usuario?')) return;

    var btn = document.getElementById('btn-delete-user');
    btn.disabled = true;

    apiFetch('/users/' + editingUserId, { method: 'DELETE' })
        .then(function (res) {
            if (!res.ok) {
                return res.text().then(function (text) {
                    throw new Error(text || 'Error al eliminar el usuario');
                });
            }
            var modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
            if (modal) modal.hide();
            loadUsers();
        })
        .catch(function (err) {
            var alert = document.getElementById('user-alert');
            alert.textContent = err.message;
            alert.classList.remove('d-none');
        })
        .finally(function () {
            btn.disabled = false;
        });
}
