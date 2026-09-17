'use strict';

document.querySelectorAll('[data-inner-header]').forEach((header) => {
  const active = header.dataset.active || '';
  const navItems = [
    ['home', 'index.html', 'Home'],
    ['about', 'about-us.html', 'About Us'],
    ['products', 'products.html', 'Products'],
    ['process', 'how-it-works.html', 'How It Works']
  ];
  const links = navItems.map(([key, href, label]) => `<a${active === key ? ' class="active" aria-current="page"' : ''} href="${href}">${label}</a>`).join('');

  header.className = 'catalog-header';
  header.innerHTML = `
    <div class="catalog-header__inner">
      <a class="catalog-logo" href="index.html" aria-label="Mrinmaya home"><img src="images/logo.png" alt="Mrinmaya — clay creations for a brighter home" width="1536" height="1024"></a>
      <nav aria-label="Main navigation">${links}</nav>
      <button class="catalog-cart" type="button" data-cart-toggle aria-label="Open cart, 0 items">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3h3l3 13h11l3-10H6M9 20h.01M18 20h.01"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>
        <span data-cart-count>0</span>
      </button>
    </div>`;
});
