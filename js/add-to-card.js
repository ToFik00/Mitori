export function addToCart(title){
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    const existingItem = cart.find(item => item.title === title);
    if (existingItem) {
        existingItem.count += 1;
    } else {
        cart.push({ title, count: 1});
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    
    alert(`Товар "${title}" добавлен. Теперь в корзине: ${existingItem ? existingItem.count : 1} шт.`);
}