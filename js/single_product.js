import { updateCount } from "./update-card.js";

/**
 * @typedef {Object} Product
 * @property {string} slug
 * @property {string} title
 * @property {number} price
 * @property {string} description
 * @property {string[]} composition
 * @property {string} image
 * @property {string} weight
 * @property {number} kcal
 * @property {string[]} steps
 */


const slug = new URLSearchParams(location.search).get('slug');
const heroSection = document.querySelector('.hero');
const priceSection = document.getElementById('product-price');
const heroTitle   = document.getElementById('hero-title');
const descEl      = document.getElementById('product-desc');
const compList    = document.getElementById('product-comp');
const thumbImg    = document.getElementById('product-thumb');
const weightEl    = document.getElementById('product-weight');
const kcalEl      = document.getElementById('product-kcal');
const stepsList   = document.getElementById('product-steps');


if (!slug) {
    showNotFound();
    throw new Error('No slug param');
}

fetch('../json/products.json')
    .then(res => res.json())
    .then(products => {
        const product = products.find(p => p.slug === slug);
        if (!product) throw new Error('Product not found');
        fillPage(product);
    })
    .catch(err => {
        console.error(err);
        showNotFound();
    });



function fillPage(p) {
    heroSection.style.background = `url('${p.image}') center / cover no-repeat`;
    heroTitle.textContent = p.title;
    priceSection.textContent = `${p.price} ₽`;
    descEl.textContent = p.description;

    compList.innerHTML = '';
    p.composition.forEach(item =>
        compList.insertAdjacentHTML('beforeend', `<li>${item}</li>`)
    );

    thumbImg.src = p.image;
    thumbImg.alt = p.title;

    weightEl.textContent = p.weight;
    kcalEl.textContent   = `${p.kcal} ккал`;

    stepsList.innerHTML = '';
    p.steps.forEach(step =>
        stepsList.insertAdjacentHTML('beforeend', `<li>${step}</li>`)
    );
}


function showNotFound() {
    document.body.innerHTML =
        '<h2 style="text-align:center; padding: 2rem;">Блюдо не найдено</h2>';
}

document.getElementById('addBtn').addEventListener('click', function() {
    const title = document.getElementById("hero-title").textContent;
    updateCount(title, 1); 
});