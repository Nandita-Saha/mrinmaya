'use strict';

/* Reveal sections progressively as they enter the viewport. */
const motionSections = [...document.querySelectorAll('main > section, .site-footer')];
const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.body.classList.add('motion-ready');
if (motionReduced || !('IntersectionObserver' in window)) {
  motionSections.forEach((section) => section.classList.add('is-visible'));
} else {
  motionSections.forEach((section, index) => { section.style.transitionDelay = `${Math.min(index * 70, 420)}ms`; });
  const motionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
  motionSections.forEach((section) => motionObserver.observe(section));
  window.addEventListener('load', () => { if (motionSections[0]) motionSections[0].classList.add('is-visible'); }, { once: true });
}

const select = (selector) => document.querySelector(selector);
const selectAll = (selector) => [...document.querySelectorAll(selector)];
const cards = selectAll('.product-card');
let toastTimer;

cards.forEach((card) => {
  const product = window.MrinmayaStore.catalog[card.dataset.id];
  if (product) card.querySelector('.product-info p').textContent = `Price: ${window.MrinmayaStore.formatMoney(product.price)}`;
});

function notify(message) {
  select('#toast').textContent = message;
  select('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => select('#toast').classList.remove('visible'), 3000);
}

const menuButton = select('.menu-toggle');
function closeMenu() {
  select('#main-nav').classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}
menuButton.addEventListener('click', () => {
  const open = select('#main-nav').classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
selectAll('.main-nav a').forEach((link) => link.addEventListener('click', () => {
  closeMenu();
  selectAll('.main-nav a').forEach((item) => item.classList.toggle('active', item === link));
}));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (menuButton.getAttribute('aria-expanded') === 'true') { closeMenu(); menuButton.focus(); }
    if (!select('#search-panel').hidden) {
      select('#search-panel').hidden = true;
      select('#search-toggle').setAttribute('aria-expanded', 'false');
      select('#search-toggle').focus();
    }
  }
});

function filterProducts(category = '', query = '') {
  let count = 0;
  cards.forEach((card) => {
    const matches = (!category || card.dataset.category === category) && `${card.dataset.name} ${card.dataset.category}`.toLowerCase().includes(query.toLowerCase());
    card.hidden = !matches;
    if (matches) count++;
  });
  select('#empty-products').hidden = count > 0;
  select('#product-caption').textContent = category || (query ? `${count} result${count === 1 ? '' : 's'}` : 'Handcrafted with care');
  select('#products-title').textContent = category || 'Products';
}
select('#search-toggle').addEventListener('click', () => {
  const panel = select('#search-panel');
  panel.hidden = !panel.hidden;
  select('#search-toggle').setAttribute('aria-expanded', String(!panel.hidden));
  closeMenu();
  if (!panel.hidden) select('#product-search').focus();
});
select('#search-panel').addEventListener('submit', (event) => {
  event.preventDefault();
  filterProducts('', select('#product-search').value.trim());
  select('#products').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
});
select('#product-search').addEventListener('input', (event) => filterProducts('', event.target.value.trim()));

selectAll('[data-social]').forEach((button) => button.addEventListener('click', () => notify(`${button.dataset.social} profile has not been connected yet.`)));
const contactForm = select('#contact-form');
if (contactForm) contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  select('#form-status').textContent = 'Your message has not been sent. This preview does not have a message delivery service connected.';
});

// The reference's theme switch and save buttons work with keyboard and touch.
const themeButton = select('#theme-toggle');
themeButton?.addEventListener('click', () => {
  const dark = document.body.classList.toggle('dark-theme');
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
});
let savedPieces = [];
try {
  const saved = JSON.parse(localStorage.getItem('mrinmaya-wishlist-v1') || '[]');
  if (Array.isArray(saved)) savedPieces = saved.filter((id) => window.MrinmayaStore.catalog[id]);
} catch { /* Saving remains available for this visit when storage is unavailable. */ }
selectAll('.wishlist-button').forEach((button) => {
  const card = button.closest('.product-card');
  const setSaved = (saved) => {
    button.setAttribute('aria-pressed', String(saved));
    button.setAttribute('aria-label', `${saved ? 'Remove' : 'Save'} ${card.dataset.name} ${saved ? 'from' : 'to'} wishlist`);
  };
  setSaved(savedPieces.includes(card.dataset.id));
  button.addEventListener('click', () => {
    const saved = !savedPieces.includes(card.dataset.id);
    savedPieces = saved ? [...savedPieces, card.dataset.id] : savedPieces.filter((id) => id !== card.dataset.id);
    setSaved(saved);
    try { localStorage.setItem('mrinmaya-wishlist-v1', JSON.stringify(savedPieces)); } catch { /* Session-only fallback. */ }
    notify(`${card.dataset.name} ${saved ? 'saved to' : 'removed from'} your wishlist`);
  });
});
