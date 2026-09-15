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
const dialog = select('#content-dialog');
const dialogBody = select('#dialog-body');
const cart = new Map(window.MrinmayaStore.getCart().map((item) => [item.id, item.quantity]));
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

function showDialog(title, content) {
  select('#dialog-title').textContent = title;
  dialogBody.replaceChildren();
  if (typeof content === 'string') {
    const paragraph = document.createElement('p');
    paragraph.textContent = content;
    dialogBody.append(paragraph);
  } else {
    dialogBody.append(content);
  }
  if (!dialog.open) dialog.showModal();
}

select('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});

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
selectAll('a[data-category]').forEach((link) => link.addEventListener('click', () => {
  select('#product-search').value = '';
  filterProducts(link.dataset.category);
}));
select('#view-all').addEventListener('click', () => {
  select('#product-search').value = '';
  filterProducts();
});
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

function updateCartCount() {
  const count = [...cart.values()].reduce((sum, quantity) => sum + quantity, 0);
  select('#cart-count').textContent = count;
  select('#cart-toggle').setAttribute('aria-label', `Open cart, ${count} item${count === 1 ? '' : 's'}`);
}
function persistCart() {
  window.MrinmayaStore.setCart([...cart].map(([id, quantity]) => ({ id, quantity })));
}
selectAll('.add-to-cart').forEach((button) => button.addEventListener('click', () => {
  const card = button.closest('.product-card');
  cart.set(card.dataset.id, (cart.get(card.dataset.id) || 0) + 1);
  persistCart();
  updateCartCount();
  notify(`${card.dataset.name} added to your cart`);
}));
function renderCart() {
  const content = document.createElement('div');
  if (!cart.size) {
    content.textContent = 'Your cart is empty. Explore our handcrafted collection to find your favorite pieces.';
  }
  cart.forEach((quantity, id) => {
    const card = cards.find((item) => item.dataset.id === id);
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.dataset.id = id;
    const photo = card.querySelector('img').cloneNode();
    const info = document.createElement('div');
    info.className = 'cart-item-info';
    const title = document.createElement('h3');
    title.textContent = card.dataset.name;
    const controls = document.createElement('div');
    controls.className = 'cart-quantity';
    [-1, 1].forEach((change, index) => {
      const button = document.createElement('button');
      button.textContent = change === -1 ? '−' : '+';
      button.dataset.change = change;
      button.setAttribute('aria-label', `${change === -1 ? 'Decrease' : 'Increase'} ${card.dataset.name} quantity`);
      controls.append(button);
      if (!index) {
        const label = document.createElement('span');
        label.textContent = quantity;
        controls.append(label);
      }
    });
    info.append(title, controls);
    row.append(photo, info);
    content.append(row);
  });
  const note = document.createElement('p');
  note.className = 'cart-note';
  note.textContent = 'Review your items and continue to secure checkout when you are ready.';
  content.append(note);
  const cartLink = document.createElement('a');
  cartLink.className = 'button cart-page-link';
  cartLink.href = 'add-to-cart.html';
  cartLink.textContent = 'Open Cart Page';
  content.append(cartLink);
  showDialog('Your Cart', content);
}
select('#cart-toggle').addEventListener('click', renderCart);
dialogBody.addEventListener('click', (event) => {
  const button = event.target.closest('[data-change]');
  if (!button) return;
  const id = button.closest('.cart-item').dataset.id;
  const next = cart.get(id) + Number(button.dataset.change);
  if (next > 0) cart.set(id, next); else cart.delete(id);
  persistCart();
  updateCartCount();
  renderCart();
  const replacement = dialogBody.querySelector(`[data-id="${id}"] [data-change="${button.dataset.change}"]`);
  (replacement || select('.dialog-close')).focus();
});

const processes = [
  { title: 'Shaping Clay', video: 'process-shaping.mp4', poster: 'process-shaping.png', text: 'An artisan centers the clay on the wheel, then uses steady hands to open, lift and shape it into a vessel.' },
  { title: 'Firing Earthen Pots', video: 'process-firing.mp4', poster: 'process-firing.png', text: 'After drying, the clay pieces are fired in a kiln. Heat transforms the shaped clay into durable terracotta.' },
  { title: 'Painting Details', video: 'process-painting.mp4', poster: 'process-painting.png', text: 'Fine patterns and careful brushwork bring character to each piece, reflecting the hand of its maker.' },
  { title: 'Crafting Clay Jewelry', video: 'process-jewelry.mp4', poster: 'process-jewelry.png', text: 'Small clay elements are shaped, fired and decorated, then assembled by hand into necklaces and earrings.' }
];
selectAll('[data-process]').forEach((button) => button.addEventListener('click', () => {
  const process = processes[Number(button.dataset.process)];
  const content = document.createElement('div');
  const photo = document.createElement('video');
  photo.src = `images/${process.video}`;
  photo.poster = `images/${process.poster}`;
  photo.autoplay = true;
  photo.muted = true;
  photo.loop = true;
  photo.playsInline = true;
  photo.setAttribute('aria-label', process.title);
  const description = document.createElement('p');
  description.textContent = process.text;
  const note = document.createElement('p');
  note.className = 'cart-note';
  note.textContent = 'The process video is not available in this preview.';
  content.append(photo, description, note);
  showDialog(process.title, content);
}));
select('#learn-more').addEventListener('click', () => showDialog('Tradition in Every Creation', 'Mrinmaya brings together clay home decor, utensils, earthen pots and jewelry, celebrating the artisans behind them. Each creation carries the texture of natural clay and the care of hands that shape it. Our purpose is to bring this traditional craftsmanship into everyday homes.'));
select('#account-button').addEventListener('click', () => showDialog('Your Account', 'Accounts are not available in this storefront preview. You can explore the collection and add your favorite pieces to a cart during this page visit.'));
selectAll('[data-social]').forEach((button) => button.addEventListener('click', () => notify(`${button.dataset.social} profile has not been connected yet.`)));
const contactForm = select('#contact-form');
if (contactForm) contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  select('#form-status').textContent = 'Your message has not been sent. This preview does not have a message delivery service connected.';
});
