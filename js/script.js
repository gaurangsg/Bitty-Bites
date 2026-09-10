let menu = document.querySelector('#menu-bars');
let navbar = document.querySelector('.navbar');

menu.onclick = () =>{
  menu.classList.toggle('fa-times');
  navbar.classList.toggle('active');
}

let section = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header .navbar a');

window.onscroll = () =>{

  menu.classList.remove('fa-times');
  navbar.classList.remove('active');

  section.forEach(sec =>{

    let top = window.scrollY;
    let height = sec.offsetHeight;
    let offset = sec.offsetTop - 150;
    let id = sec.getAttribute('id');

    if(top >= offset && top < offset + height){
      navLinks.forEach(links =>{
        links.classList.remove('active');
        document.querySelector('header .navbar a[href*='+id+']').classList.add('active');
      });
    };

  });

}

document.querySelector('#search-icon').onclick = () =>{
  document.querySelector('#search-form').classList.toggle('active');
}

document.querySelector('#close').onclick = () =>{
  document.querySelector('#search-form').classList.remove('active');
}

var swiper = new Swiper(".home-slider", {
  spaceBetween: 30,
  centeredSlides: true,
  autoplay: {
    delay: 3500,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  loop:true,
});

var swiper = new Swiper(".review-slider", {
  spaceBetween: 20,
  centeredSlides: true,
  autoplay: {
    delay: 3500,
    disableOnInteraction: false,
  },
  loop:true,
  breakpoints: {
    0: {
        slidesPerView: 1,
    },
    640: {
      slidesPerView: 2,
    },
    768: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    },
  },
});

function loader(){
  document.querySelector('.loader-container').classList.add('fade-out');
}

function fadeOut(){
  setInterval(loader, 3000);
}

window.onload = fadeOut;

async function addCartItem(name, price) {
  const response = await fetch('/api/cart', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

async function addToCart(button) {
  const box = button.closest('.box');
  const name = box.querySelector('h3').textContent.trim();
  const priceElement = box.querySelector('.price') || box.querySelector('span');
  const price = priceElement ? priceElement.textContent.replace(/[^\d.]/g, '') : 0;
  await addCartItem(name, price);
  alert(`${name} added to cart`);
}

document.querySelectorAll('.box .btn').forEach(button => {
  if (button.textContent.trim().toLowerCase() === 'add to cart') {
    button.addEventListener('click', async event => {
      event.preventDefault();
      try {
        await addToCart(button);
      } catch (error) {
        alert(error.message || 'Unable to add item to cart');
      }
    });
  }
});

document.querySelectorAll('.home .slide .btn').forEach(button => {
  button.addEventListener('click', async event => {
    event.preventDefault();
    const slide = button.closest('.slide');
    const name = slide.querySelector('h3').textContent.trim();

    try {
      await addCartItem(name, 250);
      const response = await fetch('/api/cart', { credentials: 'same-origin' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      showCartPopup(result.items);
    } catch (error) {
      alert(error.message || 'Unable to add item to cart');
    }
  });
});

document.querySelector('.fa-shopping-cart').addEventListener('click', async event => {
  event.preventDefault();
  const response = await fetch('/api/cart', { credentials: 'same-origin' });
  const result = await response.json();
  if (!response.ok) return alert(result.error);
  showCartPopup(result.items);
});

function showCartPopup(items) {
  const existingPopup = document.querySelector('.cart-popup');
  if (existingPopup) existingPopup.remove();

  const popup = document.createElement('div');
  popup.className = 'cart-popup';
  popup.innerHTML = `
    <div class="cart-popup-content" role="dialog" aria-modal="true" aria-labelledby="cart-popup-title">
      <button class="cart-popup-close" type="button" aria-label="Close cart">&times;</button>
      <h2 id="cart-popup-title">Your Cart</h2>
      <div class="cart-popup-items"></div>
      <div class="cart-popup-total"></div>
      <button class="cart-popup-order btn" type="button">Proceed to Order</button>
    </div>
  `;
  document.body.appendChild(popup);

  const itemsContainer = popup.querySelector('.cart-popup-items');
  const totalContainer = popup.querySelector('.cart-popup-total');

  if (!items.length) {
    itemsContainer.textContent = 'Your cart is empty';
  } else {
    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cart-popup-item';
      row.innerHTML = `
        <span class="cart-popup-item-name"></span>
        <div class="cart-popup-controls">
          <button type="button" data-cart-action="decrease" aria-label="Decrease quantity">-</button>
          <span class="cart-popup-quantity"></span>
          <button type="button" data-cart-action="increase" aria-label="Increase quantity">+</button>
        </div>
      `;
      row.querySelector('.cart-popup-item-name').textContent = item.name;
      row.querySelector('.cart-popup-quantity').textContent = item.quantity;
      row.dataset.itemName = item.name;
      itemsContainer.appendChild(row);
    });
  }

  const totalQuantity = items.reduce((total, item) => total + Number(item.quantity), 0);
  const cartTotal = items.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0);
  totalContainer.textContent = `Total items: ${totalQuantity} | Cart Total: ${cartTotal.toFixed(2)}`;

  popup.querySelector('.cart-popup-order').addEventListener('click', () => {
    if (items.length) {
      document.querySelector('#order-name').value = items
        .map(item => `${item.name} x ${item.quantity}`)
        .join(', ');
      document.querySelector('#order-quantity').value = totalQuantity;
    }
    popup.remove();
    document.querySelector('#order').scrollIntoView({ behavior: 'smooth' });
  });

  popup.addEventListener('click', async event => {
    if (event.target === popup || event.target.closest('.cart-popup-close')) {
      popup.remove();
      return;
    }

    const button = event.target.closest('[data-cart-action]');
    if (!button) return;

    const row = button.closest('.cart-popup-item');
    const currentQuantity = Number(row.querySelector('.cart-popup-quantity').textContent);
    const quantity = button.dataset.cartAction === 'increase' ? currentQuantity + 1 : currentQuantity - 1;
    const response = await fetch('/api/cart', {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: row.dataset.itemName, quantity })
    });
    const result = await response.json();
    if (!response.ok) return alert(result.error);
    showCartPopup(result.items);
  });

}

document.querySelector('.order form').addEventListener('submit', async event => {
  event.preventDefault();
  const cartResponse = await fetch('/api/cart', { credentials: 'same-origin' });
  const cart = await cartResponse.json();
  const orderName = document.querySelector('#order-name').value.trim();
  const orderQuantity = Number(document.querySelector('#order-quantity').value) || 1;
  const items = cart.items.length ? cart.items : [{ name: orderName, quantity: orderQuantity, price: 0 }];
  const response = await fetch('/api/orders', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: document.querySelector('.order form input[placeholder="enter your name"]').value.trim(),
      phone: document.querySelector('.order form input[placeholder="enter your number"]').value.trim(),
      address: document.querySelector('#order-address').value.trim(),
      message: `${document.querySelector('#order-extra').value.trim()} ${document.querySelector('#order-message').value.trim()}`.trim(),
      orderDate: document.querySelector('#order-date').value || null,
      items
    })
  });
  const result = await response.json();
  if (!response.ok) return alert(result.error);
  event.target.reset();
  alert(`Order #${result.orderId} placed successfully`);
});