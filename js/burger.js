const burgerBtn = document.querySelector('.burger');
const mobileNav = document.querySelector('.mobile-nav');

burgerBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    mobileNav.classList.toggle('hidden');
});