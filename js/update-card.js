export function updateCount(title, count){
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    const existingItem = cart.find(item => item.title === title);
    if (existingItem) {
        existingItem.count += count;
    } else {
        cart.push({ title, count: 1});
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));

    updateBadge();

    return existingItem.count;
}


function updateBadge() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = cart.reduce((sum, i) => sum + i.count, 0);

    const cartLink = document.querySelector(".cart-link");
    if (!cartLink) return;

    let badge = cartLink.querySelector(".badge");
    if (!badge) {
        badge = document.createElement("span");
        badge.classList.add("badge");
        cartLink.appendChild(badge);
    }
    badge.textContent = total;
}

document.addEventListener("DOMContentLoaded", updateBadge);