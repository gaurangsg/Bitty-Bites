require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcryptjs');
const pool = require('./db');

const app = express();
const publicDir = __dirname;

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const sessionOptions = {
    secret: process.env.SESSION_SECRET || 'bitty-bites-development-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' }
};

if (process.env.NODE_ENV === 'production') {
    sessionOptions.store = new MySQLStore({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'bitty_bites'
    });
}

app.use(session(sessionOptions));

function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

function requirePageAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login.html');
    }
    next();
}

app.get('/', requirePageAuth, (req, res) => res.sendFile(path.join(publicDir, 'index.html')));
app.get('/index.html', requirePageAuth, (req, res) => res.sendFile(path.join(publicDir, 'index.html')));
app.use(express.static(publicDir, { index: false }));

app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
        return res.status(400).json({ error: 'Name, email, and a password of at least 6 characters are required' });
    }

    try {
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length) return res.status(409).json({ error: 'An account with this email already exists' });

        const passwordHash = await bcrypt.hash(password, 12);
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [name.trim(), email.trim().toLowerCase(), passwordHash]
        );
        req.session.user = { id: result.insertId, name: name.trim(), email: email.trim().toLowerCase() };
        req.session.save(error => {
            if (error) return res.status(500).json({ error: 'Unable to create account' });
            res.status(201).json({ user: req.session.user });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unable to create account' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
        const user = users[0];
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        req.session.user = { id: user.id, name: user.name, email: user.email };
        req.session.save(error => {
            if (error) return res.status(500).json({ error: 'Unable to log in' });
            res.json({ user: req.session.user });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unable to log in' });
    }
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
    req.session.destroy(() => res.json({ message: 'Logged out' }));
});

app.get('/api/auth/me', (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ user: req.session.user });
});

app.get('/api/cart', requireAuth, (req, res) => res.json({ items: req.session.cart || [] }));

app.post('/api/cart', requireAuth, (req, res) => {
    const { name, price } = req.body;
    if (!name) return res.status(400).json({ error: 'Item name is required' });
    const cart = req.session.cart || [];
    const existing = cart.find(item => item.name === name);
    if (existing) existing.quantity += 1;
    else cart.push({ name, price: Number(price) || 0, quantity: 1 });
    req.session.cart = cart;
    res.status(201).json({ items: cart });
});

app.patch('/api/cart', requireAuth, (req, res) => {
    const { name, quantity } = req.body;
    const nextQuantity = Number(quantity);
    if (!name || !Number.isInteger(nextQuantity) || nextQuantity < 0) {
        return res.status(400).json({ error: 'Item name and a valid quantity are required' });
    }

    const cart = req.session.cart || [];
    const itemIndex = cart.findIndex(item => item.name === name);
    if (itemIndex === -1) return res.status(404).json({ error: 'Cart item not found' });

    if (nextQuantity === 0) cart.splice(itemIndex, 1);
    else cart[itemIndex].quantity = nextQuantity;
    req.session.cart = cart;
    res.json({ items: cart });
});

app.delete('/api/cart', requireAuth, (req, res) => {
    req.session.cart = [];
    res.json({ items: [] });
});

app.post('/api/orders', requireAuth, async (req, res) => {
    const { customerName, phone, address, message, orderDate, items } = req.body;
    const orderItems = Array.isArray(items) && items.length ? items : req.session.cart || [];
    if (!customerName || !phone || !address || !orderItems.length || orderItems.some(item => !item.name)) {
        return res.status(400).json({ error: 'Customer details and at least one food item are required' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const total = orderItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
        const [order] = await connection.query(
            'INSERT INTO orders (user_id, customer_name, phone, address, message, order_date, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.session.user.id, customerName, phone, address, message || null, orderDate || null, total]
        );
        for (const item of orderItems) {
            await connection.query(
                'INSERT INTO order_items (order_id, item_name, quantity, unit_price) VALUES (?, ?, ?, ?)',
                [order.insertId, item.name, Number(item.quantity) || 1, Number(item.price) || 0]
            );
        }
        await connection.commit();
        req.session.cart = [];
        res.status(201).json({ orderId: order.insertId });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Unable to place order' });
    } finally {
        connection.release();
    }
});

const port = Number(process.env.PORT || 3000);

if (require.main === module) {
    app.listen(port, () => console.log(`Bitty Bites server running at http://localhost:${port}`));
}

module.exports = app;