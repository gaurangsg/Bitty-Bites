import React, { useCallback, useEffect, useRef, useState } from 'react';

import Swiper from 'swiper';

import { Autoplay, Pagination } from 'swiper/modules';

import SiteSections from './SiteSections.jsx';
import { QRCodeSVG } from 'qrcode.react';
import AddressMapPicker from './components/AddressMapPicker.jsx';
import { menuDishes, popularDishes } from './data/catalog.js';



const apiRequest = async (url, options = {}) => {

  let response;

  try {
    response = await fetch(url, { ...options, credentials: 'same-origin' });
  } catch {
    response = new Response(JSON.stringify({ error: 'The API server is unavailable. Start both services with npm run dev.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (response.status === 401) {
    const adminRequest = url.startsWith('/api/owner/') || window.location.pathname.startsWith('/admin/');
    window.location.replace(adminRequest ? '/admin/login' : '/login');
    return null;
  }

  return response;

};

const responseJson = async response => {

  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const body = await response.text();
    throw new Error(body.trim() || `The server returned an invalid response (${response.status}). Start the API with npm run server.`);
  }

  return response.json();

};

const jsonOptions = (method, body) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

const catalogImages = {
  'Burger': 'images/dish-1.png', 'Chicken Nuggets': 'images/dish-2.png',
  'Roasted Chicken': 'images/dish-3.png', 'Italino Pizza': 'images/dish-4.png',
  'Stuffed Cookie': 'images/dish-5.png', 'Fried Chicken': 'images/dish-6.png',
  'BBQ Ribs': 'images/dish-7.png', 'Garlic Breadsticks': 'images/dish-8.png',
  'Pepperoni Pizza': 'images/menu-1.jpg', 'Hamburger': 'images/menu-2.jpg',
  'Pancake': 'images/menu-3.jpg', 'Belgiun Waffle': 'images/menu-4.jpg',
  'Berry Cake': 'images/menu-5.jpg', 'Blue Gray Cupcakes': 'images/menu-6.jpg',
  'Mixed Fruit Juice': 'images/menu-7.jpg', 'Acai Bowl': 'images/menu-8.jpg',
  'American Hot Dogs': 'images/menu-9.jpg', 'Turkey Roast': 'images/menu-10.jpg',
  'chicken chettinad': 'images/menu-11.jpg', 'Air Fried chicken wings': 'images/menu-12.jpg'
};

const itemImage = item => item.image || catalogImages[item.name] || 'images/about-img.png';



function Loader() {

  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('bitty-intro-seen') === 'true') { setHidden(true); return undefined; }
    sessionStorage.setItem('bitty-intro-seen', 'true');
    const timer = window.setTimeout(() => setHidden(true), 850);
    return () => clearTimeout(timer);
  }, []);

  return <div className={`loader-container${hidden ? ' fade-out' : ''}`}><img src="images/loader.gif" alt="" /></div>;

}

function ToastMessage({ toast, onDismiss }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setLeaving(true), 3400);
    const removeTimer = window.setTimeout(() => onDismiss(toast.id), 3800);
    return () => { window.clearTimeout(leaveTimer); window.clearTimeout(removeTimer); };
  }, [toast.id, onDismiss]);
  return <div className={`app-toast app-toast-${toast.type}${leaving ? ' is-leaving' : ''}`} role="status">
    <span className="app-toast-icon"><i className={`fas ${toast.type === 'error' ? 'fa-exclamation' : 'fa-check'}`}></i></span>
    <span className="app-toast-message">{toast.message}</span>
    <button type="button" aria-label="Dismiss notification" onClick={() => onDismiss(toast.id)}><i className="fas fa-times"></i></button>
  </div>;
}

function ToastViewport({ toasts, onDismiss }) {
  return <div className="app-toast-viewport" aria-live="polite" aria-relevant="additions">
    {toasts.map(toast => <ToastMessage key={toast.id} toast={toast} onDismiss={onDismiss} />)}
  </div>;
}

function HomeScrollAid() {
  const [scrollState, setScrollState] = useState({ progress: 0, visible: false });
  const frameRef = useRef(0);
  useEffect(() => {
    const update = () => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        const range = document.documentElement.scrollHeight - window.innerHeight;
        setScrollState({ progress: range > 0 ? Math.min(100, (window.scrollY / range) * 100) : 0, visible: window.scrollY > 520 });
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { cancelAnimationFrame(frameRef.current); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  return <>
    <div className="home-reading-progress" aria-hidden="true"><span style={{ transform: `scaleX(${scrollState.progress / 100})` }} /></div>
    <button type="button" className={`home-back-to-top${scrollState.visible ? ' is-visible' : ''}`} aria-label="Back to top" tabIndex={scrollState.visible ? 0 : -1} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><i className="fas fa-arrow-up"></i></button>
  </>;
}



function Header({ activeSection, menuOpen, setMenuOpen, onSearch, isHome, cartCount, favoriteCount }) {

  const links = ['home', 'dishes', 'about', 'menu', 'review', 'order'];

  return <header>

    <a href="/" className="logo"><i className="fas fa-utensils"></i>BittyBites.</a>

    <nav className={`navbar${menuOpen ? ' active' : ''}`}>

      {links.map(link => <a key={link} className={isHome && activeSection === link ? 'active' : ''} href={`${isHome ? '' : '/'}#${link}`} onClick={() => setMenuOpen(false)}>{link}</a>)}

    </nav>

    <div className="icons">

      <button type="button" className="header-icon-button mobile-menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(v => !v)}><i className={`fas fa-bars${menuOpen ? ' fa-times' : ''}`}></i></button>

      <button type="button" className="header-icon-button" id="search-icon" aria-label="Search menu" onClick={onSearch}><i className="fas fa-search"></i></button>

      <a href="/account" className="fas fa-user-circle header-account-link" aria-label="Your account"></a>

      <a href="/favorites" className="fas fa-heart header-favorite-link" aria-label={`Favorites, ${favoriteCount} saved`}>{favoriteCount > 0 && <span className="header-count">{favoriteCount}</span>}</a>

      <a href="/cart" className="fas fa-shopping-cart header-cart-link" aria-label={`Cart, ${cartCount} items`}>{cartCount > 0 && <span className="header-count">{cartCount}</span>}</a>

    </div>

  </header>;

}



function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const catalog = [
    ...popularDishes.map(item => ({ ...item, section: 'dishes' })),
    ...menuDishes.map(item => ({ ...item, section: 'menu' }))
  ];
  const normalizedQuery = query.trim().toLowerCase();
  const results = (normalizedQuery ? catalog.filter(item => item.name.toLowerCase().includes(normalizedQuery)) : catalog).slice(0, 6);

  useEffect(() => {
    if (!open) return undefined;
    setQuery('');
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 50);
    const closeOnEscape = event => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', closeOnEscape);
    return () => { window.clearTimeout(focusTimer); document.removeEventListener('keydown', closeOnEscape); };
  }, [open, onClose]);

  if (!open) return null;
  return <div className="search-overlay-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="search-panel" role="dialog" aria-modal="true" aria-label="Search dishes">
      <form className="search-panel-form" onSubmit={event => event.preventDefault()}>
        <i className="fas fa-search" aria-hidden="true"></i>
        <input ref={inputRef} type="search" placeholder="Search dishes, desserts, drinks…" value={query} onChange={event => setQuery(event.target.value)} aria-label="Search menu items" />
        <button type="button" className="search-close-button" aria-label="Close search" onClick={onClose}><i className="fas fa-times"></i></button>
      </form>
      <div className="search-results" aria-live="polite">
        <span className="search-results-label">{normalizedQuery ? `${results.length} matching dishes` : 'Popular picks'}</span>
        {results.length ? results.map(item => <a className="search-result" href={`/#${item.section}`} key={`${item.section}-${item.name}`} onClick={onClose}>
          <img src={item.image} alt="" /><span><strong>{item.name}</strong><small>{item.section === 'dishes' ? 'Popular dish' : 'Today’s menu'}</small></span><b>₹{Number(item.price).toFixed(0)}</b>
        </a>) : <p className="search-no-results">No dishes match “{query}”. Try another name.</p>}
      </div>
    </section>
  </div>;
}



function CartPage({ items, account, onQuantity, onClear, orderPending, checkoutError }) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pin, setPin] = useState(null);
  const checkoutRef = useRef(null);
  const totalItems = items.reduce((sum, item) => sum + Number(item.quantity), 0);
  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

  useEffect(() => {
    if (checkoutOpen) checkoutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [checkoutOpen]);

  useEffect(() => {
    if (!account) return;
    setCustomerName(account.name || '');
    setPhone(account.phone || '');
    setAddress(account.address || '');
    if (account.latitude !== null && account.latitude !== undefined && account.longitude !== null && account.longitude !== undefined) {
      setPin([Number(account.latitude), Number(account.longitude)]);
    }
  }, [account]);

  return <main className="commerce-page cart-page">
    <div className="commerce-heading">
      <span className="commerce-eyebrow">YOUR ORDER, YOUR WAY</span>
      <h1>Your Cart</h1>
      <p>Everything you picked, ready when you are.</p>
    </div>
    {items.length ? <>
      <div className="commerce-layout">
        <section className="commerce-card cart-list-card" aria-label="Cart items">
          <div className="commerce-card-heading"><div><h2>Order items</h2><span>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span></div><button className="text-action" type="button" onClick={onClear}>Clear cart</button></div>
          <div className="cart-list">{items.map(item => <article className="cart-row" key={`${item.name}-${item.image}`}>
            <div className="commerce-product-image"><img src={itemImage(item)} alt={item.name} /></div>
            <div className="cart-product-details"><h3>{item.name}</h3><span className="cart-unit-price">{`\u20B9`}{Number(item.price).toFixed(0)} each</span>
              <div className="quantity-stepper" aria-label={`Quantity for ${item.name}`}>
                <button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => onQuantity(item, Number(item.quantity) - 1)}>-</button>
                <span>{item.quantity}</span>
                <button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => onQuantity(item, Number(item.quantity) + 1)}>+</button>
              </div>
            </div>
            <strong className="cart-line-total">{`\u20B9`}{(Number(item.price) * Number(item.quantity)).toFixed(0)}</strong>
            <button className="cart-remove" type="button" aria-label={`Remove ${item.name}`} onClick={() => onQuantity(item, 0)}><i className="fas fa-trash-alt"></i></button>
          </article>)}</div>
          <a href="/#menu" className="continue-shopping"><i className="fas fa-arrow-left"></i> Continue exploring the menu</a>
        </section>
        <aside className="commerce-card order-summary-card">
          <span className="commerce-eyebrow">THE TOTAL</span><h2>Order summary</h2>
          <div className="summary-line"><span>Subtotal</span><strong>{`\u20B9`}{subtotal.toFixed(0)}</strong></div>
          <div className="summary-line"><span>Delivery</span><strong className="free-delivery">Free</strong></div>
          <div className="summary-total"><span>Total</span><strong>{`\u20B9`}{subtotal.toFixed(0)}</strong></div>
          <button className="btn checkout-button" type="button" onClick={() => setCheckoutOpen(true)}>
            {checkoutOpen ? 'Checkout details below' : 'Continue to checkout'} <i className="fas fa-arrow-right"></i>
          </button>
          <p className="checkout-note"><i className="fas fa-lock"></i> Your order is confirmed after you submit your details.</p>
        </aside>
      </div>
      {checkoutOpen && <section className="checkout-section" ref={checkoutRef} aria-labelledby="checkout-title">
        <div className="checkout-section-heading">
          <div><span className="commerce-eyebrow">ONE LAST STEP</span>
            <h2 id="checkout-title">Where should we bring it?</h2>
            <p>Add your details and we will get your order moving.</p></div>
          <button className="checkout-back-link" type="button" onClick={() => { setCheckoutOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><i className="fas fa-arrow-left"></i> Back to your cart</button>
        </div>
        <form className="cart-checkout-form">
          <div className="checkout-fields-card">
            <div className="checkout-step-title"><span>01</span><div><h3>Contact details</h3><p>How can we reach you?</p></div></div>
            <div className="checkout-fields-grid">
              <label className="checkout-field"><span>Your name</span><input name="customerName" type="text" placeholder="Enter your name" autoComplete="name" value={customerName} onChange={event => setCustomerName(event.target.value)} required /></label>
              {account?.phoneVerified ? <div className="checkout-field saved-phone-field"><span>Your verified number</span><div className="verified-phone-value"><i className="fas fa-shield-alt"></i>{phone}</div><small>This number came from your OTP sign-in.</small><input type="hidden" name="phone" value={phone} readOnly /></div> : <label className="checkout-field"><span>Your number</span><input name="phone" type="tel" placeholder="Enter your phone number" autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} required /></label>}
            </div>
            <div className="checkout-step-title"><span>02</span><div><h3>Order details</h3><p>Your cart items are included automatically.</p></div></div>
            <div className="checkout-fields-grid">
              <label className="checkout-field checkout-field-wide"><span>Your order</span><input value={items.map(item => `${item.name} ? ${item.quantity}`).join(', ')} readOnly /></label>
              <label className="checkout-field"><span>Additional food</span><input name="extra" type="text" placeholder="Any extras? (optional)" /></label>
              <label className="checkout-field"><span>How much</span><input value={totalItems} readOnly /></label>
              <label className="checkout-field checkout-field-wide"><span>Date and time</span><input name="orderDate" type="datetime-local" /></label>
            </div>
            <div className="checkout-step-title"><span>03</span><div><h3>Delivery details</h3><p>Where should we deliver your order?</p></div></div>
            <div className="checkout-fields-grid">
              <label className="checkout-field checkout-field-wide"><span>Your address</span><textarea name="address" rows="3" placeholder="Enter your complete address" autoComplete="street-address" value={address} onChange={event => setAddress(event.target.value)} required />
                {account?.address && <small className="saved-details-note"><i className="fas fa-check-circle"></i> Your saved address is filled in. You can change it for this order.</small>}
                <button type="button" className="address-map-trigger" onClick={() => setMapOpen(true)}><i className="fas fa-map-marked-alt"></i> Select your address on a map</button>
                {pin && <span className="selected-map-note"><i className="fas fa-location-dot"></i> Map pin selected</span>}
                <input type="hidden" name="latitude" value={pin?.[0] ?? ''} readOnly /><input type="hidden" name="longitude" value={pin?.[1] ?? ''} readOnly />
              </label>
              <label className="checkout-field checkout-field-wide"><span>Your message</span><textarea name="message" rows="3" placeholder="Delivery notes or anything else? (optional)" /></label>
            </div>
          </div>
          <aside className="commerce-card checkout-final-card">
            <span className="commerce-eyebrow">READY WHEN YOU ARE</span><h3>Order total</h3>
            <div className="summary-line"><span>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span><strong>{`\u20B9`}{subtotal.toFixed(0)}</strong></div>
            <div className="summary-line"><span>Delivery</span><strong className="free-delivery">Free</strong></div>
            <div className="summary-total"><span>Total</span><strong>{`\u20B9`}{subtotal.toFixed(0)}</strong></div>
            {checkoutError && <p className="checkout-error" role="alert">{checkoutError}</p>}
            <button className="btn checkout-button" type="submit" disabled={orderPending}>
              {orderPending ? <><span className="button-spinner"></span> Placing your order...</> : <>Place my order <i className="fas fa-arrow-right"></i></>}
            </button>
            <p className="checkout-note"><i className="fas fa-lock"></i> Your details are only used to complete this order.</p>
            <a className="checkout-help-call" href="tel:+919096001994"><i className="fas fa-phone-alt"></i> Need help? Call the restaurant</a>
          </aside>
        </form>
      </section>}
      <AddressMapPicker open={mapOpen} onClose={() => setMapOpen(false)} initialPosition={pin} onConfirm={setPin} />
    </> : <div className="commerce-card commerce-empty-state">
      <div className="empty-state-icon"><i className="fas fa-shopping-basket"></i></div>
      <h2>Your cart is waiting for something delicious</h2><p>Pick a favorite from our menu and it will show up here.</p>
      <a href="/#menu" className="btn">Explore the menu</a>
    </div>}
  </main>;
}

function FavoritesPage({ items, onToggleFavorite, onAddToCart }) {
  return <main className="commerce-page favorites-page">
    <div className="commerce-heading">
      <span className="commerce-eyebrow">SAVED WITH LOVE</span>
      <h1>Your Favorites</h1>
      <p>Your personal shortlist of Bitty Bites favorites.</p>
    </div>
    {items.length ? <div className="favorites-grid">{items.map(item => <article className="box favorite-product-card" key={`${item.name}-${item.image}`}>
      <button type="button" className="favorite-card-heart is-favorite" data-favorite-control="true" aria-label={`Remove ${item.name} from favorites`} onClick={() => onToggleFavorite(item)}><i className="fas fa-heart"></i></button>
      <img src={itemImage(item)} alt={item.name} />
      <div className="favorite-product-info"><span className="favorite-card-label">A BITTY BITES PICK</span><h3>{item.name}</h3>
        <div className="favorite-product-bottom"><span className="price">{'\u20B9'}{Number(item.price).toFixed(0)}</span><button className="btn" type="button" onClick={() => onAddToCart(item.name, item.price, false, item.image)}>Add to cart</button></div>
      </div>
    </article>)}</div> : <div className="commerce-card commerce-empty-state">
      <div className="empty-state-icon favorite-empty-icon"><i className="fas fa-heart"></i></div>
      <h2>Save the dishes you love</h2><p>Tap the heart on any dish or menu item and it will be ready for you here.</p>
      <a href="/#dishes" className="btn">Find your favorites</a>
    </div>}
  </main>;
}

function AccountPage({ profile, onSave, onLogout }) {
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [pin, setPin] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile) return;
    setForm({ name: profile.name || '', phone: profile.phone || '', address: profile.address || '' });
    if (profile.latitude !== null && profile.latitude !== undefined && profile.longitude !== null && profile.longitude !== undefined) setPin([Number(profile.latitude), Number(profile.longitude)]);
  }, [profile]);

  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async event => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try { await onSave({ ...form, latitude: pin?.[0] ?? null, longitude: pin?.[1] ?? null }); }
    catch (saveError) { setError(saveError.message || 'Unable to save your profile'); }
    finally { setSaving(false); }
  };
  const logout = async () => {
    setLoggingOut(true);
    setError('');
    try { await onLogout('/login'); }
    catch (logoutError) { setError(logoutError.message || 'Unable to sign out right now'); setLoggingOut(false); }
  };

  return <main className="commerce-page account-page">
    <div className="commerce-heading"><span className="commerce-eyebrow">YOUR BITTY BITES PROFILE</span><h1>Your Account</h1><p>Keep your delivery details saved for a quicker checkout next time.</p></div>
    <div className="account-layout">
      <form className="commerce-card account-profile-card" onSubmit={submit}>
        <div className="commerce-card-heading"><div><h2>Personal details</h2><span>Private to your account</span></div><i className="fas fa-user-circle account-profile-mark"></i></div>
        <label className="checkout-field"><span>Full name</span><input name="name" value={form.name} onChange={update} autoComplete="name" required /></label>
        <label className="checkout-field"><span>{profile?.email ? 'Email' : 'Sign-in method'}</span><input value={profile?.email || 'Phone number OTP'} readOnly aria-describedby="account-email-note" /></label>
        <small id="account-email-note" className="saved-details-note">{profile?.email ? 'Your sign-in email is used to identify your account.' : 'Your verified phone number is used to identify your account.'}</small>
        <label className="checkout-field"><span>Phone number</span><input name="phone" type="tel" value={form.phone} onChange={update} autoComplete="tel" required /></label>
        <div className="account-address-heading"><div><h3>Default delivery address</h3><p>This will be filled in automatically during checkout.</p></div><i className="fas fa-map-marker-alt"></i></div>
        <label className="checkout-field"><span>Address</span><textarea name="address" rows="4" value={form.address} onChange={update} autoComplete="street-address" placeholder="House, street, area, city and PIN code" /></label>
        <button className="address-map-trigger" type="button" onClick={() => setMapOpen(true)}><i className="fas fa-map-marked-alt"></i> Set delivery pin on map</button>
        {pin && <small className="selected-map-note"><i className="fas fa-map-marker-alt"></i> Map pin saved: {pin[0].toFixed(5)}, {pin[1].toFixed(5)}</small>}
        {error && <p className="checkout-error" role="alert">{error}</p>}
        <button className="btn account-save-button" type="submit" disabled={saving}>{saving ? <><span className="button-spinner"></span> Saving your details…</> : <>Save my details <i className="fas fa-check"></i></>}</button>
      </form>
      <aside className="commerce-card account-benefits-card"><span className="account-benefit-icon"><i className="fas fa-bolt"></i></span><h2>Checkout, without the repeat typing</h2><p>Your name, phone number and default address are filled in for your next order. You can still change delivery details any time.</p><button className="account-logout-button" type="button" onClick={logout} disabled={loggingOut}>{loggingOut ? <><span className="button-spinner"></span> Signing out...</> : <><i className="fas fa-sign-out-alt"></i> Sign out of your account</>}</button></aside>
    </div>
    <AddressMapPicker open={mapOpen} onClose={() => setMapOpen(false)} initialPosition={pin} onConfirm={setPin} />
  </main>;
}

function OwnerOrdersPage({ showToast, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const latestOrderId = useRef(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadOrders = useCallback(async (silent = false) => {
    try {
      const response = await apiRequest('/api/owner/orders');
      if (!response) return;
      const result = await responseJson(response);
      if (!response.ok) throw new Error(result.error);
      const newestId = result.orders[0]?.id ?? null;
      if (silent && latestOrderId.current !== null && newestId && newestId > latestOrderId.current) showToast(`New order #${newestId} just arrived`);
      latestOrderId.current = newestId;
      setOrders(result.orders);
      setError('');
    } catch (loadError) { setError(loadError.message || 'Unable to load orders'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => {
    loadOrders();
    const timer = window.setInterval(() => loadOrders(true), 8000);
    return () => window.clearInterval(timer);
  }, [loadOrders]);

  const updateOrder = async (order, fulfillmentStatus, paymentStatus) => {
    try {
      const response = await apiRequest(`/api/owner/orders/${order.id}`, jsonOptions('PATCH', { fulfillmentStatus, paymentStatus }));
      if (!response) return;
      const result = await responseJson(response);
      if (!response.ok) throw new Error(result.error);
      await loadOrders(true);
      showToast(`Order #${order.id} updated`);
    } catch (updateError) { showToast(updateError.message || 'Unable to update order', 'error'); }
  };

  const logout = async () => {
    setLoggingOut(true);
    try { await onLogout('/admin/login'); }
    catch (logoutError) { showToast(logoutError.message || 'Unable to sign out right now', 'error'); setLoggingOut(false); }
  };

  return <main className="commerce-page owner-orders-page">
    <div className="admin-portal-bar"><a className="admin-portal-brand" href="/admin/orders"><i className="fas fa-utensils"></i><span>BittyBites <small>RESTAURANT ADMIN</small></span></a><div className="admin-portal-actions"><a href="/" target="_blank" rel="noreferrer"><i className="fas fa-external-link-alt"></i> View storefront</a><button type="button" onClick={logout} disabled={loggingOut}>{loggingOut ? <><span className="button-spinner"></span> Signing out...</> : <><i className="fas fa-sign-out-alt"></i> Sign out</>}</button></div></div>
    <div className="owner-dashboard-topline"><span className="owner-live-indicator"><i></i> Auto-refreshing every 8 seconds</span></div>
    <div className="commerce-heading owner-dashboard-heading"><span className="commerce-eyebrow">RESTAURANT OPERATIONS</span><h1>Orders Dashboard</h1><p>New customer orders appear here as soon as checkout is submitted.</p></div>
    {error && <div className="commerce-card owner-dashboard-error"><i className="fas fa-lock"></i><div><strong>Owner dashboard unavailable</strong><p>{error} Sign in with the restaurant admin account configured by OWNER_EMAIL.</p><a href="/admin/login">Admin sign-in</a></div></div>}
    <div className="owner-orders-toolbar"><span><strong>{orders.length}</strong> recent orders</span><button type="button" className="text-action" onClick={() => loadOrders()}><i className="fas fa-sync-alt"></i> Refresh now</button></div>
    {loading ? <div className="commerce-card owner-orders-loading"><span className="payment-spinner"></span> Loading your orders…</div> : orders.length ? <div className="owner-orders-list">{orders.map(order => <article className="commerce-card owner-order-card" key={order.id}>
      <div className="owner-order-header"><div><span className="commerce-eyebrow">ORDER #{order.id}</span><h2>{order.customerName}</h2><small>{new Date(order.createdAt).toLocaleString()}</small></div><strong className="owner-order-total">₹{Number(order.total).toFixed(2)}</strong></div>
      <div className="owner-order-contact"><a href={`tel:${order.phone}`}><i className="fas fa-phone"></i> {order.phone}</a><a href={`https://maps.google.com/?q=${encodeURIComponent(order.latitude != null && order.longitude != null ? `${order.latitude},${order.longitude}` : order.address)}`} target="_blank" rel="noreferrer"><i className="fas fa-map-marker-alt"></i> Open delivery address</a></div>
      <p className="owner-payment-method"><i className={`fas ${order.paymentMethod === 'cod' ? 'fa-money-bill-wave' : 'fa-qrcode'}`}></i> Payment: <strong>{order.paymentMethod === 'cod' ? 'Cash on delivery' : 'UPI'}</strong>{order.paymentStatus === 'cod_due' && <span> · Cash due on delivery</span>}</p>
      <p className="owner-order-address">{order.address}</p>
      <div className="owner-order-items">{order.items.map(item => <span key={`${item.name}-${item.quantity}`}>{item.quantity} × {item.name} <b>₹{(Number(item.price) * Number(item.quantity)).toFixed(0)}</b></span>)}</div>
      {order.message && <p className="owner-order-note"><strong>Customer note:</strong> {order.message}</p>}
      {order.paymentReference && <p className="owner-payment-reference"><i className="fas fa-receipt"></i> UPI reference: <strong>{order.paymentReference}</strong></p>}
      <div className="owner-order-controls"><label><span>Order status</span><select value={order.fulfillmentStatus || 'new'} onChange={event => updateOrder(order, event.target.value, order.paymentStatus || 'awaiting_payment')}><option value="new">New</option><option value="accepted">Accepted</option><option value="preparing">Preparing</option><option value="out_for_delivery">Out for delivery</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label>
        <label><span>Payment</span><select value={order.paymentStatus || 'awaiting_payment'} onChange={event => updateOrder(order, order.fulfillmentStatus || 'new', event.target.value)}><option value="awaiting_payment">Awaiting payment</option><option value="verification_requested">Verify UPI reference</option><option value="cod_due">Cash due on delivery</option><option value="received">Received</option></select></label></div>
    </article>)}</div> : <div className="commerce-card commerce-empty-state owner-empty-state"><div className="empty-state-icon"><i className="fas fa-receipt"></i></div><h2>No orders yet</h2><p>New orders will show up here immediately after a customer submits checkout.</p></div>}
  </main>;
}

function AdminLoginPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const submit = async event => {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/owner/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.get('email'), password: data.get('password') })
      });
      const result = await responseJson(response);
      if (!response.ok) throw new Error(result.error || 'Unable to sign in');
      window.location.assign('/admin/orders');
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in to restaurant administration');
    } finally {
      setPending(false);
    }
  };

  return <section className="auth-page admin-auth-page">
    <div className="auth-shell">
      <aside className="auth-visual">
        <a href="/" className="auth-brand"><i className="fas fa-utensils"></i><span>BittyBites<span>.</span></span></a>
        <div className="auth-visual-glow auth-visual-glow-one"></div><div className="auth-visual-glow auth-visual-glow-two"></div>
        <div className="auth-food-orbit"><div className="auth-food-orbit-inner"><img src="/images/home-img-2.png" alt="Fresh BittyBites kitchen special" /></div><span className="auth-food-spark auth-food-spark-one">✦</span><span className="auth-food-spark auth-food-spark-two">✧</span></div>
        <div className="auth-visual-copy"><span className="auth-visual-kicker"><i className="fas fa-chart-line"></i> RESTAURANT OPERATIONS</span><h2>Every order,<br />right on <em>time.</em></h2><p>A dedicated place to follow new orders and keep service moving.</p><div className="auth-rating"><span>●</span><b>BittyBites admin portal</b></div></div>
        <span className="auth-visual-footnote">RESTAURANT ADMINISTRATION</span>
      </aside>
      <div className="auth-box admin-auth-box">
        <a href="/" className="auth-mobile-brand"><i className="fas fa-utensils"></i> BittyBites<span>.</span></a>
        <div className="auth-card-heading"><span className="auth-eyebrow">PRIVATE ADMIN PORTAL</span><div className="auth-title">Restaurant sign in</div><div className="auth-subtitle">Sign in with the owner account to manage incoming orders.</div></div>
        {error && <div className="auth-inline-error" role="alert"><i className="fas fa-exclamation-circle"></i><span>{error}</span></div>}
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-field"><label htmlFor="admin-email">Owner email</label><input id="admin-email" name="email" type="email" autoComplete="username" placeholder="Enter the configured owner email" required /></div>
          <div className="auth-field"><label htmlFor="admin-password">Password</label><input id="admin-password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required /></div>
          <button className="auth-btn" type="submit" disabled={pending}>{pending && <span className="auth-button-spinner" aria-hidden="true" />}{pending ? 'Signing in...' : <>Open orders dashboard <i className="fas fa-arrow-right"></i></>}</button>
        </form>
        <div className="auth-footer"><a href="/">← Back to the customer storefront</a></div>
      </div>
    </div>
  </section>;
}

function PaymentPage({ showToast }) {
  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState('upi');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const [referencePending, setReferencePending] = useState(false);
  const [paymentPending, setPaymentPending] = useState(false);

  useEffect(() => {
    let active = true;
    const loadDraft = async () => {
      try {
        const response = await apiRequest('/api/orders/current');
        if (!response) return;
        const result = await responseJson(response);
        if (!response.ok) throw new Error(result.error);
        if (active) {
          setOrder({ ...result.order, items: result.items });
          setMethod(result.order.paymentMethod || 'upi');
        }
      } catch (loadError) {
        if (active) setError(loadError.message || 'Unable to load payment details');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadDraft();
    return () => { active = false; };
  }, []);

  if (loading) return <main className="commerce-page payment-page"><div className="payment-loading"><span className="payment-spinner"></span><p>Preparing your secure checkout?</p></div></main>;
  if (error || !order) return <main className="commerce-page payment-page">
    <div className="commerce-card commerce-empty-state payment-error-state"><div className="empty-state-icon"><i className="fas fa-receipt"></i></div>
      <h2>Payment details aren’t ready</h2><p>{error || 'Return to your cart and place your order first.'}</p><a href="/cart" className="btn">Back to cart</a>
    </div>
  </main>;

  const amount = Number(order.total) || 0;
  const upiPaymentUri = `upi://pay?${new URLSearchParams({ pa: '9096001994@ybl', pn: 'GAURANG RAVINDRA SANGLE', am: amount.toFixed(2), cu: 'INR', tn: `Bitty Bites order ${order.id}` }).toString()}`;
  const submitReference = async event => {
    event.preventDefault();
    setReferencePending(true);
    try {
      const response = await apiRequest('/api/orders/current/payment-reference', jsonOptions('POST', { reference }));
      if (!response) return;
      const result = await responseJson(response);
      if (!response.ok) throw new Error(result.error);
      showToast(result.message);
      setOrder(current => ({ ...current, paymentStatus: 'verification_requested', paymentReference: reference.trim() }));
      setReference('');
    } catch (submitError) { showToast(submitError.message || 'Unable to send payment reference', 'error'); }
    finally { setReferencePending(false); }
  };
  const confirmCashOnDelivery = async () => {
    setPaymentPending(true);
    try {
      const response = await apiRequest('/api/orders/current/payment-method', jsonOptions('POST', { method: 'cod' }));
      if (!response) return;
      const result = await responseJson(response);
      if (!response.ok) throw new Error(result.error);
      setOrder(current => ({ ...current, paymentMethod: 'cod', paymentStatus: result.paymentStatus }));
      showToast(result.message);
    } catch (confirmError) { showToast(confirmError.message || 'Unable to select cash on delivery', 'error'); }
    finally { setPaymentPending(false); }
  };
  return <main className="commerce-page payment-page">
    <div className="payment-topline"><a href="/cart" className="continue-shopping"><i className="fas fa-arrow-left"></i> Back to your cart</a><span><i className="fas fa-lock"></i> Secure checkout</span></div>
    <div className="commerce-heading payment-heading">
      <span className="commerce-eyebrow">FINAL STEP</span><h1>Choose how to pay</h1><p>Your order is ready. Select a payment method to continue.</p>
    </div>
    <div className="payment-layout">
      <section className="payment-methods-card commerce-card">
        <div className="payment-step-heading"><span className="payment-step-number">01</span><div><h2>Payment method</h2><p>Choose your preferred way to pay.</p></div></div>
        <div className="payment-method-options" role="radiogroup" aria-label="Payment method">
          <button type="button" role="radio" aria-checked={method === 'upi'} className={`payment-method-option${method === 'upi' ? ' selected' : ''}`} onClick={() => setMethod('upi')}>
            <span className="payment-method-icon upi-method-icon"><i className="fas fa-qrcode"></i></span><span className="payment-method-copy"><strong>UPI / Scan & Pay</strong><small>Pay using a UPI app</small></span><span className="payment-radio"></span>
          </button>
          <button type="button" role="radio" aria-checked={method === 'razorpay'} className={`payment-method-option${method === 'razorpay' ? ' selected' : ''}`} onClick={() => setMethod('razorpay')}>
            <span className="payment-method-icon razorpay-method-icon"><i className="fas fa-shield-alt"></i></span><span className="payment-method-copy"><strong>Razorpay Checkout</strong><small>UPI, cards and other methods</small></span><span className="payment-radio"></span>
          </button>
          <button type="button" role="radio" aria-checked={method === 'cod'} className={`payment-method-option${method === 'cod' ? ' selected' : ''}`} onClick={() => setMethod('cod')}>
            <span className="payment-method-icon cod-method-icon"><i className="fas fa-money-bill-wave"></i></span><span className="payment-method-copy"><strong>Cash on Delivery</strong><small>Pay cash when your order arrives</small></span><span className="payment-radio"></span>
          </button>
        </div>
        <div className="payment-detail-panel">
          {method === 'cod' ? <>
            <div className="payment-detail-heading"><div><span className="commerce-eyebrow">PAY WHEN IT ARRIVES</span><h3>Cash on delivery</h3></div><span className="setup-badge upi-ready-badge">AVAILABLE</span></div>
            {order.paymentMethod === 'cod' && order.paymentStatus === 'cod_due' ? <div className="payment-reference-confirmed cod-confirmed"><i className="fas fa-check-circle"></i> Cash on delivery is selected. Your order is with the restaurant; pay ₹{amount.toFixed(0)} in cash when it arrives.</div> : <>
              <div className="payment-info-note"><i className="fas fa-info-circle"></i><span>No online payment is needed now. Confirm the order and pay the delivery person in cash when it arrives.</span></div>
              <button className="btn payment-action-button" type="button" onClick={confirmCashOnDelivery} disabled={paymentPending}>{paymentPending ? <><span className="button-spinner"></span> Confirming order...</> : <>Confirm cash on delivery <i className="fas fa-check"></i></>}</button>
            </>}
          </> : method === 'upi' ? <>
            <div className="payment-detail-heading"><div><span className="commerce-eyebrow">UPI PAYMENT</span><h3>Scan and pay</h3></div><span className="setup-badge upi-ready-badge">UPI READY</span></div>
            <div className="upi-payment-preview">
                <div className="upi-qr-placeholder upi-qr-live"><QRCodeSVG value={upiPaymentUri} size={220} level="M" includeMargin title="Scan to pay with UPI" /><strong>Scan with any UPI app</strong><span>Amount: ₹{amount.toFixed(2)}</span><small>Order #{order.id}</small></div>
              <div className="upi-recipient"><span>Paying</span><strong>GAURANG RAVINDRA SANGLE</strong><span>UPI ID</span><strong>9096001994@ybl</strong><small>Scan the QR code or open your UPI app. Verify the payee name and amount before confirming.</small></div>
            </div>
            <div className="payment-info-note"><i className="fas fa-info-circle"></i><span>UPI payments are not automatically verified. After paying, enter the UTR/reference from your UPI app so the restaurant can match and verify it.</span></div>
              <a className="btn payment-action-button" href={upiPaymentUri}>Open UPI app to pay ₹{amount.toFixed(2)}</a>
            {order.paymentStatus === 'verification_requested' ? <div className="payment-reference-confirmed"><i className="fas fa-clock"></i> Reference {order.paymentReference} is waiting for restaurant verification.</div> : <form className="payment-reference-form" onSubmit={submitReference}>
              <label htmlFor="upi-reference">Already paid? Enter your UPI UTR/reference</label>
              <div><input id="upi-reference" value={reference} onChange={event => setReference(event.target.value)} minLength="6" maxLength="100" placeholder="e.g. 412345678901" required /><button className="btn" type="submit" disabled={referencePending}>{referencePending ? 'Sending…' : 'Send for verification'}</button></div>
            </form>}
          </> : <>
            <div className="payment-detail-heading"><div><span className="commerce-eyebrow">RAZORPAY</span><h3>Pay securely online</h3></div><span className="setup-badge">SETUP IN PROGRESS</span></div>
            <div className="razorpay-preview"><div className="razorpay-mark">R</div><div><strong>Razorpay secure checkout</strong><p>Customers will complete payment in the hosted Razorpay checkout.</p></div></div>
            <div className="payment-method-chips"><span>UPI</span><span>Cards</span><span>Net banking</span><span>Wallets</span></div>
            <div className="payment-info-note"><i className="fas fa-lock"></i><span>Payment status will be verified by the server before an order is confirmed.</span></div>
            <button className="btn payment-action-button" type="button" disabled>Razorpay setup pending</button>
          </>}
        </div>
      </section>
      <aside className="commerce-card payment-summary-card">
        <span className="commerce-eyebrow">ORDER SUMMARY</span><h2>Your order</h2>
        <div className="payment-order-items">{order.items.map((item, index) => <div className="payment-order-item" key={`${item.name}-${index}`}>
          <div className="payment-order-thumb"><img src={itemImage(item)} alt="" /></div><div className="payment-order-name"><strong>{item.name}</strong><span>Qty {item.quantity}</span></div><strong>{`\u20B9`}{(Number(item.price) * Number(item.quantity)).toFixed(0)}</strong>
        </div>)}</div>
        <div className="summary-line"><span>Items</span><strong>{order.items.reduce((sum, item) => sum + Number(item.quantity), 0)}</strong></div>
        <div className="summary-line"><span>Delivery</span><strong className="free-delivery">Free</strong></div>
        <div className="summary-total"><span>Total to pay</span><strong>{`\u20B9`}{amount.toFixed(0)}</strong></div>
        <div className="payment-customer"><i className="fas fa-map-marker-alt"></i><div><strong>Delivering to {order.customerName}</strong><span>{order.address}</span></div></div>
      </aside>
    </div>
      <p className="payment-disclaimer">Order #{order.id} is saved and visible to the restaurant. {order.paymentMethod === 'cod' ? 'Cash is due when the order arrives.' : 'UPI transfer status is confirmed manually.'}</p>
  </main>;
}

function AuthPage({ signup }) {

    const [pending, setPending] = useState(false);
    const [authError, setAuthError] = useState('');
  const [providers, setProviders] = useState({ google: false, phoneOtp: false });
  const [googleNotice, setGoogleNotice] = useState('');
  const [authMode, setAuthMode] = useState('password');
  const [otpPhone, setOtpPhone] = useState('');
  const [otpName, setOtpName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [needsName, setNeedsName] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  useEffect(() => {
    let active = true;
    fetch('/api/auth/providers', { credentials: 'same-origin' }).then(responseJson).then(result => { if (active) setProviders(result); }).catch(() => {});
    const query = new URLSearchParams(window.location.search);
    const googleStatus = query.get('google');
    if (googleStatus === 'setup') setGoogleNotice('Google sign-in needs OAuth credentials before it can be used.');
    else if (googleStatus === 'cancelled') setGoogleNotice('Google sign-in was cancelled. You can continue with email and password.');
    else if (googleStatus === 'error') setAuthError('Google sign-in could not be completed. Please try again.');
    if (googleStatus) window.history.replaceState({}, '', window.location.pathname);
    return () => { active = false; };
  }, []);

  const finishAuth = user => {
    const welcomeName = user?.name || otpName || '';
    sessionStorage.setItem('authSuccessMessage', signup
      ? `Welcome to BittyBites${welcomeName ? `, ${welcomeName}` : ''}. Let’s find something delicious.`
      : `Welcome back${welcomeName ? `, ${welcomeName}` : ''}. Your next meal is just around the corner.`);
    window.location.href = '/';
  };

  const submit = async e => {

    e.preventDefault();

    if (pending) return;

    const data = new FormData(e.currentTarget);

    const name = data.get('name'); const email = data.get('email'); const password = data.get('password');

    if (signup && password !== data.get('confirmPassword')) { setAuthError('Your passwords do not match. Please check them and try again.'); return; }

    setPending(true);
    setAuthError('');

    try {

      const response = await fetch(`/api/auth/${signup ? 'signup' : 'login'}`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(signup ? { name, email, password } : { email, password }) });

      const result = await responseJson(response); if (!response.ok) throw new Error(result.error);

      finishAuth(result.user);

    } catch (error) { setAuthError(error.message || (signup ? 'Unable to create account' : 'Unable to log in')); }
    finally { setPending(false); }

  };

  const sendPhoneCode = async event => {
    event.preventDefault();
    if (pending) return;
    setPending(true); setAuthError(''); setOtpMessage('');
    try {
      const response = await fetch('/api/auth/otp/request', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: otpPhone, name: otpName }) });
      const result = await responseJson(response);
      if (!response.ok) throw new Error(result.error);
      setOtpPhone(result.phone); setOtpSent(true); setNeedsName(false); setOtpCode(''); setOtpMessage(result.message);
    } catch (error) { setAuthError(error.message || 'Unable to send the verification code'); }
    finally { setPending(false); }
  };

  const verifyPhoneCode = async event => {
    event.preventDefault();
    if (pending) return;
    setPending(true); setAuthError('');
    try {
      const response = await fetch('/api/auth/otp/verify', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: otpCode }) });
      const result = await responseJson(response);
      if (!response.ok) throw new Error(result.error);
      if (result.needsName) { setNeedsName(true); setOtpMessage(result.message); return; }
      finishAuth(result.user);
    } catch (error) { setAuthError(error.message || 'Unable to verify the code'); }
    finally { setPending(false); }
  };

  const completePhoneSignup = async event => {
    event.preventDefault();
    if (pending) return;
    setPending(true); setAuthError('');
    try {
      const response = await fetch('/api/auth/otp/complete', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: otpName }) });
      const result = await responseJson(response);
      if (!response.ok) throw new Error(result.error);
      finishAuth(result.user);
    } catch (error) { setAuthError(error.message || 'Unable to create your account'); }
    finally { setPending(false); }
  };

  const toggleMode = () => { setAuthMode(mode => mode === 'phone' ? 'password' : 'phone'); setAuthError(''); setOtpMessage(''); };

  return <section className="auth-page"><div className="auth-shell">
    <aside className="auth-visual">
      <a href="/" className="auth-brand"><i className="fas fa-utensils"></i><span>BittyBites<span>.</span></span></a>
      <div className="auth-visual-glow auth-visual-glow-one"></div><div className="auth-visual-glow auth-visual-glow-two"></div>
      <div className="auth-food-orbit"><div className="auth-food-orbit-inner"><img src="images/home-img-3.png" alt="Freshly prepared Bitty Bites special" /></div><span className="auth-food-spark auth-food-spark-one">✦</span><span className="auth-food-spark auth-food-spark-two">✧</span></div>
      <div className="auth-visual-copy"><span className="auth-visual-kicker"><i className="fas fa-leaf"></i> MADE FRESH, SHARED WITH JOY</span><h2>{signup ? <>Make room<br />for something<br /><em>delicious.</em></> : <>Good food.<br />Great to have<br /><em>you back.</em></>}</h2><p>A little comfort, a lot of flavor. Your table is waiting.</p><div className="auth-rating"><span>★★★★★</span><b>Made with care, every day</b></div></div>
      <span className="auth-visual-footnote">A BITTY BITES MOMENT</span>
    </aside>
    <div className="auth-box">
      <a href="/" className="auth-mobile-brand"><i className="fas fa-utensils"></i> BittyBites<span>.</span></a>
      <div className="auth-card-heading"><span className="auth-eyebrow">{signup ? 'JOIN THE TABLE' : 'WELCOME BACK'}</span><div className="auth-title">{authMode === 'phone' ? 'Phone sign in' : signup ? 'Create your account' : 'Sign in'}</div><div className="auth-subtitle">{authMode === 'phone' ? 'We’ll send a secure one-time code to your phone.' : signup ? 'Save your favorites and make checkout feel effortless.' : 'Sign in to pick up right where you left off.'}</div></div>

    {authError && <div className="auth-inline-error" role="alert"><i className="fas fa-exclamation-circle"></i><span>{authError}</span></div>}
    {otpMessage && <div className="auth-otp-message" role="status"><i className="fas fa-check-circle"></i><span>{otpMessage}</span></div>}
    {googleNotice && <div className="auth-otp-message" role="status"><i className="fas fa-info-circle"></i><span>{googleNotice}</span></div>}
    {providers.phoneOtp && <div className="auth-mode-switch"><button type="button" onClick={toggleMode}>{authMode === 'phone' ? <><i className="fas fa-envelope"></i> Use email and password</> : <><i className="fas fa-mobile-alt"></i> Continue with phone OTP</>}</button></div>}

    <a href="/api/auth/google" className="auth-google-button"><span className="auth-google-mark" aria-hidden="true">G</span><span>Continue with Google</span><i className="fas fa-external-link-alt auth-google-arrow" aria-hidden="true"></i></a>
    {!providers.google && <small className="auth-provider-note">Google sign-in needs an OAuth client configured for this site.</small>}
    <div className="auth-divider"><span>or continue with email</span></div>

    {authMode === 'password' ? <form className="auth-form" onSubmit={submit}>

      {signup && <div className="auth-field"><label htmlFor="signup-name">Full Name</label><input id="signup-name" name="name" type="text" autoComplete="name" placeholder="enter your name" required /></div>}

      <div className="auth-field"><label htmlFor="auth-email">Email</label><input id="auth-email" name="email" type="email" autoComplete="email" placeholder="enter your email" required /></div>

      <div className="auth-field"><label htmlFor="auth-password">Password</label><input id="auth-password" name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} placeholder={signup ? 'create a password' : 'enter your password'} required /></div>

      {signup ? <div className="auth-field"><label htmlFor="signup-cpassword">Confirm Password</label><input id="signup-cpassword" name="confirmPassword" type="password" autoComplete="new-password" placeholder="confirm your password" required /></div> : <div className="auth-actions"><a className="auth-link" href="#">Forgot password?</a></div>}

      <button className="auth-btn" type="submit" disabled={pending}>{pending && <span className="auth-button-spinner" aria-hidden="true"></span>}{pending ? (signup ? 'Creating your account…' : 'Signing you in…') : (signup ? 'Create Account' : 'Login')}</button>

    </form> : needsName ? <form className="auth-form" onSubmit={completePhoneSignup}>
      <div className="auth-field"><label htmlFor="otp-signup-name">Your name</label><input id="otp-signup-name" value={otpName} onChange={event => setOtpName(event.target.value)} autoComplete="name" placeholder="enter your name" required /></div>
      <button className="auth-btn" type="submit" disabled={pending}>{pending && <span className="auth-button-spinner" aria-hidden="true" />}{pending ? 'Creating your account…' : 'Finish creating account'}</button>
    </form> : <form className="auth-form" onSubmit={otpSent ? verifyPhoneCode : sendPhoneCode}>
      {otpSent && <div className="auth-field"><label htmlFor="otp-signup-name">Your name <small>(only needed for a new account)</small></label><input id="otp-signup-name" value={otpName} onChange={event => setOtpName(event.target.value)} autoComplete="name" placeholder="enter your name if this is your first time" /></div>}
      <div className="auth-field"><label htmlFor="otp-phone">Phone number</label><input id="otp-phone" type="tel" value={otpPhone} onChange={event => setOtpPhone(event.target.value)} autoComplete="tel" placeholder="10-digit Indian mobile number" required /></div>
      {otpSent && <div className="auth-field"><label htmlFor="otp-code">One-time code</label><input id="otp-code" inputMode="numeric" autoComplete="one-time-code" value={otpCode} onChange={event => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Enter the SMS code" required /></div>}
      <button className="auth-btn" type="submit" disabled={pending}>{pending && <span className="auth-button-spinner" aria-hidden="true" />}{pending ? (otpSent ? 'Verifying…' : 'Sending code…') : (otpSent ? 'Verify and continue' : 'Send one-time code')}</button>
      {otpSent && <button className="auth-resend-button" type="button" onClick={sendPhoneCode} disabled={pending}>Send a new code</button>}
      <small className="auth-otp-privacy">Your number is used to securely access your account.</small>
    </form>}

    <div className="auth-footer">{signup ? <>Already have an account? <a href="/login">Login</a></> : <>Don’t have an account? <a href="/signup">Sign up</a></>}</div>

  </div>
  </div></section>;

}



export default function App() {
  const pathname = window.location.pathname;
  const isLogin = pathname === '/login' || pathname === '/login.html';
  const isSignup = pathname === '/signup' || pathname === '/signup.html';
  const isAdminLogin = pathname === '/admin' || pathname === '/admin/login';
  const isAdminOrders = pathname === '/admin/orders' || pathname === '/owner/orders';
  const isAdminArea = isAdminLogin || isAdminOrders;
  const isCartPage = pathname === '/cart';
  const isFavoritesPage = pathname === '/favorites';
  const isPaymentPage = pathname === '/payment';
  const isAccountPage = pathname === '/account';
  const isOwnerOrdersPage = pathname === '/owner/orders';
  const isHome = !isLogin && !isSignup && !isAdminArea && !isCartPage && !isFavoritesPage && !isPaymentPage && !isAccountPage && !isOwnerOrdersPage;
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [accountProfile, setAccountProfile] = useState(null);
  const [activeSection, setActiveSection] = useState('home');
  const [orderPending, setOrderPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [authToast, setAuthToast] = useState('');
  const [authToastLeaving, setAuthToastLeaving] = useState(false);
  const [toasts, setToasts] = useState([]);
  const dismissToast = useCallback(id => setToasts(current => current.filter(toast => toast.id !== id)), []);
  const showToast = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(current => [...current, { id, message, type }].slice(-3));
  }, []);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const logout = useCallback(async destination => {
    const response = await apiRequest('/api/auth/logout', { method: 'POST' });
    if (!response) return;
    const result = await responseJson(response);
    if (!response.ok) throw new Error(result.error || 'Unable to sign out');
    window.location.assign(destination);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const googleLogin = query.get('auth') === 'google';
    let message = sessionStorage.getItem('authSuccessMessage');
    if (googleLogin) {
      message = 'You’re signed in with Google. Welcome to BittyBites.';
      window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash}`);
    }
    if (!message) return undefined;
    sessionStorage.removeItem('authSuccessMessage');
    setAuthToast(message);
    const leaveTimer = window.setTimeout(() => setAuthToastLeaving(true), 3400);
    const removeTimer = window.setTimeout(() => setAuthToast(''), 3800);
    return () => { window.clearTimeout(leaveTimer); window.clearTimeout(removeTimer); };
  }, []);

  const loadCart = async () => {
    const response = await apiRequest('/api/cart');
    if (!response) return [];
    const result = await responseJson(response);
    if (!response.ok) throw new Error(result.error);
    setCartItems(result.items);
    return result.items;
  };

  const loadFavorites = async () => {
    const response = await apiRequest('/api/favorites');
    if (!response) return [];
    const result = await responseJson(response);
    if (!response.ok) throw new Error(result.error);
    setFavoriteItems(result.items);
    return result.items;
  };

  const loadAccount = async () => {
    const response = await apiRequest('/api/account');
    if (!response) return null;
    const result = await responseJson(response);
    if (!response.ok) throw new Error(result.error);
    setAccountProfile(result.profile);
    return result.profile;
  };

  const saveAccount = async values => {
    const response = await apiRequest('/api/account', jsonOptions('PUT', values));
    if (!response) return false;
    const result = await responseJson(response);
    if (!response.ok) throw new Error(result.error);
    setAccountProfile(result.profile);
    showToast('Your account details are saved for next time');
    return true;
  };

  const addItem = async (name, price, openCart = false, image = '') => {
    const response = await apiRequest('/api/cart', jsonOptions('POST', { name, price, image }));
    if (!response) return null;
    const result = await responseJson(response);
    if (!response.ok) throw new Error(result.error);
    setCartItems(result.items);
    if (openCart) window.location.href = '/cart';
    else showToast(`${name} added to your cart`);
    return result;
  };

  const toggleFavorite = async item => {
    const saved = favoriteItems.some(favorite => favorite.name === item.name && favorite.image === item.image);
    const response = await apiRequest('/api/favorites', jsonOptions(saved ? 'DELETE' : 'POST', {
      name: item.name,
      price: item.price,
      image: item.image
    }));
    if (!response) return;
    const result = await responseJson(response);
    if (!response.ok) { showToast(result.error, 'error'); return; }
    setFavoriteItems(result.items);
    showToast(saved ? `${item.name} removed from favorites` : `${item.name} saved to favorites`);
  };

  const changeQuantity = async (item, quantity) => {
    const response = await apiRequest('/api/cart', jsonOptions('PATCH', { name: item.name, image: item.image, quantity }));
    if (!response) return;
    const result = await responseJson(response);
    if (!response.ok) { showToast(result.error, 'error'); return; }
    setCartItems(result.items);
  };

  const clearCart = async () => {
    const response = await apiRequest('/api/cart', { method: 'DELETE' });
    if (!response) return;
    const result = await responseJson(response);
    if (!response.ok) { showToast(result.error, 'error'); return; }
    setCartItems(result.items);
    showToast('Cart cleared');
  };

  const submitPage = async event => {
    if (!event.target.matches('.cart-checkout-form')) return;
    event.preventDefault();
    const form = event.target;
    setOrderPending(true);
    setCheckoutError('');
    try {
      const data = new FormData(form);
      const payload = {
        customerName: data.get('customerName').trim(),
        phone: data.get('phone').trim(),
        address: data.get('address').trim(),
        latitude: data.get('latitude') || null,
        longitude: data.get('longitude') || null,
        message: `${data.get('extra').trim()} ${data.get('message').trim()}`.trim(),
        orderDate: data.get('orderDate') || null
      };
      const response = await apiRequest('/api/orders', jsonOptions('POST', payload));
      if (!response) return;
      const result = await responseJson(response);
      if (!response.ok) {
        setCheckoutError(result.error);
        return;
      }
      window.location.href = '/payment';
    } catch (error) {
      setCheckoutError(error.message || 'Unable to prepare your order');
    } finally {
      setOrderPending(false);
    }
  };

  useEffect(() => {
    if (isLogin || isSignup || isAdminArea) return undefined;
    let active = true;
    Promise.all([loadCart(), loadFavorites(), loadAccount()]).catch(error => {
      if (active) showToast(error.message || 'Unable to load your saved items', 'error');
    });
    return () => { active = false; };
  }, [pathname, showToast]);

  useEffect(() => {
    if (!isHome) return undefined;
    const home = document.querySelector('.home-slider');
    const review = document.querySelector('.review-slider');
    const sliders = [];
    if (home) sliders.push(new Swiper(home, { modules: [Autoplay, Pagination], spaceBetween: 30, centeredSlides: true, autoplay: { delay: 3500, disableOnInteraction: false }, pagination: { el: home.querySelector('.swiper-pagination'), clickable: true }, loop: true }));
    if (review) sliders.push(new Swiper(review, { modules: [Autoplay], spaceBetween: 20, centeredSlides: true, autoplay: { delay: 3500, disableOnInteraction: false }, loop: true, breakpoints: { 0: { slidesPerView: 1 }, 640: { slidesPerView: 2 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } } }));
    return () => sliders.forEach(slider => slider.destroy(true, true));
  }, [isHome]);

  useEffect(() => {
    if (!isHome || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return undefined;
    const elements = [...document.querySelectorAll('.dishes .box, .menu .box, .about .row, .review .slide, .order-checkout-handoff')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -35px 0px' });
    elements.forEach((element, index) => {
      element.classList.add('scroll-reveal');
      element.style.setProperty('--reveal-delay', `${(index % 4) * 70}ms`);
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, [isHome]);

  useEffect(() => {
    if (!isHome) return undefined;
    const update = () => {
      const sections = [...document.querySelectorAll('section[id]')];
      const current = sections.find(section => window.scrollY >= section.offsetTop - 150 && window.scrollY < section.offsetTop - 150 + section.offsetHeight);
      if (current) setActiveSection(current.id);
      setMenuOpen(false);
    };
    window.addEventListener('scroll', update);
    return () => window.removeEventListener('scroll', update);
  }, [isHome]);

  if (isAdminLogin) return <AdminLoginPage />;
  if (isLogin || isSignup) return <AuthPage signup={isSignup} />;

  const totalCartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity), 0);
  return <div onSubmit={submitPage}>
    <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    {authToast && <div className={`auth-success-toast${authToastLeaving ? ' is-leaving' : ''}`} role="status" aria-live="polite">
      <span className="auth-success-icon"><i className="fas fa-check"></i></span>
      <span className="auth-success-copy"><strong>You’re right where you belong</strong><small>{authToast}</small></span>
      <button type="button" aria-label="Dismiss welcome message" onClick={() => setAuthToast('')}><i className="fas fa-times"></i></button>
    </div>}
    {!isAdminOrders && <Header
      activeSection={activeSection}
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
      onSearch={openSearch}
      isHome={isHome}
      cartCount={totalCartCount}
      favoriteCount={favoriteItems.length}
    />}
    {!isAdminOrders && <SearchOverlay open={searchOpen} onClose={closeSearch} />}
    {isHome && <HomeScrollAid />}
    {isPaymentPage ? <PaymentPage showToast={showToast} /> : isCartPage ? <CartPage items={cartItems} account={accountProfile} onQuantity={changeQuantity} onClear={clearCart} orderPending={orderPending} checkoutError={checkoutError} /> :
      isAccountPage ? <AccountPage profile={accountProfile} onSave={saveAccount} onLogout={logout} /> :
        isAdminOrders || isOwnerOrdersPage ? <OwnerOrdersPage showToast={showToast} onLogout={logout} /> :
      isFavoritesPage ? <FavoritesPage items={favoriteItems} onToggleFavorite={toggleFavorite} onAddToCart={addItem} /> :
        <SiteSections favorites={favoriteItems} onToggleFavorite={toggleFavorite} onAddToCart={addItem} />}
    <Loader />
  </div>;
}
