export function updateCount(title, count){
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    const existingItem = cart.find(item => item.title === title);
    if (existingItem) {
        existingItem.count += count;
    } else {
        cart.push({ title, count: 1});
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));

    return existingItem.count;
}