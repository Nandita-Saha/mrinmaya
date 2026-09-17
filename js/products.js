'use strict';

(() => {
  const store = window.MrinmayaStore;
  const grid = document.querySelector('#catalog-grid');
  const empty = document.querySelector('#catalog-empty');
  const count = document.querySelector('#results-count');
  const resultsTitle = document.querySelector('#results-title');
  const search = document.querySelector('#catalog-search');
  const products = Object.values(store.catalog);
  const categoryInputs = [...document.querySelectorAll('input[name="category"]')];
  const requestedCategory = new URLSearchParams(window.location.search).get('category');
  const initialCategory = categoryInputs.find((input) => input.value === requestedCategory);
  if (initialCategory) initialCategory.checked = true;

  function priceMatches(price, range) {
    if (range === 'under-600') return price < 600;
    if (range === '600-900') return price >= 600 && price <= 900;
    if (range === 'over-900') return price > 900;
    return true;
  }

  function render() {
    const category = document.querySelector('input[name="category"]:checked').value;
    const price = document.querySelector('input[name="price"]:checked').value;
    const query = search.value.trim().toLowerCase();
    const filtered = products.filter((product) =>
      (!category || product.category === category) &&
      priceMatches(product.price, price) &&
      `${product.name} ${product.category}`.toLowerCase().includes(query)
    );

    grid.replaceChildren();
    filtered.forEach((product) => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.dataset.id = product.id;
      card.innerHTML = `
        <img src="${product.image}" alt="${product.alt}">
        <div class="product-card__body">
          <p class="product-card__category">${product.category}</p>
          <h3>${product.name}</h3>
          <p class="product-card__price">Price: ${store.formatMoney(product.price)}</p>
          <button class="button add-to-cart" type="button" aria-label="Add ${product.name} to cart">Add to Cart</button>
        </div>`;
      grid.append(card);
    });

    count.textContent = `${filtered.length} product${filtered.length === 1 ? '' : 's'}`;
    resultsTitle.textContent = category || 'Handcrafted Collection';
    empty.hidden = filtered.length > 0;
  }

  categoryInputs.forEach((input) => input.addEventListener('change', () => {
    const url = new URL(window.location.href);
    if (input.value) url.searchParams.set('category', input.value); else url.searchParams.delete('category');
    window.history.replaceState({}, '', url);
    render();
  }));
  document.querySelectorAll('input[name="price"]').forEach((input) => input.addEventListener('change', render));
  search.addEventListener('input', render);
  document.querySelector('#clear-filters').addEventListener('click', () => {
    document.querySelector('input[name="category"][value=""]').checked = true;
    document.querySelector('input[name="price"][value=""]').checked = true;
    search.value = '';
    window.history.replaceState({}, '', 'products.html');
    render();
  });
  render();
})();
