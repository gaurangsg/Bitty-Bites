import React, { useEffect, useRef, useState } from 'react';
import Swiper from 'swiper';
import { Autoplay, Pagination } from 'swiper/modules';
import SiteSections from './SiteSections.jsx';

const apiRequest = async (url, options = {}) => {
  const response = await fetch(url, { ...options, credentials: 'same-origin' });
  if (response.status === 401) { window.location.replace('/login'); return null; }
  return response;
};
const jsonOptions = (method, body) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

function Loader() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => setHidden(true), 3000); return () => clearTimeout(timer); }, []);
  return <div className={`loader-container${hidden ? ' fade-out' : ''}`}><img src="images/loader.gif" alt="" /></div>;
}

function Header({ activeSection, menuOpen, setMenuOpen, onSearch, onCart }) {
  const links = ['home', 'dishes', 'about', 'menu', 'review', 'order'];
  return <header>
    <a href="#" className="logo"><i className="fas fa-utensils"></i>BittyBites.</a>
    <nav className={`navbar${menuOpen ? ' active' : ''}`}>
      {links.map(link => <a key={link} className={activeSection === link ? 'active' : ''} href={`#${link}`} onClick={() => setMenuOpen(false)}>{link}</a>)}
    </nav>
    <div className="icons">
      <i className={`fas fa-bars${menuOpen ? ' fa-times' : ''}`} id="menu-bars" onClick={() => setMenuOpen(v => !v)}></i>
      <i className="fas fa-search" id="search-icon" onClick={onSearch}></i>
      <a href="#" className="fas fa-heart"></a>
      <a href="#" className="fas fa-shopping-cart" onClick={onCart}></a>
    </div>
  </header>;
}

function SearchOverlay({ open, onClose }) {
  return <form action="" id="search-form" className={open ? 'active' : ''} onSubmit={e => e.preventDefault()}>
    <input type="search" placeholder="search here..." name="" id="search-box" />
    <label htmlFor="search-box" className="fas fa-search"></label>
    <i className="fas fa-times" id="close" onClick={onClose}></i>
  </form>;
}

function CartPopup({ items, onClose, onQuantity, onOrder }) {
  const quantity = items.reduce((total, item) => total + Number(item.quantity), 0);
  const total = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  return <div className="cart-popup" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="cart-popup-content" role="dialog" aria-modal="true" aria-labelledby="cart-popup-title">
      <button className="cart-popup-close" type="button" aria-label="Close cart" onClick={onClose}>&times;</button>
      <h2 id="cart-popup-title">Your Cart</h2>
      <div className="cart-popup-items">{items.length ? items.map(item => <div className="cart-popup-item" key={item.name}>
        <span className="cart-popup-item-name">{item.name}</span><div className="cart-popup-controls">
          <button type="button" aria-label="Decrease quantity" onClick={() => onQuantity(item, Number(item.quantity) - 1)}>-</button>
          <span className="cart-popup-quantity">{item.quantity}</span>
          <button type="button" aria-label="Increase quantity" onClick={() => onQuantity(item, Number(item.quantity) + 1)}>+</button>
        </div></div>) : 'Your cart is empty'}</div>
      <div className="cart-popup-total">Total items: {quantity} | Cart Total: {total.toFixed(2)}</div>
      <button className="cart-popup-order btn" type="button" onClick={() => onOrder(items, quantity)}>Proceed to Order</button>
    </div>
  </div>;
}

function AuthPage({ signup }) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setHidden(true), 2500); return () => clearTimeout(timer); }, []);
  const submit = async e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get('name'); const email = data.get('email'); const password = data.get('password');
    if (signup && password !== data.get('confirmPassword')) { alert('Passwords do not match'); return; }
    try {
      const response = await fetch(`/api/auth/${signup ? 'signup' : 'login'}`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(signup ? { name, email, password } : { email, password }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      alert(signup ? 'Account Created Successfully!' : 'Login Successful!'); window.location.href = '/';
    } catch (error) { alert(error.message || (signup ? 'Unable to create account' : 'Unable to log in')); }
  };
  return <><div className={`loader-container${hidden ? ' fade-out' : ''}`}><img src="images/loader.gif" alt="" /></div><section className="auth-page"><div className="auth-box">
    <div className="auth-title">{signup ? 'Sign Up' : 'Login'}</div><div className="auth-subtitle">{signup ? 'Create your BittyBites account' : 'Welcome back to BittyBites'}</div>
    <form className="auth-form" onSubmit={submit}>
      {signup && <div className="auth-field"><label htmlFor="signup-name">Full Name</label><input id="signup-name" name="name" type="text" placeholder="enter your name" required /></div>}
      <div className="auth-field"><label htmlFor="auth-email">Email</label><input id="auth-email" name="email" type="email" placeholder="enter your email" required /></div>
      <div className="auth-field"><label htmlFor="auth-password">Password</label><input id="auth-password" name="password" type="password" placeholder={signup ? 'create a password' : 'enter your password'} required /></div>
      {signup ? <div className="auth-field"><label htmlFor="signup-cpassword">Confirm Password</label><input id="signup-cpassword" name="confirmPassword" type="password" placeholder="confirm your password" required /></div> : <div className="auth-actions"><a className="auth-link" href="#">Forgot password?</a></div>}
      <button className="auth-btn" type="submit">{signup ? 'Create Account' : 'Login'}</button>
    </form>
    <div className="auth-footer">{signup ? <>Already have an account? <a href="/login">Login</a></> : <>Don’t have an account? <a href="/signup">Sign up</a></>}</div>
  </div></section></>;
}

export default function App() {
  const isLogin = location.pathname === '/login' || location.pathname === '/login.html';
  const isSignup = location.pathname === '/signup' || location.pathname === '/signup.html';
  const [menuOpen, setMenuOpen] = useState(false); const [searchOpen, setSearchOpen] = useState(false);
  const [cartItems, setCartItems] = useState(null); const [activeSection, setActiveSection] = useState('home');
  const pageRef = useRef(null);

  useEffect(() => {
    const home = document.querySelector('.home-slider'); const review = document.querySelector('.review-slider');
    const sliders = [];
    if (home) sliders.push(new Swiper(home, { modules: [Autoplay, Pagination], spaceBetween: 30, centeredSlides: true, autoplay: { delay: 3500, disableOnInteraction: false }, pagination: { el: home.querySelector('.swiper-pagination'), clickable: true }, loop: true }));
    if (review) sliders.push(new Swiper(review, { modules: [Autoplay], spaceBetween: 20, centeredSlides: true, autoplay: { delay: 3500, disableOnInteraction: false }, loop: true, breakpoints: { 0: { slidesPerView: 1 }, 640: { slidesPerView: 2 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } } }));
    return () => sliders.forEach(slider => slider.destroy(true, true));
  }, []);

  useEffect(() => {
    const update = () => {
      const sections = [...document.querySelectorAll('section[id]')];
      const current = sections.find(section => window.scrollY >= section.offsetTop - 150 && window.scrollY < section.offsetTop - 150 + section.offsetHeight);
      if (current) setActiveSection(current.id);
      setMenuOpen(false);
    };
    window.addEventListener('scroll', update); return () => window.removeEventListener('scroll', update);
  }, []);

  const loadCart = async () => { const response = await apiRequest('/api/cart'); if (!response) return; const result = await response.json(); if (!response.ok) { alert(result.error); return; } setCartItems(result.items); };
  const addItem = async (name, price, showCart = false) => {
    const response = await apiRequest('/api/cart', jsonOptions('POST', { name, price })); if (!response) return null;
    const result = await response.json(); if (!response.ok) throw new Error(result.error);
    if (showCart) await loadCart(); else alert(`${name} added to cart`); return result;
  };
  const clickPage = async e => {
    const target = e.target.closest('.box .btn, .home .slide .btn');
    if (!target) return;
    e.preventDefault(); const box = target.closest('.box');
    if (box) { const price = box.querySelector('.price') || box.querySelector('span'); try { await addItem(box.querySelector('h3').textContent.trim(), price ? price.textContent.replace(/[^\d.]/g, '') : 0); } catch (error) { alert(error.message || 'Unable to add item to cart'); } }
    else { const slide = target.closest('.slide'); try { await addItem(slide.querySelector('h3').textContent.trim(), 250, true); } catch (error) { alert(error.message || 'Unable to add item to cart'); } }
  };
  const submitPage = async e => {
    if (!e.target.matches('.order form')) return;
    e.preventDefault(); const form = e.target; const value = selector => form.querySelector(selector)?.value.trim() || '';
    const cartResponse = await apiRequest('/api/cart'); if (!cartResponse) return; const cart = await cartResponse.json();
    const orderName = value('#order-name'); const orderQuantity = Number(value('#order-quantity')) || 1;
    const items = cart.items.length ? cart.items : [{ name: orderName, quantity: orderQuantity, price: 0 }];
    const response = await apiRequest('/api/orders', jsonOptions('POST', { customerName: form.querySelector('input[placeholder="enter your name"]').value.trim(), phone: form.querySelector('input[placeholder="enter your number"]').value.trim(), address: value('#order-address'), message: `${value('#order-extra')} ${value('#order-message')}`.trim(), orderDate: form.querySelector('#order-date').value || null, items }));
    if (!response) return; const result = await response.json(); if (!response.ok) { alert(result.error); return; } form.reset(); alert(`Order #${result.orderId} placed successfully`);
  };
  const changeQuantity = async (item, quantity) => { const response = await apiRequest('/api/cart', jsonOptions('PATCH', { name: item.name, quantity })); if (!response) return; const result = await response.json(); if (!response.ok) { alert(result.error); return; } setCartItems(result.items); };
  const proceedOrder = (items, quantity) => { if (items.length) { document.querySelector('#order-name').value = items.map(item => `${item.name} x ${item.quantity}`).join(', '); document.querySelector('#order-quantity').value = quantity; } setCartItems(null); document.querySelector('#order').scrollIntoView({ behavior: 'smooth' }); };

  if (isLogin || isSignup) return <AuthPage signup={isSignup} />;
  return <div ref={pageRef} onClick={clickPage} onSubmit={submitPage}>
    <Header activeSection={activeSection} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onSearch={() => setSearchOpen(true)} onCart={e => { e.preventDefault(); loadCart(); }} />
    <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    <SiteSections /> <Loader />
    {cartItems !== null && <CartPopup items={cartItems} onClose={() => setCartItems(null)} onQuantity={changeQuantity} onOrder={proceedOrder} />}
  </div>;
}
