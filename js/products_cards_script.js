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
              <p class="card-desc">${product.description}</p>
              <div class="card-buttons">
                <button class="btn add-to-cart">В корзину</button>
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
        window.location.href = `product.html?slug=${encodeURIComponent(slug)}`;
    }
});
