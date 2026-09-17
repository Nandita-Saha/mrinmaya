'use strict';

window.MrinmayaStore = (() => {
  const CART_KEY = 'mrinmaya-cart-v1';
  const ORDER_KEY = 'mrinmaya-last-order-v1';
  const catalog = {
    vase: { id: 'vase', name: 'Clay Vase', category: 'Home Decor', price: 890, image: 'images/clay-vase.png', alt: 'Pierced terracotta clay vase with a leaf pattern' },
    plate: { id: 'plate', name: 'Decor Plate', category: 'Home Decor', price: 640, image: 'images/decor-plate.png', alt: 'Decorative terracotta plate with an embossed floral design' },
    bowl: { id: 'bowl', name: 'Terracotta Bowl', category: 'Utensils', price: 520, image: 'images/terracotta-bowl.png', alt: 'Handmade terracotta bowl' },
    necklace: { id: 'necklace', name: 'Clay Necklace', category: 'Clay Jewelry', price: 1180, image: 'images/clay-necklace.png', alt: 'Terracotta clay necklace' },
    pot: { id: 'pot', name: 'Earthen Pot', category: 'Earthen Pots', price: 760, image: 'images/earthen-pot.png', alt: 'Rounded handmade earthen pot with a lid' },
    earrings: { id: 'earrings', name: 'Handmade Earrings', category: 'Clay Jewelry', price: 560, image: 'images/handmade-earrings.png', alt: 'Handmade circular terracotta earrings' }
  };
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } };
  const getCart = () => read(CART_KEY, []).filter((item) => catalog[item.id] && Number.isInteger(item.quantity) && item.quantity > 0);
  const setCart = (items) => localStorage.setItem(CART_KEY, JSON.stringify(items.filter((item) => catalog[item.id] && item.quantity > 0)));
  const cartDetails = () => getCart().map((item) => ({ ...catalog[item.id], quantity: item.quantity, subtotal: catalog[item.id].price * item.quantity }));
  const cartTotal = () => cartDetails().reduce((total, item) => total + item.subtotal, 0);
  const cartCount = () => getCart().reduce((total, item) => total + item.quantity, 0);
  const changeQuantity = (id, change) => { const cart = getCart(); const item = cart.find((entry) => entry.id === id); if (item) item.quantity += change; else if (change > 0) cart.push({ id, quantity: change }); setCart(cart); };
  const formatMoney = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  return { catalog, getCart, setCart, cartDetails, cartTotal, cartCount, changeQuantity, formatMoney, setLastOrder: (order) => localStorage.setItem(ORDER_KEY, JSON.stringify(order)), getLastOrder: () => read(ORDER_KEY, null), clearCart: () => localStorage.removeItem(CART_KEY) };
})();
