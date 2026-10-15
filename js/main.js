/* MHI Trading & Contracting Group — main.js */

'use strict';

/* -------------------------------------------------------
   DOM refs
------------------------------------------------------- */
const header      = document.getElementById('header');
const hamburger   = document.getElementById('hamburger');
const navLinks    = document.getElementById('navLinks');
const backToTop   = document.getElementById('backToTop');
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const yearEl      = document.getElementById('currentYear');
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-link:not(.nav-cta)');

/* -------------------------------------------------------
   Current year
------------------------------------------------------- */
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* -------------------------------------------------------
   Sticky header + scroll effects
------------------------------------------------------- */
function onScroll() {
  const scrollY = window.scrollY;

  // Header scroll class
  header.classList.toggle('scrolled', scrollY > 60);

  // Back-to-top visibility
  backToTop.classList.toggle('visible', scrollY > 400);

  // Active nav link based on section visibility
  updateActiveNav();
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load

/* -------------------------------------------------------
   Active nav link on scroll
------------------------------------------------------- */

function updateActiveNav() {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY + 100 >= sec.offsetTop) current = sec.id;
  });
  navAnchors.forEach(a => {
    const href = a.getAttribute('href').replace('#', '');
    a.classList.toggle('active', href === current);
  });
}

/* -------------------------------------------------------
   Mobile menu
------------------------------------------------------- */
hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close on link click
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Close on outside click
document.addEventListener('click', e => {
  if (navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)) {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

/* -------------------------------------------------------
   Smooth scroll for all anchor links
------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 120; // header height
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* -------------------------------------------------------
   Back to top
------------------------------------------------------- */
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* -------------------------------------------------------
   Animated counters
------------------------------------------------------- */
function animateCounter(el, target, duration) {
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll('.stat-number[data-target]').forEach(el => {
      animateCounter(el, +el.dataset.target, 1800);
    });
    counterObserver.disconnect();
  });
}, { threshold: 0.3 });

const statsBar = document.querySelector('.stats-bar');
if (statsBar) counterObserver.observe(statsBar);

/* -------------------------------------------------------
   Scroll reveal — progressive enhancement
   Content is visible by default; JS adds animations on top.
------------------------------------------------------- */

// Mark body so CSS can safely hide elements for animation
document.body.classList.add('js-ready');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0, rootMargin: '0px 0px 0px 0px' });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
  .forEach(el => revealObserver.observe(el));

// Hard fallback: reveal everything after 1.5s no matter what
setTimeout(() => {
  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
    .forEach(el => el.classList.add('revealed'));
}, 1500);

/* -------------------------------------------------------
   Project filter tabs + clickable category tags
------------------------------------------------------- */
const filterBtns   = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

function applyFilter(filter) {
  // Update active filter button
  filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === filter));

  // Show / hide cards
  projectCards.forEach(card => {
    const match = filter === 'all' || card.dataset.category === filter;
    if (match) {
      card.classList.remove('hidden');
      card.style.animation = 'fadeInUp .4s ease both';
    } else {
      card.classList.add('hidden');
      card.style.animation = '';
    }
  });
}

// Filter buttons
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
});

// Clickable category tags on each card
document.querySelectorAll('.project-type').forEach(tag => {
  tag.addEventListener('click', () => {
    const category = tag.closest('.project-card').dataset.category;
    applyFilter(category);
    // Scroll to filter bar
    document.querySelector('.project-filters').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
});

/* -------------------------------------------------------
   Product catalog tabs
------------------------------------------------------- */
const prodCatBtns = document.querySelectorAll('.prod-cat-btn');
const prodPanels  = document.querySelectorAll('.prod-panel');

prodCatBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    prodCatBtns.forEach(b => b.classList.remove('active'));
    prodPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`.prod-panel[data-tab="${btn.dataset.tab}"]`).classList.add('active');
  });
});

/* -------------------------------------------------------
   Contact form — Web3Forms submission
------------------------------------------------------- */
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    const name    = contactForm.querySelector('#name');
    const email   = contactForm.querySelector('#email');
    const message = contactForm.querySelector('#message');

    // Validate required fields
    let valid = true;
    [name, email, message].forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#e53e3e';
        field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
        valid = false;
      }
    });
    if (!valid) return;

    const submitBtn = contactForm.querySelector('.btn-submit');
    const originalLabel = submitBtn.innerHTML;
    submitBtn.disabled  = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        submitBtn.style.display = 'none';
        formSuccess.style.display = 'flex';
        contactForm.reset();
      } else {
        throw new Error('Server error');
      }
    } catch {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalLabel;
      alert('Sorry, something went wrong. Please email us directly at mostafa@mhisystem.com');
    }
  });
}

/* -------------------------------------------------------
   Catalogue download — language + email, saved to the ERP
------------------------------------------------------- */
(function () {
  const modal = document.getElementById('catalogModal');
  if (!modal) return;

  const CATALOG_API = 'https://erp.mhisystem.com/api/catalog-leads/request';
  const openers  = document.querySelectorAll('[data-catalog-open]');
  const form     = document.getElementById('catalogForm');
  const stepForm = document.getElementById('catalogStepForm');
  const stepDone = document.getElementById('catalogStepDownload');
  const emailEl  = document.getElementById('catalogEmail');
  const errorEl  = document.getElementById('catalogError');
  const retryEl  = document.getElementById('catalogRetry');
  const submit   = form.querySelector('.catalog-submit');
  let lastFocus  = null;

  const open = () => {
    lastFocus = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => { if (!stepForm.hidden) emailEl.focus(); }, 50);
  };
  const close = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };

  openers.forEach(b => b.addEventListener('click', e => { e.preventDefault(); open(); }));
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  modal.querySelector('.catalog-close').addEventListener('click', close);
  modal.querySelector('.catalog-finish').addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });

  const startDownload = href => {
    const a = document.createElement('a');
    a.href = href;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  async function saveRequest(payload) {
    try {
      const res = await fetch(CATALOG_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return true;
      if (res.status === 400) return false;
    } catch { /* fall through to the email backup */ }

    // ERP unreachable — still get the lead by email so nothing is lost.
    try {
      const fd = new FormData(form);
      fd.set('message', 'Catalogue (' + payload.language + ') requested by ' + payload.email);
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST', body: fd, headers: { 'Accept': 'application/json' }
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorEl.style.display = 'none';

    if (form.elements.website.value.trim() !== '') return;

    const email = emailEl.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      errorEl.style.display = 'block';
      emailEl.focus();
      return;
    }

    const chosen = form.querySelector('input[name="language"]:checked');
    const label = submit.innerHTML;
    submit.disabled = true;
    submit.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    const ok = await saveRequest({
      email,
      language: chosen.value,
      source_page: location.pathname,
      site_language: form.dataset.siteLang,
      website: ''
    });

    if (!ok) {
      submit.disabled = false;
      submit.innerHTML = label;
      alert(form.dataset.errorMsg);
      return;
    }

    const file = new URL(chosen.dataset.file, location.href).href;
    retryEl.href = file;
    stepForm.hidden = true;
    stepDone.hidden = false;
    startDownload(file);
  });
})();
