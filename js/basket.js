import { updateCount } from "./update-card.js";

function generateProductCard(product, count) {
    return `
        <div class="product-card">
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <div class="product-details">
                    <h3 class="product-title">${product.title}</h3>
                    <span class="product-price">${product.price} ₽</span>
                    <span class="product-weight">${product.weight}</span>
                </div>
                <div class="quantity-controls">
                    <button type="button" class="quantity-btn minus">
                        <img src="images/system/minus.png">
                    </button>
                    <span class="quantity">${count}</span>
                    <button type="button" class="quantity-btn plus">
                        <img src="images/system/plus.png">
                    </button>
                </div>
            </div>
        </div>
        <hr class="card-divider">
    `;
}

function updatePrice(price) {
    const priceElem = document.getElementById("price");
    let curr = parseFloat(priceElem.textContent);
    priceElem.textContent = curr + price;
    return;
}

document.addEventListener('DOMContentLoaded', () => {
    const cardList = document.getElementById("list");
    document.getElementById("price").textContent = "0";


    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        document.getElementById("empty").textContent = "Корзина пуста";
        updatePrice(0)
        return;
    }

    fetch('../json/products.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных');
            }
            return response.json();
        })
        .then(products => {
            cart.forEach((cartItem, index) => {
                const product = products.find(p => p.title === cartItem.title);
                if (product && cartItem.count > 0) {
                    cardList.innerHTML += generateProductCard(product, cartItem.count);
                    updatePrice(product.price * cartItem.count);
                } else {
                    console.warn(`Товар "${cartItem.title}" не найден`);
                }
            });
        })
        .catch(error => {
            console.error('Ошибка:', error.message);
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = 'Не удалось загрузить информацию о товаре';
            document.body.appendChild(errorElement);
        });
});

document.getElementById("clear").addEventListener("click", () => {
    if (confirm("Вы уверены, что хотите очистить корзину?")) {
        localStorage.removeItem('cart');
        const cartContainer = document.getElementById('list');
        if (cartContainer) {
            cartContainer.innerHTML = '<span class="empty">Корзина пуста</span>';
        }
    }
    document.getElementById("price").textContent = "0";
    return;
})

document.getElementById('list').addEventListener('click', function (e) {
    const btn = e.target.closest('.quantity-btn');
    if (!btn) return;

    const card = btn.closest('.product-card');
    const title = card.querySelector('.product-title').textContent;
    const price = parseFloat(card.querySelector('.product-price').textContent);
    const isPlus = btn.classList.contains('plus');

    const newCount = updateCount(title, isPlus ? 1 : -1);

    if (newCount === 0) {
        const nextElement = card.nextElementSibling;
        card.remove();
        if (nextElement && nextElement.classList.contains('card-divider')) {
            nextElement.remove();
        }
        localStorage.removeItem(title);
        if (!document.querySelector('.product-card')) {
            document.getElementById('list').innerHTML = '<p class="empty">Корзина пуста</p>';
        }
    } else {
        card.querySelector('.quantity').textContent = newCount;
    }

    if (isPlus) {
        updatePrice(price);
    } else {
        updatePrice(-price);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const burger = document.querySelector('.burger');
    const mobileNav = document.querySelector('.mobile-nav');
    const closeBtn = document.querySelector('.close-btn');
    
    burger.addEventListener('click', function() {
        mobileNav.classList.add('active');
    });
    
    closeBtn.addEventListener('click', function() {
        mobileNav.classList.remove('active');
    });
});

mobileNav.addEventListener('click', function(e) {
    if (e.target === mobileNav) {
        mobileNav.classList.remove('active');
    }
});