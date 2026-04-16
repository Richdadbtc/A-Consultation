(function () {
  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const year = document.getElementById('year');
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');

  if (year) year.textContent = String(new Date().getFullYear());

  function setHeaderState() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  function closeMenu() {
    if (!navToggle || !navMenu) return;
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  }

  function toggleMenu() {
    if (!navToggle || !navMenu) return;
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }

  if (navToggle) {
    navToggle.addEventListener('click', toggleMenu);
  }

  if (navMenu) {
    navMenu.addEventListener('click', (e) => {
      const target = e.target;
      if (target && target.matches && target.matches('a')) closeMenu();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  if (window.AOS) {
    window.AOS.init({
      once: true,
      offset: 90,
      duration: 700,
      easing: 'ease-out-cubic',
    });
  }

  const prefersReducedMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
  const isTouchDevice =
    'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

  function initHeroGlow() {
    const glow = document.getElementById('heroGlow');
    if (!glow || prefersReducedMotion || isTouchDevice) return;

    let raf = 0;

    function update(x, y) {
      glow.style.setProperty('--glow-x', `${x}%`);
      glow.style.setProperty('--glow-y', `${y}%`);
    }

    function onMove(e) {
      const hero = glow.parentElement;
      if (!hero || !hero.getBoundingClientRect) return;
      const r = hero.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => update(x, y));
    }

    function onLeave() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => update(30, 35));
    }

    glow.parentElement.addEventListener('mousemove', onMove);
    glow.parentElement.addEventListener('mouseleave', onLeave);
  }

  function initMagneticButtons() {
    if (prefersReducedMotion || isTouchDevice) return;

    const magnets = Array.from(document.querySelectorAll('.js-magnetic'));
    for (const el of magnets) {
      let raf = 0;
      let currentX = 0;
      let currentY = 0;

      function setTransform(x, y) {
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }

      function onMove(e) {
        const rect = el.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;

        const strength = 18;
        const targetX = relX * strength;
        const targetY = relY * strength;

        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          currentX = currentX + (targetX - currentX) * 0.35;
          currentY = currentY + (targetY - currentY) * 0.35;
          setTransform(currentX, currentY);
        });
      }

      function onLeave() {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          currentX = 0;
          currentY = 0;
          setTransform(0, 0);
        });
      }

      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      el.addEventListener('blur', onLeave);
    }
  }

  initHeroGlow();
  initMagneticButtons();

  function animateCounter(el) {
    const target = Number(el.getAttribute('data-target') || 0);
    const suffix = el.getAttribute('data-suffix') || '';
    const durationMs = 1200;
    const start = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(eased * target);
      el.textContent = `${value}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const counters = Array.from(document.querySelectorAll('.counter'));
  if (counters.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          if (el.dataset.animated === 'true') continue;
          el.dataset.animated = 'true';
          animateCounter(el);
        }
      },
      { threshold: 0.4 }
    );

    for (const c of counters) counterObserver.observe(c);
  } else {
    for (const c of counters) {
      if (c.dataset.animated === 'true') continue;
      c.dataset.animated = 'true';
      animateCounter(c);
    }
  }

  function setError(name, message) {
    const node = document.querySelector(`[data-error-for="${name}"]`);
    if (node) node.textContent = message;
  }

  function clearErrors() {
    const nodes = document.querySelectorAll('.field__error');
    nodes.forEach((n) => (n.textContent = ''));
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateForm(formEl) {
    const fd = new FormData(formEl);
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const service = String(fd.get('service') || '').trim();
    const message = String(fd.get('message') || '').trim();

    let ok = true;

    if (name.length < 2) {
      ok = false;
      setError('name', 'Please enter your full name.');
    }

    if (!validateEmail(email)) {
      ok = false;
      setError('email', 'Please enter a valid email address.');
    }

    if (!service) {
      ok = false;
      setError('service', 'Please select a service.');
    }

    if (message.length < 10) {
      ok = false;
      setError('message', 'Please enter a short message (at least 10 characters).');
    }

    return { ok, name, email, service, message };
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();
      if (formNote) formNote.textContent = '';

      const result = validateForm(form);
      if (!result.ok) {
        if (formNote) formNote.textContent = 'Please correct the highlighted fields.';
        return;
      }

      if (formNote) {
        formNote.textContent = 'Thanks—your request is ready to send. (Demo form: no backend attached.)';
      }

      form.reset();
    });
  }
})();
