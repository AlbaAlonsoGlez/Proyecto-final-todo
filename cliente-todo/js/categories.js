var categoriesPageCache = [];
var editingCategoryId = null;

var CATEGORY_PALETTE = [
    '#883955',
    '#14342B',
    '#2B6CB0',
    '#B7791F',
    '#9B2C2C',
    '#6B46C1',
    '#2C7A7B',
    '#C05621'
];

var DEFAULT_CATEGORY_COLOR = '#883955';

function canManageCategories() {
    var user = getStoredUser();
    return user && (user.role === 'ADMIN' || user.role === 'GESTOR');
}

function initCategories() {
    document.getElementById('btn-create-category').addEventListener('click', openCreateCategory);
    document.getElementById('form-category').addEventListener('submit', submitCategory);
    document.getElementById('btn-edit-category').addEventListener('click', switchToEditMode);
    document.getElementById('btn-cancel-edit-category').addEventListener('click', switchToViewMode);
    document.getElementById('btn-delete-category').addEventListener('click', deleteCategory);
    buildColorPalette();
}

function buildColorPalette() {
    var container = document.getElementById('category-color-palette');
    container.innerHTML = '';
    CATEGORY_PALETTE.forEach(function (hex) {
        var swatch = document.createElement('button');
        swatch.type = 'button';
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = hex;
        swatch.dataset.color = hex;
        swatch.title = hex;
        swatch.addEventListener('click', function () {
            selectColor(hex);
        });
        container.appendChild(swatch);
    });
}

function selectColor(hex) {
    document.getElementById('category-color-input').value = hex;
    var swatches = document.querySelectorAll('#category-color-palette .color-swatch');
    swatches.forEach(function (s) {
        s.classList.toggle('selected', s.dataset.color === hex);
    });
}

function getCategoryColor(cat) {
    return cat.color || DEFAULT_CATEGORY_COLOR;
}

function hexToRgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return r + ', ' + g + ', ' + b;
}

function applyCategoryBadgeStyle(el, color) {
    var rgb = hexToRgb(color);
    var isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    el.style.backgroundColor = 'rgba(' + rgb + ', ' + (isDark ? '0.25' : '0.15') + ')';
    el.style.color = isDark ? lightenColor(color, 0.4) : color;
}

function lightenColor(hex, amount) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    r = Math.min(255, Math.round(r + (255 - r) * amount));
    g = Math.min(255, Math.round(g + (255 - g) * amount));
    b = Math.min(255, Math.round(b + (255 - b) * amount));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function loadCategories() {
    var grid = document.getElementById('categories-grid');
    var loading = document.getElementById('categories-loading');
    var errorEl = document.getElementById('categories-error');
    var emptyEl = document.getElementById('categories-empty');
    var countEl = document.getElementById('categories-count');

    grid.innerHTML = '';
    errorEl.classList.add('d-none');
    emptyEl.classList.add('d-none');
    countEl.textContent = '';
    loading.classList.remove('d-none');

    apiFetch('/categories')
        .then(function (res) {
            if (!res.ok) throw new Error('Error al cargar las categorías');
            return res.json();
        })
        .then(function (data) {
            categoriesPageCache = data;
            renderCategories();
        })
        .catch(function (err) {
            errorEl.textContent = err.message;
            errorEl.classList.remove('d-none');
        })
        .finally(function () {
            loading.classList.add('d-none');
        });
}

function renderCategories() {
    var grid = document.getElementById('categories-grid');
    var emptyEl = document.getElementById('categories-empty');
    var countEl = document.getElementById('categories-count');

    grid.innerHTML = '';

    if (categoriesPageCache.length === 0) {
        emptyEl.classList.remove('d-none');
        countEl.textContent = '';
    } else {
        emptyEl.classList.add('d-none');
        countEl.textContent = categoriesPageCache.length + ' categoría' + (categoriesPageCache.length !== 1 ? 's' : '');
        categoriesPageCache.forEach(function (cat) {
            grid.appendChild(buildCategoryCard(cat));
        });
    }
}

function buildCategoryCard(cat) {
    var col = document.createElement('div');
    col.className = 'col';

    var color = getCategoryColor(cat);

    var card = document.createElement('div');
    card.className = 'card h-100 task-card';
    card.style.borderColor = color;
    card.addEventListener('click', function () { openViewCategory(cat); });

    var body = document.createElement('div');
    body.className = 'card-body';

    var header = document.createElement('div');
    header.className = 'd-flex align-items-center justify-content-between mb-2';

    var title = document.createElement('h6');
    title.className = 'card-title mb-0';
    title.textContent = cat.title;
    header.appendChild(title);

    var dot = document.createElement('span');
    dot.style.width = '12px';
    dot.style.height = '12px';
    dot.style.borderRadius = '50%';
    dot.style.backgroundColor = color;
    dot.style.display = 'inline-block';
    dot.style.flexShrink = '0';
    header.appendChild(dot);

    body.appendChild(header);

    if (cat.description) {
        var desc = document.createElement('p');
        desc.className = 'card-text text-muted small mb-0';
        desc.textContent = cat.description;
        body.appendChild(desc);
    }

    card.appendChild(body);
    col.appendChild(card);
    return col;
}

function openCreateCategory() {
    editingCategoryId = null;
    document.getElementById('categoryModalLabel').textContent = 'Nueva categoría';
    document.getElementById('category-alert').classList.add('d-none');
    document.getElementById('category-title-input').value = '';
    document.getElementById('category-description-input').value = '';
    selectColor(DEFAULT_CATEGORY_COLOR);

    document.getElementById('category-view').classList.add('d-none');
    document.getElementById('category-form-fields').classList.remove('d-none');

    document.getElementById('btn-edit-category').classList.add('d-none');
    document.getElementById('btn-delete-category').classList.add('d-none');
    document.getElementById('btn-cancel-edit-category').classList.add('d-none');
    document.getElementById('btn-save-category').classList.remove('d-none');
    document.getElementById('btn-save-category').textContent = 'Crear';

    bootstrap.Modal.getOrCreateInstance(document.getElementById('categoryModal')).show();
}

function openViewCategory(cat) {
    editingCategoryId = cat.id;
    document.getElementById('categoryModalLabel').textContent = 'Categoría';
    document.getElementById('category-alert').classList.add('d-none');

    var color = getCategoryColor(cat);
    var badge = document.getElementById('category-view-badge');
    badge.textContent = cat.title;
    applyCategoryBadgeStyle(badge, color);

    var descEl = document.getElementById('category-view-description');
    if (cat.description) {
        descEl.textContent = cat.description;
        descEl.classList.remove('d-none');
    } else {
        descEl.textContent = '';
        descEl.classList.add('d-none');
    }

    document.getElementById('category-title-input').value = cat.title;
    document.getElementById('category-description-input').value = cat.description || '';
    selectColor(color);

    document.getElementById('category-view').classList.remove('d-none');
    document.getElementById('category-form-fields').classList.add('d-none');

    var manage = canManageCategories();
    document.getElementById('btn-edit-category').classList.toggle('d-none', !manage);
    document.getElementById('btn-delete-category').classList.toggle('d-none', !manage);
    document.getElementById('btn-cancel-edit-category').classList.add('d-none');
    document.getElementById('btn-save-category').classList.add('d-none');

    bootstrap.Modal.getOrCreateInstance(document.getElementById('categoryModal')).show();
}

function switchToEditMode() {
    document.getElementById('categoryModalLabel').textContent = 'Editar categoría';
    document.getElementById('category-view').classList.add('d-none');
    document.getElementById('category-form-fields').classList.remove('d-none');

    document.getElementById('btn-edit-category').classList.add('d-none');
    document.getElementById('btn-cancel-edit-category').classList.remove('d-none');
    document.getElementById('btn-save-category').classList.remove('d-none');
    document.getElementById('btn-save-category').textContent = 'Guardar';
}

function switchToViewMode() {
    var cat = categoriesPageCache.find(function (c) { return c.id === editingCategoryId; });
    if (cat) openViewCategory(cat);
}

function submitCategory(e) {
    e.preventDefault();
    var alert = document.getElementById('category-alert');
    alert.classList.add('d-none');

    var title = document.getElementById('category-title-input').value.trim();
    if (!title) {
        alert.textContent = 'El nombre es obligatorio.';
        alert.classList.remove('d-none');
        return;
    }

    var color = document.getElementById('category-color-input').value || DEFAULT_CATEGORY_COLOR;
    var description = document.getElementById('category-description-input').value.trim() || null;

    var btn = document.getElementById('btn-save-category');
    btn.disabled = true;

    var isEdit = editingCategoryId !== null;
    var url = isEdit ? '/categories/' + editingCategoryId : '/categories';
    var method = isEdit ? 'PUT' : 'POST';

    apiFetch(url, { method: method, body: { title: title, color: color, description: description } })
        .then(function (res) {
            if (!res.ok) {
                return res.text().then(function (text) {
                    throw new Error(text || 'Error al guardar la categoría');
                });
            }
            return res.json();
        })
        .then(function () {
            bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
            loadCategories();
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

function deleteCategory() {
    if (!editingCategoryId) return;
    if (!confirm('¿Estás seguro que quieres eliminar esta categoría?')) return;

    var btn = document.getElementById('btn-delete-category');
    btn.disabled = true;

    apiFetch('/categories/' + editingCategoryId, { method: 'DELETE' })
        .then(function (res) {
            if (!res.ok) {
                return res.text().then(function (text) {
                    throw new Error(text || 'Error al eliminar la categoría');
                });
            }
            bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
            loadCategories();
            refreshTaskFilterOptions();
        })
        .catch(function (err) {
            var alert = document.getElementById('category-alert');
            alert.textContent = err.message;
            alert.classList.remove('d-none');
        })
        .finally(function () {
            btn.disabled = false;
        });
}

function refreshTaskFilterOptions() {
    filtersLoaded = false;
    var catSelect = document.getElementById('filter-category');
    catSelect.innerHTML = '<option value="">Todas</option>';
    var tagSelect = document.getElementById('filter-tag');
    tagSelect.innerHTML = '<option value="">Todas</option>';
}
