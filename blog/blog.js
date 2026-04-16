(function () {
  const STORAGE_KEY = 'aegirum_posts_v1';

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

  async function loadSeedPosts() {
    const res = await fetch('../data/posts.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load posts');
    const posts = await res.json();
    return Array.isArray(posts) ? posts : [];
  }

  function loadLocalPosts() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const posts = safeJsonParse(raw || '[]', []);
    return Array.isArray(posts) ? posts : [];
  }

  function saveLocalPosts(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }

  function mergePosts(seed, local) {
    const map = new Map();
    for (const p of seed) map.set(p.id, p);
    for (const p of local) map.set(p.id, p);

    const merged = Array.from(map.values()).map((p) => ({
      ...p,
      category: normalizeCategory(p.category),
    }));

    merged.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    return merged;
  }

  function escapeHtml(text) {
    const s = String(text || '');
    return s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function formatDate(iso) {
    const d = new Date(String(iso || ''));
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function renderList(posts, category) {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;

    const filtered =
      category && category !== 'All'
        ? posts.filter((p) => normalizeCategory(p.category) === normalizeCategory(category))
        : posts;

    if (filtered.length === 0) {
      grid.innerHTML = '<div class="card"><p class="card__text">No articles found for this category.</p></div>';
      return;
    }

    grid.innerHTML = filtered
      .map((p) => {
        const title = escapeHtml(p.title);
        const cat = escapeHtml(normalizeCategory(p.category));
        const date = escapeHtml(formatDate(p.date));
        const img = escapeHtml(p.featuredImage || '');
        const href = `post.html?id=${encodeURIComponent(p.id)}`;

        return `
          <article class="blog-card">
            <a class="blog-card__media" href="${href}" aria-label="Read: ${title}">
              <img src="${img}" alt="" loading="lazy" />
            </a>
            <div class="blog-card__body">
              <div class="blog-card__meta">
                <span class="blog-card__tag">${cat}</span>
                <span class="blog-card__date">${date}</span>
              </div>
              <h2 class="blog-card__title"><a href="${href}">${title}</a></h2>
              <a class="card__link" href="${href}">Read article</a>
            </div>
          </article>
        `;
      })
      .join('');
  }

  function renderPost(posts) {
    const postEl = document.getElementById('post');
    if (!postEl) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const post = posts.find((p) => String(p.id) === String(id));

    if (!post) {
      postEl.innerHTML = '<div class="card"><p class="card__text">Article not found.</p></div>';
      return;
    }

    document.title = `${post.title} | Aegirum Consulting`;

    const title = escapeHtml(post.title);
    const cat = escapeHtml(normalizeCategory(post.category));
    const date = escapeHtml(formatDate(post.date));
    const img = escapeHtml(post.featuredImage || '');

    postEl.innerHTML = `
      <article class="post__inner">
        <div class="post__meta">
          <span class="blog-card__tag">${cat}</span>
          <span class="blog-card__date">${date}</span>
        </div>
        <h1 class="post__title">${title}</h1>
        ${img ? `<div class="post__media"><img src="${img}" alt="" /></div>` : ''}
        <div class="post__body">${post.body || ''}</div>
      </article>
    `;
  }

  function initFilters(posts) {
    const pills = Array.from(document.querySelectorAll('.filter-pill'));
    if (pills.length === 0) return;

    let active = 'All';
    renderList(posts, active);

    for (const p of pills) {
      p.addEventListener('click', () => {
        active = p.getAttribute('data-category') || 'All';
        pills.forEach((x) => x.classList.toggle('is-active', x === p));
        renderList(posts, active);
      });
    }
  }

  (async function init() {
    try {
      const seed = await loadSeedPosts();
      const local = loadLocalPosts();
      const posts = mergePosts(seed, local);

      if (document.getElementById('blogGrid')) {
        initFilters(posts);
      }

      if (document.getElementById('post')) {
        renderPost(posts);
      }

      if (seed.length > 0 && local.length === 0) {
        saveLocalPosts(seed);
      }
    } catch {
      const grid = document.getElementById('blogGrid');
      if (grid) {
        grid.innerHTML = '<div class="card"><p class="card__text">Unable to load articles.</p></div>';
      }

      const postEl = document.getElementById('post');
      if (postEl) {
        postEl.innerHTML = '<div class="card"><p class="card__text">Unable to load article.</p></div>';
      }
    }
  })();
})();
