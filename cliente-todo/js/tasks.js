var tasksCache = [];
var categoriesCache = [];
var tagsCache = [];
var filtersLoaded = false;

var STATUS_LABELS = {
    PENDIENTE: 'Pendiente',
    EN_PROGRESO: 'En progreso',
    COMPLETADA: 'Completada'
};

var STATUS_CLASSES = {
    PENDIENTE: 'badge-status-pendiente',
    EN_PROGRESO: 'badge-status-progreso',
    COMPLETADA: 'badge-status-completada'
};

var PRIORITY_LABELS = {
    BAJA: 'Baja',
    MEDIA: 'Media',
    ALTA: 'Alta',
    URGENTE: 'Urgente'
};

var PRIORITY_CLASSES = {
    BAJA: 'bg-success-subtle text-success-emphasis',
    MEDIA: 'bg-warning-subtle text-warning-emphasis',
    ALTA: 'bg-danger-subtle text-danger-emphasis',
    URGENTE: 'bg-danger text-white'
};

var MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

var editingTaskId = null;
var editingTaskData = null;

function initTasks() {
    document.getElementById('filter-status').addEventListener('change', onFilterChange);
    document.getElementById('filter-priority').addEventListener('change', onFilterChange);
    document.getElementById('filter-category').addEventListener('change', onFilterChange);
    document.getElementById('filter-tag').addEventListener('change', onFilterChange);
    document.getElementById('filter-search').addEventListener('input', onFilterChange);

    document.getElementById('filter-important').addEventListener('click', function () {
        var active = this.getAttribute('data-active') === 'true';
        this.setAttribute('data-active', String(!active));
        this.classList.toggle('active', !active);
        this.querySelector('i').className = !active ? 'bi bi-star-fill' : 'bi bi-star';
        onFilterChange();
    });

    document.getElementById('filter-overdue').addEventListener('click', function () {
        var active = this.getAttribute('data-active') === 'true';
        this.setAttribute('data-active', String(!active));
        this.classList.toggle('active', !active);
        onFilterChange();
    });

    document.getElementById('btn-create-task').addEventListener('click', openCreateModal);
    document.getElementById('form-create-task').addEventListener('submit', submitCreateTask);

    document.getElementById('btn-edit-task').addEventListener('click', switchTaskToEditMode);
    document.getElementById('btn-cancel-edit-task').addEventListener('click', switchTaskToViewMode);
    document.getElementById('btn-delete-task').addEventListener('click', deleteTask);
    document.getElementById('form-edit-task').addEventListener('submit', submitEditTask);
}

function loadTasks() {
    var grid = document.getElementById('tasks-grid');
    var loading = document.getElementById('tasks-loading');
    var errorEl = document.getElementById('tasks-error');
    var emptyEl = document.getElementById('tasks-empty');
    var countEl = document.getElementById('tasks-count');

    grid.innerHTML = '';
    errorEl.classList.add('d-none');
    emptyEl.classList.add('d-none');
    countEl.textContent = '';
    loading.classList.remove('d-none');

    var fetchTasks = apiFetch('/tasks').then(function (res) {
        if (!res.ok) throw new Error('Error al cargar las tareas');
        return res.json();
    });

    var fetchMeta = loadFilterOptions();

    Promise.all([fetchTasks, fetchMeta])
        .then(function (results) {
            tasksCache = results[0];
            onFilterChange();
        })
        .catch(function (err) {
            errorEl.textContent = err.message;
            errorEl.classList.remove('d-none');
        })
        .finally(function () {
            loading.classList.add('d-none');
        });
}

function loadFilterOptions() {
    if (filtersLoaded) return Promise.resolve();

    var fetchCategories = apiFetch('/categories').then(function (res) {
        return res.ok ? res.json() : [];
    }).catch(function () { return []; });

    var fetchTags = apiFetch('/tags').then(function (res) {
        return res.ok ? res.json() : [];
    }).catch(function () { return []; });

    return Promise.all([fetchCategories, fetchTags]).then(function (results) {
        categoriesCache = results[0];
        tagsCache = results[1];

        var catSelect = document.getElementById('filter-category');
        categoriesCache.forEach(function (cat) {
            var opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.title;
            catSelect.appendChild(opt);
        });

        var tagSelect = document.getElementById('filter-tag');
        tagsCache.forEach(function (tag) {
            var opt = document.createElement('option');
            opt.value = tag.id;
            opt.textContent = tag.name;
            tagSelect.appendChild(opt);
        });

        filtersLoaded = true;
    });
}

function applyFilters() {
    var status = document.getElementById('filter-status').value;
    var priority = document.getElementById('filter-priority').value;
    var categoryId = document.getElementById('filter-category').value;
    var tagId = document.getElementById('filter-tag').value;
    var importantActive = document.getElementById('filter-important').getAttribute('data-active') === 'true';
    var overdueActive = document.getElementById('filter-overdue').getAttribute('data-active') === 'true';
    var search = document.getElementById('filter-search').value.trim().toLowerCase();
    var now = new Date();

    var filtered = tasksCache.filter(function (task) {
        if (status && task.status !== status) return false;
        if (priority && task.priority !== priority) return false;
        if (importantActive && !task.important) return false;
        if (overdueActive) {
            if (!task.deadline || task.status === 'COMPLETADA') return false;
            if (new Date(task.deadline) >= now) return false;
        }
        if (categoryId) {
            var found = task.categories && task.categories.some(function (c) {
                return String(c.id) === categoryId;
            });
            if (!found) return false;
        }
        if (tagId) {
            var found = task.tags && task.tags.some(function (t) {
                return String(t.id) === tagId;
            });
            if (!found) return false;
        }
        if (search && (!task.title || task.title.toLowerCase().indexOf(search) === -1)) return false;
        return true;
    });

    return filtered;
}

function renderTasks(filtered) {
    var grid = document.getElementById('tasks-grid');
    var emptyEl = document.getElementById('tasks-empty');
    var emptyMsg = document.getElementById('tasks-empty-msg');
    var countEl = document.getElementById('tasks-count');

    grid.innerHTML = '';

    if (filtered.length === 0) {
        if (tasksCache.length === 0) {
            emptyMsg.textContent = 'No tienes tareas todavia.';
        } else {
            emptyMsg.textContent = 'No se encontraron tareas con los filtros seleccionados.';
        }
        emptyEl.classList.remove('d-none');
        countEl.textContent = '';
    } else {
        emptyEl.classList.add('d-none');
        if (filtered.length === tasksCache.length) {
            countEl.textContent = filtered.length + ' tarea' + (filtered.length !== 1 ? 's' : '');
        } else {
            countEl.textContent = 'Mostrando ' + filtered.length + ' de ' + tasksCache.length + ' tareas';
        }
        filtered.forEach(function (task) {
            grid.appendChild(buildTaskCard(task));
        });
    }
}

function buildTaskCard(task) {
    var col = document.createElement('div');
    col.className = 'col';

    var card = document.createElement('div');
    card.className = 'card h-100 task-card';
    card.addEventListener('click', function () { openTaskDetail(task); });

    var body = document.createElement('div');
    body.className = 'card-body d-flex flex-column';

    // Header: title + important star
    var header = document.createElement('div');
    header.className = 'd-flex justify-content-between align-items-start mb-2';

    var title = document.createElement('h6');
    title.className = 'card-title mb-0 task-title-clamp';
    title.textContent = task.title || 'Sin titulo';
    header.appendChild(title);

    if (task.important) {
        var star = document.createElement('i');
        star.className = 'bi bi-star-fill text-warning ms-2 flex-shrink-0';
        header.appendChild(star);
    }
    body.appendChild(header);

    // Badges: status + priority
    var badges = document.createElement('div');
    badges.className = 'd-flex flex-wrap gap-1 mb-2';

    if (task.status && STATUS_LABELS[task.status]) {
        var statusBadge = document.createElement('span');
        statusBadge.className = 'badge ' + STATUS_CLASSES[task.status];
        statusBadge.textContent = STATUS_LABELS[task.status];
        badges.appendChild(statusBadge);
    }

    if (task.priority && PRIORITY_LABELS[task.priority]) {
        var priorityBadge = document.createElement('span');
        priorityBadge.className = 'badge ' + PRIORITY_CLASSES[task.priority];
        priorityBadge.textContent = PRIORITY_LABELS[task.priority];
        badges.appendChild(priorityBadge);
    }

    if (badges.childNodes.length > 0) {
        body.appendChild(badges);
    }

    // Description
    var desc = document.createElement('p');
    desc.className = 'card-text text-muted small task-desc-clamp mb-2';
    if (task.description) {
        desc.textContent = task.description;
    } else {
        desc.innerHTML = '<em>Sin descripcion</em>';
    }
    body.appendChild(desc);

    // Footer: pills + deadline
    var footer = document.createElement('div');
    footer.className = 'mt-auto';

    // Category + tag pills
    var hasCats = task.categories && task.categories.length > 0;
    var hasTags = task.tags && task.tags.length > 0;
    if (hasCats || hasTags) {
        var pills = document.createElement('div');
        pills.className = 'd-flex flex-wrap gap-1 mb-2';

        if (hasCats) {
            task.categories.forEach(function (cat) {
                var pill = document.createElement('span');
                pill.className = 'badge';
                pill.textContent = cat.title;
                applyCategoryBadgeStyle(pill, getCategoryColor(cat));
                pills.appendChild(pill);
            });
        }
        if (hasTags) {
            task.tags.forEach(function (tag) {
                var pill = document.createElement('span');
                pill.className = 'badge badge-tag';
                pill.textContent = tag.name;
                pills.appendChild(pill);
            });
        }
        footer.appendChild(pills);
    }

    // Deadline
    if (task.deadline) {
        var deadlineDiv = document.createElement('div');
        deadlineDiv.className = 'small text-muted';

        var isOverdue = task.status !== 'COMPLETADA' && new Date(task.deadline) < new Date();
        if (isOverdue) {
            deadlineDiv.className = 'small task-overdue';
        }

        var icon = document.createElement('i');
        icon.className = 'bi bi-calendar-event me-1';
        deadlineDiv.appendChild(icon);

        var deadlineText = document.createTextNode(formatDate(task.deadline));
        deadlineDiv.appendChild(deadlineText);

        footer.appendChild(deadlineDiv);
    }

    // Author
    if (task.author) {
        var authorDiv = document.createElement('div');
        authorDiv.className = 'small text-muted d-flex align-items-center mt-2';
        var authorAvatar = document.createElement('span');
        authorAvatar.className = 'profile-avatar d-inline-flex me-1';
        renderAvatar(authorAvatar, task.author, 20);
        authorDiv.appendChild(authorAvatar);
        var authorName = document.createTextNode(task.author.fullname || task.author.username);
        authorDiv.appendChild(authorName);
        footer.appendChild(authorDiv);
    }

    body.appendChild(footer);
    card.appendChild(body);
    col.appendChild(card);
    return col;
}

function openTaskDetail(task) {
    editingTaskId = task.id;
    editingTaskData = task;

    document.getElementById('edit-task-alert').classList.add('d-none');
    document.getElementById('task-view').classList.remove('d-none');
    document.getElementById('task-edit-fields').classList.add('d-none');

    document.getElementById('btn-edit-task').classList.remove('d-none');
    document.getElementById('btn-delete-task').classList.remove('d-none');
    document.getElementById('btn-cancel-edit-task').classList.add('d-none');
    document.getElementById('btn-save-task').classList.add('d-none');

    document.getElementById('taskDetailModalLabel').textContent = task.title || 'Sin titulo';

    // Badges
    var badgesContainer = document.getElementById('modal-badges');
    badgesContainer.innerHTML = '';

    if (task.important) {
        var star = document.createElement('span');
        star.className = 'badge bg-warning text-dark';
        star.innerHTML = '<i class="bi bi-star-fill me-1"></i>Importante';
        badgesContainer.appendChild(star);
    }
    if (task.status && STATUS_LABELS[task.status]) {
        var sb = document.createElement('span');
        sb.className = 'badge ' + STATUS_CLASSES[task.status];
        sb.textContent = STATUS_LABELS[task.status];
        badgesContainer.appendChild(sb);
    }
    if (task.priority && PRIORITY_LABELS[task.priority]) {
        var pb = document.createElement('span');
        pb.className = 'badge ' + PRIORITY_CLASSES[task.priority];
        pb.textContent = PRIORITY_LABELS[task.priority];
        badgesContainer.appendChild(pb);
    }

    // Deadline
    var deadlineRow = document.getElementById('modal-deadline-row');
    if (task.deadline) {
        deadlineRow.classList.remove('d-none');
        var deadlineSpan = document.getElementById('modal-deadline');
        deadlineSpan.textContent = formatDate(task.deadline);
        var isOverdue = task.status !== 'COMPLETADA' && new Date(task.deadline) < new Date();
        deadlineRow.className = isOverdue ? 'mb-3 task-overdue' : 'mb-3';
    } else {
        deadlineRow.classList.add('d-none');
    }

    // Description
    var descEl = document.getElementById('modal-description');
    if (task.description) {
        descEl.textContent = task.description;
    } else {
        descEl.innerHTML = '<em class="text-muted">Sin descripcion</em>';
    }

    // Comments
    var commentsSection = document.getElementById('modal-comments-section');
    var commentsEl = document.getElementById('modal-comments');
    if (task.comments) {
        commentsEl.textContent = task.comments;
        commentsSection.classList.remove('d-none');
    } else {
        commentsSection.classList.add('d-none');
    }

    // Categories
    var catSection = document.getElementById('modal-categories-section');
    var catContainer = document.getElementById('modal-categories');
    catContainer.innerHTML = '';
    if (task.categories && task.categories.length > 0) {
        task.categories.forEach(function (cat) {
            var pill = document.createElement('span');
            pill.className = 'badge';
            pill.textContent = cat.title;
            applyCategoryBadgeStyle(pill, getCategoryColor(cat));
            catContainer.appendChild(pill);
        });
        catSection.classList.remove('d-none');
    } else {
        catSection.classList.add('d-none');
    }

    // Tags
    var tagSection = document.getElementById('modal-tags-section');
    var tagContainer = document.getElementById('modal-tags');
    tagContainer.innerHTML = '';
    if (task.tags && task.tags.length > 0) {
        task.tags.forEach(function (tag) {
            var pill = document.createElement('span');
            pill.className = 'badge badge-tag';
            pill.textContent = tag.name;
            tagContainer.appendChild(pill);
        });
        tagSection.classList.remove('d-none');
    } else {
        tagSection.classList.add('d-none');
    }

    // Author
    var authorSection = document.getElementById('modal-author-section');
    if (task.author) {
        document.getElementById('modal-author-name').textContent = task.author.fullname || task.author.username;
        document.getElementById('modal-author-role').textContent = task.author.role || '';
        renderAvatar(document.getElementById('modal-author-avatar'), task.author, 32);
        authorSection.classList.remove('d-none');
    } else {
        authorSection.classList.add('d-none');
    }

    // Timestamps
    document.getElementById('modal-createdAt').textContent = task.createdAt ? formatDate(task.createdAt) : '-';

    var updatedSection = document.getElementById('modal-updatedAt-section');
    if (task.updatedAt) {
        document.getElementById('modal-updatedAt').textContent = formatDate(task.updatedAt);
        updatedSection.classList.remove('d-none');
    } else {
        updatedSection.classList.add('d-none');
    }

    bootstrap.Modal.getOrCreateInstance(document.getElementById('taskDetailModal')).show();
}

function onFilterChange() {
    var filtered = applyFilters();
    renderTasks(filtered);
}

function openCreateModal() {
    var form = document.getElementById('form-create-task');
    form.reset();
    document.getElementById('create-task-alert').classList.add('d-none');

    var catSelect = document.getElementById('create-categories');
    catSelect.innerHTML = '';
    categoriesCache.forEach(function (cat) {
        var opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.title;
        catSelect.appendChild(opt);
    });

    var tagSelect = document.getElementById('create-tags');
    tagSelect.innerHTML = '';
    tagsCache.forEach(function (tag) {
        var opt = document.createElement('option');
        opt.value = tag.id;
        opt.textContent = tag.name;
        tagSelect.appendChild(opt);
    });

    bootstrap.Modal.getOrCreateInstance(document.getElementById('createTaskModal')).show();
}

function submitCreateTask(e) {
    e.preventDefault();
    var alert = document.getElementById('create-task-alert');
    alert.classList.add('d-none');

    var title = document.getElementById('create-title').value.trim();
    if (!title) {
        alert.textContent = 'El titulo es obligatorio.';
        alert.classList.remove('d-none');
        return;
    }

    var description = document.getElementById('create-description').value.trim();
    var comments = document.getElementById('create-comments').value.trim();
    var status = document.getElementById('create-status').value;
    var priority = document.getElementById('create-priority').value;
    var deadline = document.getElementById('create-deadline').value;
    var important = document.getElementById('create-important').checked;

    var catSelect = document.getElementById('create-categories');
    var categoryIds = Array.from(catSelect.selectedOptions).map(function (o) { return Number(o.value); });

    var tagSelect = document.getElementById('create-tags');
    var tagIds = Array.from(tagSelect.selectedOptions).map(function (o) { return Number(o.value); });

    var body = {
        title: title,
        description: description || null,
        comments: comments || null,
        status: status,
        priority: priority || null,
        deadline: deadline || null,
        important: important,
        completed: status === 'COMPLETADA',
        categoryIds: categoryIds,
        tagIds: tagIds
    };

    var btn = document.getElementById('btn-submit-task');
    btn.disabled = true;
    btn.textContent = 'Creando...';

    apiFetch('/tasks', { method: 'POST', body: body })
        .then(function (res) {
            if (!res.ok) {
                return res.text().then(function (text) {
                    throw new Error(text || 'Error al crear la tarea');
                });
            }
            return res.json();
        })
        .then(function () {
            bootstrap.Modal.getInstance(document.getElementById('createTaskModal')).hide();
            loadTasks();
        })
        .catch(function (err) {
            alert.textContent = err.message;
            alert.classList.remove('d-none');
        })
        .finally(function () {
            btn.disabled = false;
            btn.textContent = 'Crear tarea';
        });
}

function switchTaskToEditMode() {
    var task = editingTaskData;
    if (!task) return;

    document.getElementById('taskDetailModalLabel').textContent = 'Editar tarea';
    document.getElementById('task-view').classList.add('d-none');
    document.getElementById('task-edit-fields').classList.remove('d-none');

    document.getElementById('btn-edit-task').classList.add('d-none');
    document.getElementById('btn-delete-task').classList.add('d-none');
    document.getElementById('btn-cancel-edit-task').classList.remove('d-none');
    document.getElementById('btn-save-task').classList.remove('d-none');

    document.getElementById('edit-title').value = task.title || '';
    document.getElementById('edit-description').value = task.description || '';
    document.getElementById('edit-comments').value = task.comments || '';
    document.getElementById('edit-status').value = task.status || 'PENDIENTE';
    document.getElementById('edit-priority').value = task.priority || '';
    document.getElementById('edit-important').checked = task.important || false;

    if (task.deadline) {
        var d = new Date(task.deadline);
        var iso = d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0') + 'T' +
            String(d.getHours()).padStart(2, '0') + ':' +
            String(d.getMinutes()).padStart(2, '0');
        document.getElementById('edit-deadline').value = iso;
    } else {
        document.getElementById('edit-deadline').value = '';
    }

    var catSelect = document.getElementById('edit-categories');
    catSelect.innerHTML = '';
    var taskCatIds = (task.categories || []).map(function (c) { return c.id; });
    categoriesCache.forEach(function (cat) {
        var opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.title;
        opt.selected = taskCatIds.indexOf(cat.id) !== -1;
        catSelect.appendChild(opt);
    });

    var tagSelect = document.getElementById('edit-tags');
    tagSelect.innerHTML = '';
    var taskTagIds = (task.tags || []).map(function (t) { return t.id; });
    tagsCache.forEach(function (tag) {
        var opt = document.createElement('option');
        opt.value = tag.id;
        opt.textContent = tag.name;
        opt.selected = taskTagIds.indexOf(tag.id) !== -1;
        tagSelect.appendChild(opt);
    });
}

function switchTaskToViewMode() {
    if (editingTaskData) openTaskDetail(editingTaskData);
}

function submitEditTask(e) {
    e.preventDefault();
    var alert = document.getElementById('edit-task-alert');
    alert.classList.add('d-none');

    var title = document.getElementById('edit-title').value.trim();
    if (!title) {
        alert.textContent = 'El titulo es obligatorio.';
        alert.classList.remove('d-none');
        return;
    }

    var description = document.getElementById('edit-description').value.trim();
    var comments = document.getElementById('edit-comments').value.trim();
    var status = document.getElementById('edit-status').value;
    var priority = document.getElementById('edit-priority').value;
    var deadline = document.getElementById('edit-deadline').value;
    var important = document.getElementById('edit-important').checked;

    var catSelect = document.getElementById('edit-categories');
    var categoryIds = Array.from(catSelect.selectedOptions).map(function (o) { return Number(o.value); });

    var tagSelect = document.getElementById('edit-tags');
    var tagIds = Array.from(tagSelect.selectedOptions).map(function (o) { return Number(o.value); });

    var body = {
        title: title,
        description: description || null,
        comments: comments || null,
        status: status,
        priority: priority || null,
        deadline: deadline || null,
        important: important,
        completed: status === 'COMPLETADA',
        categoryIds: categoryIds,
        tagIds: tagIds
    };

    var btn = document.getElementById('btn-save-task');
    btn.disabled = true;

    apiFetch('/tasks/' + editingTaskId, { method: 'PUT', body: body })
        .then(function (res) {
            if (!res.ok) {
                return res.text().then(function (text) {
                    throw new Error(text || 'Error al guardar la tarea');
                });
            }
            return res.json();
        })
        .then(function (updated) {
            editingTaskData = updated;
            openTaskDetail(updated);
            loadTasks();
        })
        .catch(function (err) {
            alert.textContent = err.message;
            alert.classList.remove('d-none');
        })
        .finally(function () {
            btn.disabled = false;
        });
}

function deleteTask() {
    if (!editingTaskId) return;
    if (!confirm('¿Seguro que quieres eliminar esta tarea?')) return;

    var btn = document.getElementById('btn-delete-task');
    btn.disabled = true;

    apiFetch('/tasks/' + editingTaskId, { method: 'DELETE' })
        .then(function (res) {
            if (!res.ok) {
                return res.text().then(function (text) {
                    throw new Error(text || 'Error al eliminar la tarea');
                });
            }
            bootstrap.Modal.getInstance(document.getElementById('taskDetailModal')).hide();
            loadTasks();
        })
        .catch(function (err) {
            var alert = document.getElementById('edit-task-alert');
            alert.textContent = err.message;
            alert.classList.remove('d-none');
        })
        .finally(function () {
            btn.disabled = false;
        });
}

function formatDate(isoString) {
    if (!isoString) return '';
    var d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    var day = d.getDate();
    var month = MONTHS[d.getMonth()];
    var year = d.getFullYear();
    var hours = String(d.getHours()).padStart(2, '0');
    var mins = String(d.getMinutes()).padStart(2, '0');
    return day + ' ' + month + ' ' + year + ', ' + hours + ':' + mins;
}
