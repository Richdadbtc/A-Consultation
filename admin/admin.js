(function () {
  const STORAGE_POSTS = 'aegirum_posts_v1';
  const STORAGE_AUTH = 'aegirum_admin_auth_v1';

  const DEMO_USERNAME = 'admin';
  const DEMO_PASSWORD = 'aegirum@2026';

  function safeJsonParse(str, fallback) {
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  }

  function normalizeCategory(cat) {
    const c = String(cat || '').trim();
    if (!c) return 'General';
    return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
  }

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 70);
  }

  function setError(name, message) {
    const node = document.querySelector(`[data-error-for="${name}"]`);
    if (node) node.textContent = message;
  }

  function clearErrors() {
    const nodes = document.querySelectorAll('.field__error');
    nodes.forEach((n) => (n.textContent = ''));
  }

  function loadPosts() {
    const raw = localStorage.getItem(STORAGE_POSTS);
    const posts = safeJsonParse(raw || '[]', []);
    return Array.isArray(posts) ? posts : [];
  }

  function savePosts(posts) {
    localStorage.setItem(STORAGE_POSTS, JSON.stringify(posts));
  }

  function isAuthed() {
    return localStorage.getItem(STORAGE_AUTH) === 'true';
  }

  function requireAuth() {
    if (isAuthed()) return;
    window.location.replace('index.html');
  }

  function logout() {
    localStorage.removeItem(STORAGE_AUTH);
    window.location.replace('index.html');
  }

  function initLogoutButton() {
    const btn = document.getElementById('adminLogout');
    if (!btn) return;
    btn.addEventListener('click', logout);
  }

  function formatDate(iso) {
    const d = new Date(String(iso || ''));
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function renderTable(posts) {
    const root = document.getElementById('adminTable');
    if (!root) return;

    if (posts.length === 0) {
      root.innerHTML = '<div class="admin-empty">No posts yet. Click “New Post” to create one.</div>';
      return;
    }

    const rows = posts
      .slice()
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
      .map((p) => {
        const id = encodeURIComponent(p.id);
        const title = String(p.title || '');
        const cat = normalizeCategory(p.category);
        const date = formatDate(p.date);
        return `
          <div class="admin-row">
            <div class="admin-cell admin-cell--title">${title}</div>
            <div class="admin-cell">${cat}</div>
            <div class="admin-cell">${date}</div>
            <div class="admin-cell admin-cell--actions">
              <a class="admin-btn" href="editor.html?id=${id}">Edit</a>
              <button class="admin-btn admin-btn--danger" type="button" data-delete="${id}">Delete</button>
            </div>
          </div>
        `;
      })
      .join('');

    root.innerHTML = `
      <div class="admin-head">
        <div class="admin-cell admin-cell--title">Title</div>
        <div class="admin-cell">Category</div>
        <div class="admin-cell">Date</div>
        <div class="admin-cell admin-cell--actions">Actions</div>
      </div>
      ${rows}
    `;

    root.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = decodeURIComponent(btn.getAttribute('data-delete') || '');
        const next = loadPosts().filter((x) => String(x.id) !== String(id));
        savePosts(next);
        renderTable(next);
      });
    });
  }

  function initLogin() {
    const form = document.getElementById('adminLoginForm');
    if (!form) return;

    const note = document.getElementById('adminLoginNote');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();
      if (note) note.textContent = '';

      const fd = new FormData(form);
      const username = String(fd.get('username') || '').trim();
      const password = String(fd.get('password') || '').trim();

      let ok = true;
      if (username.length < 1) {
        ok = false;
        setError('username', 'Enter a username.');
      }
      if (password.length < 1) {
        ok = false;
        setError('password', 'Enter a password.');
      }
      if (!ok) return;

      if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
        localStorage.setItem(STORAGE_AUTH, 'true');
        window.location.replace('dashboard.html');
        return;
      }

      if (note) note.textContent = 'Invalid credentials.';
    });
  }

  function initDashboard() {
    const table = document.getElementById('adminTable');
    if (!table) return;
    requireAuth();
    initLogoutButton();
    renderTable(loadPosts());
  }

  function initEditor() {
    const editorHost = document.getElementById('quillEditor');
    if (!editorHost) return;

    requireAuth();
    initLogoutButton();

    const titleEl = document.getElementById('postTitle');
    const categoryEl = document.getElementById('postCategory');
    const dateEl = document.getElementById('postDate');
    const imageEl = document.getElementById('postImage');
    const publishBtn = document.getElementById('publishBtn');
    const note = document.getElementById('editorNote');
    const heading = document.getElementById('editorTitle');

    const quill = new window.Quill('#quillEditor', {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'blockquote'],
          ['clean'],
        ],
      },
    });

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
      const existing = loadPosts().find((p) => String(p.id) === String(id));
      if (existing) {
        if (heading) heading.textContent = 'Edit Post';
        if (titleEl) titleEl.value = existing.title || '';
        if (categoryEl) categoryEl.value = normalizeCategory(existing.category);
        if (dateEl) dateEl.value = existing.date || '';
        if (imageEl) imageEl.value = existing.featuredImage || '';
        quill.root.innerHTML = existing.body || '';
      }
    } else {
      const today = new Date();
      const iso = today.toISOString().slice(0, 10);
      if (dateEl) dateEl.value = iso;
    }

    function validate() {
      clearErrors();

      let ok = true;
      if (!titleEl || String(titleEl.value || '').trim().length < 3) {
        ok = false;
        setError('postTitle', 'Title must be at least 3 characters.');
      }
      if (!categoryEl || !String(categoryEl.value || '').trim()) {
        ok = false;
        setError('postCategory', 'Select a category.');
      }
      if (!dateEl || !String(dateEl.value || '').trim()) {
        ok = false;
        setError('postDate', 'Select a date.');
      }
      if (!imageEl || !String(imageEl.value || '').trim()) {
        ok = false;
        setError('postImage', 'Provide a featured image URL.');
      }

      const bodyHtml = quill.root.innerHTML;
      const bodyText = quill.getText().trim();
      if (bodyText.length < 10) {
        ok = false;
        if (note) note.textContent = 'Body must be at least 10 characters.';
      } else if (note) {
        note.textContent = '';
      }

      return { ok, bodyHtml };
    }

    function upsertPost() {
      const v = validate();
      if (!v.ok) return;

      const title = String(titleEl.value || '').trim();
      const category = normalizeCategory(categoryEl.value);
      const date = String(dateEl.value || '').trim();
      const featuredImage = String(imageEl.value || '').trim();
      const body = v.bodyHtml;

      const posts = loadPosts();
      const newId = id ? String(id) : slugify(title) || `post-${Date.now()}`;

      const nextPost = { id: newId, title, category, date, featuredImage, body };
      const idx = posts.findIndex((p) => String(p.id) === String(newId));
      if (idx >= 0) posts[idx] = nextPost;
      else posts.push(nextPost);

      savePosts(posts);
      window.location.replace('dashboard.html');
    }

    if (publishBtn) publishBtn.addEventListener('click', upsertPost);
  }

  initLogin();
  initDashboard();
  initEditor();
})();
