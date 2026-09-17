'use strict';

const store = window.MrinmayaStore;
const page = document.body.dataset.page;
const byId = (id) => document.getElementById(id);
const currency = store.formatMoney;

function renderSummary(target) {
  const items = store.cartDetails();
  const total = store.cartTotal();
  target.replaceChildren();
  const title = document.createElement('h2'); title.textContent = 'Order Summary'; target.append(title);
  items.forEach((item) => { const row = document.createElement('div'); row.className = 'summary-line'; row.innerHTML = `<span>${item.name} × ${item.quantity}</span><span>${currency(item.subtotal)}</span>`; target.append(row); });
  const shipping = document.createElement('div'); shipping.className = 'summary-line'; shipping.innerHTML = '<span>Shipping</span><span>Free</span>'; target.append(shipping);
  const totalRow = document.createElement('div'); totalRow.className = 'summary-line summary-total'; totalRow.innerHTML = `<span>Total</span><span>${currency(total)}</span>`; target.append(totalRow);
  if (page === 'cart') {
    const checkout = document.createElement('a'); checkout.className = 'button full-button'; checkout.href = 'checkout.html'; checkout.textContent = 'Continue to Checkout →'; target.append(checkout);
  }
}

function renderCart() {
  const items = store.cartDetails();
  const panel = byId('cart-items'); const summary = byId('cart-summary');
  panel.replaceChildren();
  if (!items.length) {
    panel.innerHTML = '<div class="empty-cart"><h2>Your cart is waiting for a story.</h2><p>Choose a handcrafted piece to begin.</p><a class="button" href="products.html">Explore products</a></div>';
    summary.hidden = true; return;
  }
  items.forEach((item) => {
    const row = document.createElement('article'); row.className = 'cart-row';
    row.innerHTML = `<img src="${item.image}" alt="${item.alt}"><div><p class="item-category">${item.category}</p><h3>${item.name}</h3><p class="price">${currency(item.price)}</p><div class="qty"><button type="button" data-cart-change="-1" data-id="${item.id}" aria-label="Decrease ${item.name} quantity">−</button><span>${item.quantity}</span><button type="button" data-cart-change="1" data-id="${item.id}" aria-label="Increase ${item.name} quantity">+</button><button class="remove-link" type="button" data-cart-remove="${item.id}">Remove</button></div></div><strong>${currency(item.subtotal)}</strong>`;
    panel.append(row);
  });
  renderSummary(summary); summary.hidden = false;
}

function bindCartControls() {
  byId('cart-items').addEventListener('click', (event) => {
    const change = event.target.closest('[data-cart-change]'); const remove = event.target.closest('[data-cart-remove]');
    if (change) store.changeQuantity(change.dataset.id, Number(change.dataset.cartChange));
    if (remove) { const remaining = store.getCart().filter((item) => item.id !== remove.dataset.cartRemove); store.setCart(remaining); }
    if (change || remove) renderCart();
  });
}

function renderCheckout() {
  const items = store.cartDetails();
  if (!items.length) { window.location.replace('add-to-cart.html'); return; }
  renderSummary(byId('checkout-summary'));
  byId('checkout-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const order = { reference: `MR-${Date.now().toString(36).toUpperCase()}`, createdAt: new Date().toISOString(), customer: Object.fromEntries(form), items, total: store.cartTotal() };
    store.setLastOrder(order); store.clearCart(); window.location.assign('thank-you.html');
  });
}

function renderThankYou() {
  const order = store.getLastOrder();
  if (!order) { byId('confirmation-copy').textContent = 'Your order confirmation will appear here after checkout.'; return; }
  byId('customer-name').textContent = order.customer.name.split(' ')[0];
  byId('order-reference').textContent = order.reference;
  byId('order-total').textContent = currency(order.total);
  byId('confirmation-copy').textContent = `We’ll send confirmation details to ${order.customer.email} and contact you about delivery.`;
}

if (page === 'cart') { renderCart(); bindCartControls(); }
if (page === 'checkout') renderCheckout();
if (page === 'thank-you') renderThankYou();
