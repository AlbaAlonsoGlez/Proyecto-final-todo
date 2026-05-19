var tagsPageCache = [];
var editingTagId = null;

var TAG_PALETTE = [
    '#883955',
    '#14342B',
    '#2B6CB0',
    '#B7791F',
    '#9B2C2C',
    '#6B46C1',
    '#2C7A7B',
    '#C05621'
];

var DEFAULT_TAG_COLOR = '#2B6CB0';

function canManageTags() {
    return !!getStoredUser();
}

function initTags() {
    document.getElementById('btn-create-tag').addEventListener('click', openCreateTag);
    document.getElementById('form-tag').addEventListener('submit', submitTag);
    document.getElementById('btn-edit-tag').addEventListener('click', switchToEditTagMode);
    document.getElementById('btn-cancel-edit-tag').addEventListener('click', switchToViewTagMode);
    document.getElementById('btn-delete-tag').addEventListener('click', deleteTag);
    buildTagColorPalette();
}

function buildTagColorPalette() {
    var container = document.getElementById('tag-color-palette');
    container.innerHTML = '';
    TAG_PALETTE.forEach(function (hex) {
        var swatch = document.createElement('button');
        swatch.type = 'button';
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = hex;
        swatch.dataset.color = hex;
        swatch.title = hex;
        swatch.addEventListener('click', function () {
            selectTagColor(hex);
        });
        container.appendChild(swatch);
    });
}

function selectTagColor(hex) {
    document.getElementById('tag-color-input').value = hex;
    var swatches = document.querySelectorAll('#tag-color-palette .color-swatch');
    swatches.forEach(function (s) {
        s.classList.toggle('selected', s.dataset.color === hex);
    });
}

function getTagColor(tag) {
    return tag.color || DEFAULT_TAG_COLOR;
}

function applyTagBadgeStyle(el, color) {
    var rgb = hexToRgb(color);
    var isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    el.style.backgroundColor = 'rgba(' + rgb + ', ' + (isDark ? '0.25' : '0.15') + ')';
    el.style.color = isDark ? lightenColor(color, 0.4) : color;
}

function loadTags() {
    var grid = document.getElementById('tags-grid');
    var loading = document.getElementById('tags-loading');
    var errorEl = document.getElementById('tags-error');
    var emptyEl = document.getElementById('tags-empty');
    var countEl = document.getElementById('tags-count');

    grid.innerHTML = '';
    errorEl.classList.add('d-none');
    emptyEl.classList.add('d-none');
    countEl.textContent = '';
    loading.classList.remove('d-none');

    apiFetch('/tags')
        .then(function (res) {
            if (!res.ok) throw new Error('Error al cargar las etiquetas');
            return res.json();
        })
        .then(function (data) {
            tagsPageCache = data;
            renderTags();
        })
        .catch(function (err) {
            errorEl.textContent = err.message;
            errorEl.classList.remove('d-none');
        })
        .finally(function () {
            loading.classList.add('d-none');
        });
}

function renderTags() {
    var grid = document.getElementById('tags-grid');
    var emptyEl = document.getElementById('tags-empty');
    var countEl = document.getElementById('tags-count');

    grid.innerHTML = '';

    if (tagsPageCache.length === 0) {
        emptyEl.classList.remove('d-none');
        countEl.textContent = '';
    } else {
        emptyEl.classList.add('d-none');
        countEl.textContent = tagsPageCache.length + ' etiqueta' + (tagsPageCache.length !== 1 ? 's' : '');
        tagsPageCache.forEach(function (tag) {
            grid.appendChild(buildTagCard(tag));
        });
    }
}

function buildTagCard(tag) {
    var col = document.createElement('div');
    col.className = 'col';

    var color = getTagColor(tag);

    var card = document.createElement('div');
    card.className = 'card h-100 task-card';
    card.style.borderColor = color;
    card.addEventListener('click', function () { openViewTag(tag); });

    var body = document.createElement('div');
    body.className = 'card-body';

    var header = document.createElement('div');
    header.className = 'd-flex align-items-center justify-content-between mb-2';

    var name = document.createElement('h6');
    name.className = 'card-title mb-0';
    name.textContent = tag.name;
    header.appendChild(name);

    var dot = document.createElement('span');
    dot.style.width = '12px';
    dot.style.height = '12px';
    dot.style.borderRadius = '50%';
    dot.style.backgroundColor = color;
    dot.style.display = 'inline-block';
    dot.style.flexShrink = '0';
    header.appendChild(dot);

    body.appendChild(header);

    if (tag.description) {
        var desc = document.createElement('p');
        desc.className = 'card-text text-muted small mb-0';
        desc.textContent = tag.description;
        body.appendChild(desc);
    }

    card.appendChild(body);
    col.appendChild(card);
    return col;
}

function openCreateTag() {
    editingTagId = null;
    document.getElementById('tagModalLabel').textContent = 'Nueva etiqueta';
    document.getElementById('tag-alert').classList.add('d-none');
    document.getElementById('tag-name-input').value = '';
    document.getElementById('tag-description-input').value = '';
    selectTagColor(DEFAULT_TAG_COLOR);

    document.getElementById('tag-view').classList.add('d-none');
    document.getElementById('tag-form-fields').classList.remove('d-none');

    document.getElementById('btn-edit-tag').classList.add('d-none');
    document.getElementById('btn-delete-tag').classList.add('d-none');
    document.getElementById('btn-cancel-edit-tag').classList.add('d-none');
    document.getElementById('btn-save-tag').classList.remove('d-none');
    document.getElementById('btn-save-tag').textContent = 'Crear';

    bootstrap.Modal.getOrCreateInstance(document.getElementById('tagModal')).show();
}

function openViewTag(tag) {
    editingTagId = tag.id;
    document.getElementById('tagModalLabel').textContent = 'Etiqueta';
    document.getElementById('tag-alert').classList.add('d-none');

    var color = getTagColor(tag);
    var badge = document.getElementById('tag-view-badge');
    badge.textContent = tag.name;
    applyTagBadgeStyle(badge, color);

    var descEl = document.getElementById('tag-view-description');
    if (tag.description) {
        descEl.textContent = tag.description;
        descEl.classList.remove('d-none');
    } else {
        descEl.textContent = '';
        descEl.classList.add('d-none');
    }

    document.getElementById('tag-name-input').value = tag.name;
    document.getElementById('tag-description-input').value = tag.description || '';
    selectTagColor(color);

    document.getElementById('tag-view').classList.remove('d-none');
    document.getElementById('tag-form-fields').classList.add('d-none');

    var manage = canManageTags();
    document.getElementById('btn-edit-tag').classList.toggle('d-none', !manage);
    document.getElementById('btn-delete-tag').classList.toggle('d-none', !manage);
    document.getElementById('btn-cancel-edit-tag').classList.add('d-none');
    document.getElementById('btn-save-tag').classList.add('d-none');

    bootstrap.Modal.getOrCreateInstance(document.getElementById('tagModal')).show();
}

function switchToEditTagMode() {
    document.getElementById('tagModalLabel').textContent = 'Editar etiqueta';
    document.getElementById('tag-view').classList.add('d-none');
    document.getElementById('tag-form-fields').classList.remove('d-none');

    document.getElementById('btn-edit-tag').classList.add('d-none');
    document.getElementById('btn-cancel-edit-tag').classList.remove('d-none');
    document.getElementById('btn-save-tag').classList.remove('d-none');
    document.getElementById('btn-save-tag').textContent = 'Guardar';
}

function switchToViewTagMode() {
    var tag = tagsPageCache.find(function (t) { return t.id === editingTagId; });
    if (tag) openViewTag(tag);
}

function submitTag(e) {
    e.preventDefault();
    var alert = document.getElementById('tag-alert');
    alert.classList.add('d-none');

    var name = document.getElementById('tag-name-input').value.trim();
    if (!name) {
        alert.textContent = 'El nombre es obligatorio.';
        alert.classList.remove('d-none');
        return;
    }

    var color = document.getElementById('tag-color-input').value || DEFAULT_TAG_COLOR;
    var description = document.getElementById('tag-description-input').value.trim() || null;

    var btn = document.getElementById('btn-save-tag');
    btn.disabled = true;

    var isEdit = editingTagId !== null;
    var url = isEdit ? '/tags/' + editingTagId : '/tags';
    var method = isEdit ? 'PUT' : 'POST';

    apiFetch(url, { method: method, body: { name: name, color: color, description: description } })
        .then(function (res) {
            if (!res.ok) {
                return res.text().then(function (text) {
                    throw new Error(text || 'Error al guardar la etiqueta');
                });
            }
            return res.json();
        })
        .then(function () {
            bootstrap.Modal.getInstance(document.getElementById('tagModal')).hide();
            loadTags();
            refreshTaskFilterOptions();
        })
        .catch(function (err) {
            alert.textContent = err.message;
            alert.classList.remove('d-none');
        })
        .finally(function () {
            btn.disabled = false;
        });
}

function deleteTag() {
    if (!editingTagId) return;
    if (!confirm('¿Seguro que quieres eliminar esta etiqueta?')) return;

    var btn = document.getElementById('btn-delete-tag');
    btn.disabled = true;

    apiFetch('/tags/' + editingTagId, { method: 'DELETE' })
        .then(function (res) {
            if (!res.ok) {
                return res.text().then(function (text) {
                    throw new Error(text || 'Error al eliminar la etiqueta');
                });
            }
            bootstrap.Modal.getInstance(document.getElementById('tagModal')).hide();
            loadTags();
            refreshTaskFilterOptions();
        })
        .catch(function (err) {
            var alert = document.getElementById('tag-alert');
            alert.textContent = err.message;
            alert.classList.remove('d-none');
        })
        .finally(function () {
            btn.disabled = false;
        });
}
