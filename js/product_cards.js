import { updateCount } from "./update-card.js";

document.addEventListener('DOMContentLoaded', () => {
    fetch('../json/products.json')
        .then(res => res.json())
        .then(products => {
            products.forEach(product => {
                const container = document.querySelector(
                    `.cards[data-category="${product.category}"]`
                );

                if (container) {
                    const card = document.createElement('div');
                    card.classList.add('card');

                    card.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <div class="card-body">
              <h3 class="card-title">${product.title}</h3>
              <div class="card-price">${product.price}₽</div>
              <p class="card-desc">${product.description}</p>
              <div class="card-buttons">
                <button class="btn add-to-cart" data-title="${product.title}">В корзину</button>
                <button class="btn details" data-slug="${product.slug}">Подробнее</button>
              </div>
            </div>
          `;

                    container.appendChild(card);
                }
            });
        })
        .catch(err => console.error('Ошибка загрузки JSON:', err));
});

document.addEventListener('click', e => {
    const btn = e.target.closest('button.details');
    if (!btn) return;
    const slug = btn.dataset.slug;
    if (slug) {
        window.location.href = `single_product.html?slug=${encodeURIComponent(slug)}`;
    }
});

document.addEventListener('click', e => {
    const cartBtn = e.target.closest('button.add-to-cart');
    if (cartBtn) {
        const title = cartBtn.dataset.title;
        updateCount(title, 1);
    }
});
