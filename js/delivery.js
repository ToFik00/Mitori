const pad = n => n.toString().padStart(2, '0');
const fmt = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const addMin = (d, m) => new Date(d.getTime() + m * 60000);

const OPEN_HOUR   = 10;
const MAX_SLOTS   = 6;
const SERVICE_FEE = 29;
const FREE_LIMIT  = 2000;
const DELIVERY_FEE = 199;

const form        = document.getElementById('delivery-form');
const slotGrid    = document.getElementById('slot-grid');
const customBlock = document.getElementById('custom-block');
const dateSelect  = document.getElementById('delivery-date');
const hourSelect  = document.getElementById('delivery-hour');
const minuteSelect= document.getElementById('delivery-minute');
const timeError   = document.getElementById('time-error');
const paymentInput= document.getElementById('payment-input');
const summaryList = document.getElementById('summary-list');
const serviceEl   = document.getElementById('service-fee');
const deliveryEl  = document.getElementById('delivery-fee');
const totalEl     = document.getElementById('order-total');
const msgEl       = document.getElementById('free-delivery-msg');
const btnConfirm  = document.querySelector('.confirm-button');

let cart = JSON.parse(localStorage.getItem('cart') || '[]').filter(i => i.count > 0);
let chosenSlot = 'express';

const fields = [
  { el: form.elements['name'],      errEl: document.getElementById('name-error'),      req: true },
  { el: form.elements['phone'],     errEl: document.getElementById('phone-error'),     req: true, pattern: /^[0-9+\-\s()]{5,}$/ },
  { el: form.elements['city'],      errEl: document.getElementById('city-error'),      req: true },
  { el: form.elements['street'],    errEl: document.getElementById('street-error'),    req: true },
  { el: form.elements['apartment'], errEl: document.getElementById('apartment-error'), req: true },
];

function buildSlots() {
  slotGrid.innerHTML = '';
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(OPEN_HOUR, 0, 0, 0);
  const base = now < startOfDay ? startOfDay : now;
  let count = 0;

  if (now >= startOfDay) {
    slotGrid.insertAdjacentHTML('beforeend', `
      <button type="button" class="slot-btn active" data-type="express">
        Сегодня<br><span>20–30 мин</span>
      </button>`);
    count++;
  }

  let slotTime = addMin(base, (15 - (base.getMinutes() % 15)) % 15 + 75);
  while (count < MAX_SLOTS) {
    const end = addMin(slotTime, 15);
    slotGrid.insertAdjacentHTML('beforeend', `
      <button type="button" class="slot-btn" data-type="fixed"
              data-start="${fmt(slotTime)}" data-end="${fmt(end)}">
        Сегодня<br><span>${fmt(slotTime)} – ${fmt(end)}</span>
      </button>`);
    slotTime = end;
    count++;
  }

  slotGrid.insertAdjacentHTML('beforeend', `
    <button type="button" class="slot-btn other">Другое время</button>`);
  populateCustom();
}

function populateCustom() {
  dateSelect.innerHTML = '';
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dateSelect.add(new Option(
      `${pad(d.getDate())}.${pad(d.getMonth()+1)}`,
      d.toISOString().split('T')[0]
    ));
  }
  hourSelect.innerHTML = '';
  for (let h = OPEN_HOUR; h < 24; h++) {
    hourSelect.add(new Option(pad(h), pad(h)));
  }
  minuteSelect.innerHTML = '';
  for (let m = 0; m < 60; m++) {
    minuteSelect.add(new Option(pad(m), pad(m)));
  }
}

function validateField({el, errEl, req, pattern}) {
  const v = el.value.trim();
  let ok = true;
  if (req && !v) {
    errEl.textContent = 'Это поле обязательно';
    el.classList.add('invalid');
    ok = false;
  } else if (pattern && v && !pattern.test(v)) {
    errEl.textContent = 'Неверный формат';
    el.classList.add('invalid');
    ok = false;
  } else {
    errEl.textContent = '';
    el.classList.remove('invalid');
  }
  return ok;
}

function validateTime() {
  if (chosenSlot !== 'custom') {
    timeError.textContent = '';
    return true;
  }
  const dt = new Date(`${dateSelect.value}T${hourSelect.value}:${minuteSelect.value}`);
  const earliest = new Date();
  earliest.setMinutes(earliest.getMinutes() + 20);
  if (dt < earliest) {
    timeError.textContent = 'Выбрано недопустимое время доставки';
    return false;
  }
  if (dt.getHours() < OPEN_HOUR) {
    timeError.textContent = 'Время доставки не раньше 10:00';
    return false;
  }
  timeError.textContent = '';
  return true;
}

function updateFormState() {
  const fieldsOk = fields.every(validateField);
  const timeOk   = validateTime();
  btnConfirm.disabled = !(fieldsOk && timeOk && cart.length > 0);
}

function setupValidation() {
  fields.forEach(f => {
    f.el.addEventListener('input', updateFormState);
    f.el.addEventListener('blur',  () => validateField(f));
  });
  [dateSelect, hourSelect, minuteSelect].forEach(el =>
    el.addEventListener('change', updateFormState)
  );
  updateFormState();
}

function fillSummary() {
  if (!cart.length) {
    summaryList.innerHTML = '<li>Корзина пуста</li>';
    msgEl.textContent = 'Добавьте товары, чтобы оформить заказ';
    btnConfirm.disabled = true;
    return;
  }
  fetch('./json/products.json')
    .then(r => r.json())
    .then(products => {
      let subtotal = 0;
      summaryList.innerHTML = '';
      cart.forEach(item => {
        const p = products.find(pr => pr.title === item.title);
        if (!p) return;
        const sum = p.price * item.count;
        subtotal += sum;
        summaryList.insertAdjacentHTML('beforeend', `
          <li>
            <div>${p.title}<span class="weight">${parseInt(p.weight)||0} г</span></div>
            <span>${sum} ₽</span>
          </li>`);
      });
      const dFee = subtotal >= FREE_LIMIT ? 0 : DELIVERY_FEE;
      serviceEl.textContent  = `${SERVICE_FEE} ₽`;
      deliveryEl.textContent = `${dFee} ₽`;
      totalEl.textContent    = `${subtotal + SERVICE_FEE + dFee} ₽`;
      msgEl.textContent = subtotal >= FREE_LIMIT
        ? 'Доставка бесплатная!'
        : `Осталось ${FREE_LIMIT - subtotal} ₽ до бесплатной доставки`;
      updateFormState();
    })
    .catch(() => {
      summaryList.innerHTML = '<li>Ошибка загрузки данных</li>';
      btnConfirm.disabled = true;
    });
}

document.addEventListener('click', e => {
  const slotBtn = e.target.closest('.slot-btn');
  const payBtn  = e.target.closest('.pay-btn');

  if (slotBtn) {
    document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('active'));
    slotBtn.classList.add('active');
    if (slotBtn.classList.contains('other')) {
      chosenSlot = 'custom';
      customBlock.classList.remove('hidden');
    } else {
      chosenSlot = slotBtn.dataset.type;
      customBlock.classList.add('hidden');
    }
    updateFormState();
  }

  if (payBtn) {
    document.querySelectorAll('.pay-btn').forEach(b => b.classList.remove('active'));
    payBtn.classList.add('active');
    paymentInput.value = payBtn.dataset.value;
  }
});

form.addEventListener('submit', e => {
  e.preventDefault();
  alert('Спасибо! Ваш заказ принят и скоро будет доставлен.');
  localStorage.removeItem('cart');
  window.location.href = 'index.html';
});

document.addEventListener('DOMContentLoaded', () => {
  buildSlots();
  setupValidation();
  fillSummary();
  
  const burger    = document.querySelector('.burger');
  const mobileNav = document.querySelector('.mobile-nav');
  const closeBtn  = document.querySelector('.close-btn');

  burger.addEventListener('click', () => {
    mobileNav.classList.add('active');
  });

  closeBtn.addEventListener('click', () => {
    mobileNav.classList.remove('active');
  });

  mobileNav.addEventListener('click', e => {
    if (e.target === mobileNav) {
      mobileNav.classList.remove('active');
    }
  });
});
