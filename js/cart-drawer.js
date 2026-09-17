'use strict';

(() => {
  const store = window.MrinmayaStore;
  if (!store) return;

  const backdrop = document.createElement('button');
  backdrop.className = 'cart-drawer-backdrop';
  backdrop.type = 'button';
  backdrop.setAttribute('aria-label', 'Close cart');

  const drawer = document.createElement('aside');
  drawer.className = 'cart-drawer';
  drawer.id = 'cart-drawer';
  drawer.setAttribute('aria-label', 'Shopping cart');
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML = `
    <div class="cart-drawer__header">
      <h2>Your Cart</h2>
      <button class="cart-drawer__close" type="button" aria-label="Close cart">&times;</button>
    </div>
    <div class="cart-drawer__items" id="cart-drawer-items"></div>
    <div class="cart-drawer__footer">
      <p class="cart-drawer__total"><span>Total</span><span id="cart-drawer-total"></span></p>
      <div class="cart-drawer__actions">
        <a class="button button-outline" href="add-to-cart.html">View Cart</a>
        <a class="button" href="checkout.html">Checkout</a>
      </div>
    </div>`;

  document.body.append(backdrop, drawer);

  const items = drawer.querySelector('#cart-drawer-items');
  const total = drawer.querySelector('#cart-drawer-total');
  const closeButton = drawer.querySelector('.cart-drawer__close');
  let lastFocus = null;

  function updateBadges() {
    const count = store.cartCount();
    document.querySelectorAll('#cart-count, [data-cart-count]').forEach((badge) => { badge.textContent = count; });
    document.querySelectorAll('#cart-toggle, [data-cart-toggle]').forEach((button) => {
      button.setAttribute('aria-label', `Open cart, ${count} item${count === 1 ? '' : 's'}`);
    });
  }

  function render() {
    const cart = store.cartDetails();
    items.replaceChildren();

    if (!cart.length) {
      const empty = document.createElement('p');
      empty.className = 'cart-drawer__empty';
      empty.textContent = 'Your cart is empty. Explore the collection to find a handcrafted piece.';
      items.append(empty);
    } else {
      cart.forEach((item) => {
        const row = document.createElement('article');
        row.className = 'cart-drawer__item';
        row.dataset.id = item.id;
        row.innerHTML = `
          <img src="${item.image}" alt="${item.alt}">
          <div>
            <h3>${item.name}</h3>
            <p class="cart-drawer__price">${store.formatMoney(item.price)}</p>
            <div class="cart-drawer__quantity">
              <button type="button" data-drawer-change="-1" aria-label="Decrease ${item.name} quantity">&minus;</button>
              <span>${item.quantity}</span>
              <button type="button" data-drawer-change="1" aria-label="Increase ${item.name} quantity">+</button>
              <button class="cart-drawer__remove" type="button" data-drawer-remove aria-label="Remove ${item.name}">Remove</button>
            </div>
          </div>
          <strong class="cart-drawer__subtotal">${store.formatMoney(item.subtotal)}</strong>`;
        items.append(row);
      });
    }

    total.textContent = store.formatMoney(store.cartTotal());
    updateBadges();
  }

  function open() {
    lastFocus = document.activeElement;
    render();
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-drawer-open');
    closeButton.focus();
  }

  function close() {
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cart-drawer-open');
    if (lastFocus instanceof HTMLElement) lastFocus.focus();
  }

  document.addEventListener('click', (event) => {
    const addButton = event.target.closest('.add-to-cart');
    if (addButton) {
      const card = addButton.closest('.product-card[data-id]');
      if (!card || !store.catalog[card.dataset.id]) return;
      store.changeQuantity(card.dataset.id, 1);
      open();
      return;
    }

    if (event.target.closest('#cart-toggle, [data-cart-toggle]')) open();
  });

  drawer.addEventListener('click', (event) => {
    const row = event.target.closest('.cart-drawer__item');
    if (!row) return;
    const change = event.target.closest('[data-drawer-change]');
    if (change) store.changeQuantity(row.dataset.id, Number(change.dataset.drawerChange));
    if (event.target.closest('[data-drawer-remove]')) {
      const next = store.getCart().filter((item) => item.id !== row.dataset.id);
      store.setCart(next);
    }
    render();
  });

  closeButton.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && drawer.classList.contains('is-open')) close(); });
  window.addEventListener('storage', render);
  updateBadges();

  window.MrinmayaCartDrawer = { open, close, render };
})();
