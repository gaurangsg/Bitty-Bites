require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const pool = require('./db');
const catalog = require('./catalog.json');
const sellableItems = [...catalog.featuredDishes, ...catalog.popularDishes, ...catalog.menuDishes];

function normalizePhoneNumber(value) {
    const raw = String(value || '').trim();
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
    if (raw.startsWith('+') && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
    return null;
}

async function twilioVerifyRequest(endpoint, fields) {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
        const error = new Error('Phone OTP is not configured yet. Add the Twilio Verify credentials to the server environment.');
        error.status = 503;
        throw error;
    }
    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    const response = await fetch(`https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(fields)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(result.message || 'The SMS provider could not process the verification. Check your phone number and provider settings.');
        error.status = response.status === 429 ? 429 : 502;
        throw error;
    }
    return result;
}

const app = express();
const publicDir = path.join(__dirname, 'dist');

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

let extendedSchemaReady;
function ensureExtendedSchema() {
    if (!extendedSchemaReady) {
        extendedSchemaReady = Promise.all([
            pool.query(`CREATE TABLE IF NOT EXISTS customer_profiles (
                user_id INT UNSIGNED PRIMARY KEY,
                phone VARCHAR(30) NOT NULL DEFAULT '',
                default_address TEXT,
                latitude DECIMAL(10,7) NULL,
                longitude DECIMAL(10,7) NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`),
            pool.query(`CREATE TABLE IF NOT EXISTS order_fulfillment (
                order_id INT UNSIGNED PRIMARY KEY,
                fulfillment_status VARCHAR(32) NOT NULL DEFAULT 'new',
                payment_status VARCHAR(32) NOT NULL DEFAULT 'awaiting_payment',
                payment_method VARCHAR(16) NOT NULL DEFAULT 'upi',
                payment_reference VARCHAR(100) NULL,
                latitude DECIMAL(10,7) NULL,
                longitude DECIMAL(10,7) NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            )`)
        ]).then(async () => {
            const [columns] = await pool.query("SHOW COLUMNS FROM order_fulfillment LIKE 'payment_method'");
            if (!columns.length) await pool.query("ALTER TABLE order_fulfillment ADD COLUMN payment_method VARCHAR(16) NOT NULL DEFAULT 'upi'");
            const [googleColumns] = await pool.query("SHOW COLUMNS FROM users LIKE 'google_sub'");
            if (!googleColumns.length) await pool.query('ALTER TABLE users ADD COLUMN google_sub VARCHAR(255) NULL UNIQUE');
        });
    }
    return extendedSchemaReady;
}

app.use('/api', async (_req, res, next) => {
    try { await ensureExtendedSchema(); next(); }
    catch (error) { console.error('Database setup failed:', error.message); res.status(503).json({ error: 'The account and order tables are not ready. Check the database schema.' }); }
});

function requireOwner(req, res, next) {
    if (!req.session.user) return res.status(401).json({ error: 'Authentication required' });
    const ownerEmail = (process.env.OWNER_EMAIL || '').trim().toLowerCase();
    if (!ownerEmail) return res.status(503).json({ error: 'Set OWNER_EMAIL in the server environment to enable the owner dashboard.' });
    if ((req.session.user.email || '').toLowerCase() !== ownerEmail) return res.status(403).json({ error: 'Owner access only' });
    next();
}

async function emailOrderToOwner(orderId, order, items) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, OWNER_EMAIL, SMTP_FROM } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !OWNER_EMAIL) return false;
    try {
        const transport = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT || 587),
            secure: Number(SMTP_PORT || 587) === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS }
        });
        const itemLines = items.map(item => `${item.quantity} × ${item.name} — ₹${(Number(item.quantity) * Number(item.price)).toFixed(2)}`).join('\n');
        await transport.sendMail({
            from: SMTP_FROM || SMTP_USER,
            to: OWNER_EMAIL,
            subject: `New Bitty Bites order #${orderId}`,
            text: `New order #${orderId}\nCustomer: ${order.customerName}\nPhone: ${order.phone}\nAddress: ${order.address}\n\n${itemLines}\n\nTotal: ₹${Number(order.total).toFixed(2)}\nStatus: Awaiting payment confirmation`
        });
        return true;
    } catch (error) {
        console.error('Owner email notification failed:', error.message);
        return false;
    }
}

function requireAuth(req, res, next) {
    if (!req.session.user) {
        if (req.get('Accept')?.includes('text/html')) {
            return res.redirect('/login');
        }
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

function requirePageAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

app.get('/', requirePageAuth, (req, res) => res.sendFile(path.join(publicDir, 'index.html')));
app.get('/index.html', requirePageAuth, (req, res) => res.sendFile(path.join(publicDir, 'index.html')));
app.get(['/login', '/signup'], (req, res) => res.sendFile(path.join(publicDir, 'index.html')));
app.get(['/cart', '/favorites', '/payment', '/account', '/owner/orders'], requirePageAuth, (req, res) => res.sendFile(path.join(publicDir, 'index.html')));
app.get('/login.html', (req, res) => res.redirect('/login'));
app.get('/signup.html', (req, res) => res.redirect('/signup'));
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

app.get('/api/auth/providers', (_req, res) => {
    res.json({
        google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        phoneOtp: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID)
    });
});

function googleCallbackUrl(req) {
    if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    return `${protocol}://${req.get('host')}/api/auth/google/callback`;
}

function frontendBaseUrl(req) {
    if (process.env.CLIENT_BASE_URL) return process.env.CLIENT_BASE_URL.replace(/\/$/, '');
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    return `${protocol}://${req.get('host')}`;
}

app.get('/api/auth/google', (req, res) => {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return res.redirect(`${frontendBaseUrl(req)}/login?google=setup`);
    const state = crypto.randomBytes(32).toString('hex');
    req.session.googleOAuthState = state;
    req.session.save(error => {
        if (error) return res.redirect(`${frontendBaseUrl(req)}/login?google=error`);
        const query = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: googleCallbackUrl(req),
            response_type: 'code',
            scope: 'openid email profile',
            state,
            prompt: 'select_account'
        });
        res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${query}`);
    });
});

app.get('/api/auth/google/callback', async (req, res) => {
    const receivedState = String(req.query.state || '');
    const savedState = String(req.session.googleOAuthState || '');
    req.session.googleOAuthState = null;
    if (!receivedState || !savedState || receivedState !== savedState) return res.redirect(`${frontendBaseUrl(req)}/login?google=error`);
    if (req.query.error || !req.query.code) return res.redirect(`${frontendBaseUrl(req)}/login?google=cancelled`);
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return res.redirect(`${frontendBaseUrl(req)}/login?google=setup`);

    try {
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code: String(req.query.code),
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: googleCallbackUrl(req),
                grant_type: 'authorization_code'
            })
        });
        const tokens = await tokenResponse.json().catch(() => ({}));
        if (!tokenResponse.ok || !tokens.access_token) throw new Error('Google token exchange failed');
        const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        const googleProfile = await profileResponse.json().catch(() => ({}));
        if (!profileResponse.ok || !googleProfile.sub || !googleProfile.email || googleProfile.email_verified !== true) {
            throw new Error('Google did not return a verified account');
        }

        const [googleUsers] = await pool.query('SELECT id, name, email FROM users WHERE google_sub = ? LIMIT 1', [googleProfile.sub]);
        let user = googleUsers[0];
        if (!user) {
            const [emailUsers] = await pool.query('SELECT id, name, email, google_sub FROM users WHERE email = ? LIMIT 1', [googleProfile.email.toLowerCase()]);
            user = emailUsers[0];
            if (user?.google_sub && user.google_sub !== googleProfile.sub) throw new Error('This email is linked to a different Google account');
            if (user) {
                await pool.query('UPDATE users SET google_sub = ? WHERE id = ?', [googleProfile.sub, user.id]);
            } else {
                const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);
                const displayName = String(googleProfile.name || googleProfile.given_name || 'Bitty Bites customer').slice(0, 100);
                const [created] = await pool.query('INSERT INTO users (name, email, password_hash, google_sub) VALUES (?, ?, ?, ?)', [displayName, googleProfile.email.toLowerCase(), passwordHash, googleProfile.sub]);
                user = { id: created.insertId, name: displayName, email: googleProfile.email.toLowerCase() };
            }
        }

        req.session.regenerate(error => {
            if (error) return res.redirect(`${frontendBaseUrl(req)}/login?google=error`);
            req.session.user = { id: user.id, name: user.name, email: user.email };
            req.session.save(saveError => {
                if (saveError) return res.redirect(`${frontendBaseUrl(req)}/login?google=error`);
                res.redirect(`${frontendBaseUrl(req)}/?auth=google`);
            });
        });
    } catch (error) {
        console.error('Google sign-in failed:', error.message);
        res.redirect(`${frontendBaseUrl(req)}/login?google=error`);
    }
});

app.post('/api/auth/otp/request', async (req, res) => {
    const phone = normalizePhoneNumber(req.body.phone);
    if (!phone) return res.status(400).json({ error: 'Enter a valid phone number with country code, or a 10-digit Indian mobile number.' });
    const previousRequest = Number(req.session.phoneOtpRequestedAt || 0);
    if (Date.now() - previousRequest < 30000) return res.status(429).json({ error: 'Please wait 30 seconds before requesting another code.' });
    try {
        const hasTwilioConfig = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID);
        let pendingOtp = { phone, name: String(req.body.name || '').trim().slice(0, 100), expiresAt: Date.now() + 10 * 60 * 1000 };
        if (hasTwilioConfig) {
            await twilioVerifyRequest('Verifications', { To: phone, Channel: 'sms' });
        } else {
            return res.status(503).json({ error: 'Phone OTP delivery is not configured. Contact the restaurant or sign in another way.' });
        }
        req.session.pendingPhoneOtp = pendingOtp;
        req.session.phoneOtpRequestedAt = Date.now();
        req.session.save(error => {
            if (error) return res.status(500).json({ error: 'The verification code was created, but your sign-in session could not be saved. Request a new code.' });
            res.json({ message: `A one-time code was sent to ${phone}.`, phone });
        });
    } catch (error) {
        res.status(error.status || 502).json({ error: error.message || 'Unable to send a verification code.' });
    }
});

app.post('/api/auth/otp/verify', async (req, res) => {
    const pending = req.session.pendingPhoneOtp;
    const code = String(req.body.code || '').replace(/\s/g, '');
    if (!pending || pending.expiresAt < Date.now()) {
        req.session.pendingPhoneOtp = null;
        return res.status(400).json({ error: 'Your verification session expired. Request a new code.' });
    }
    if (!/^\d{4,10}$/.test(code)) return res.status(400).json({ error: 'Enter the one-time code.' });
    try {
        const verification = await twilioVerifyRequest('VerificationCheck', { To: pending.phone, Code: code });
        if (verification.status !== 'approved') return res.status(401).json({ error: 'That code is incorrect or expired. Check it and try again.' });
        const digits = pending.phone.replace(/\D/g, '');
        const phoneVariants = pending.phone.startsWith('+91') ? [pending.phone, digits, digits.slice(-10)] : [pending.phone, digits, pending.phone];
        const [matches] = await pool.query(
            'SELECT u.id, u.name, u.email, p.phone AS profilePhone FROM users u JOIN customer_profiles p ON p.user_id = u.id WHERE p.phone IN (?, ?, ?) LIMIT 1',
            phoneVariants
        );
        let user = matches[0];
        if (!user) {
            req.session.pendingPhoneOtp = null;
            req.session.verifiedPhoneSignup = { phone: pending.phone, expiresAt: Date.now() + 10 * 60 * 1000 };
            return req.session.save(error => {
                if (error) return res.status(500).json({ error: 'Phone verified, but your session could not be saved. Please request a new code.' });
                res.json({ needsName: true, message: 'Phone verified. Add your name to finish creating your account.' });
            });
        }
        if (user.profilePhone !== pending.phone) await pool.query('UPDATE customer_profiles SET phone = ? WHERE user_id = ?', [pending.phone, user.id]);
        req.session.pendingPhoneOtp = null;
        req.session.user = { id: user.id, name: user.name, email: user.email?.endsWith('@phone.bittybites.local') ? null : user.email, phoneVerified: true };
        req.session.save(error => {
            if (error) return res.status(500).json({ error: 'Phone verified, but the sign-in session could not be saved. Please try again.' });
            res.json({ user: req.session.user });
        });
    } catch (error) {
        console.error('Phone OTP verification failed:', error.message);
        res.status(error.status || 502).json({ error: error.message || 'Unable to verify the code.' });
    }
});

app.post('/api/auth/otp/complete', async (req, res) => {
    const pending = req.session.verifiedPhoneSignup;
    const name = String(req.body.name || '').trim().slice(0, 100);
    if (!pending || pending.expiresAt < Date.now()) {
        req.session.verifiedPhoneSignup = null;
        return res.status(400).json({ error: 'Your verified sign-up session expired. Please request a new code.' });
    }
    if (!name) return res.status(400).json({ error: 'Enter your name to finish creating the account.' });
    try {
        const digits = pending.phone.replace(/\D/g, '');
        const phoneVariants = pending.phone.startsWith('+91') ? [pending.phone, digits, digits.slice(-10)] : [pending.phone, digits, pending.phone];
        const [existing] = await pool.query('SELECT u.id, u.name, u.email FROM users u JOIN customer_profiles p ON p.user_id = u.id WHERE p.phone IN (?, ?, ?) LIMIT 1', phoneVariants);
        let user = existing[0];
        if (!user) {
            const internalEmail = `phone-${digits}@phone.bittybites.local`;
            const passwordHash = await bcrypt.hash(require('crypto').randomBytes(32).toString('hex'), 12);
            const [created] = await pool.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, internalEmail, passwordHash]);
            await pool.query('INSERT INTO customer_profiles (user_id, phone) VALUES (?, ?)', [created.insertId, pending.phone]);
            user = { id: created.insertId, name, email: internalEmail };
        } else if (user.email?.endsWith('@phone.bittybites.local')) {
            await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, user.id]);
            user.name = name;
        }
        req.session.verifiedPhoneSignup = null;
        req.session.user = { id: user.id, name: user.name, email: user.email?.endsWith('@phone.bittybites.local') ? null : user.email, phoneVerified: true };
        req.session.save(error => {
            if (error) return res.status(500).json({ error: 'Your account was created, but the sign-in session could not be saved.' });
            res.status(201).json({ user: req.session.user });
        });
    } catch (error) {
        console.error('Phone account creation failed:', error.message);
        res.status(500).json({ error: 'Unable to finish creating your account.' });
    }
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
    req.session.destroy(() => res.json({ message: 'Logged out' }));
});

app.get('/api/auth/me', (req, res) => {
    if (!req.session.user) {
        if (req.get('Accept')?.includes('text/html')) return res.redirect('/login');
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ user: req.session.user });
});

app.get('/api/account', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT u.id, u.name, u.email, p.phone, p.default_address AS address, p.latitude, p.longitude FROM users u LEFT JOIN customer_profiles p ON p.user_id = u.id WHERE u.id = ?',
            [req.session.user.id]
        );
        const profile = rows[0];
        if (profile.email?.endsWith('@phone.bittybites.local')) profile.email = null;
        profile.phoneVerified = Boolean(req.session.user.phoneVerified);
        res.json({ profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unable to load your account details' });
    }
});

app.put('/api/account', requireAuth, async (req, res) => {
    const { name, phone = '', address = '', latitude = null, longitude = null } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Your name is required' });
    const savedPhone = phone.trim() ? normalizePhoneNumber(phone) : '';
    if (phone.trim() && !savedPhone) return res.status(400).json({ error: 'Enter a valid phone number, including its country code.' });
    const lat = latitude === null || latitude === '' ? null : Number(latitude);
    const lng = longitude === null || longitude === '' ? null : Number(longitude);
    if ((lat !== null && (!Number.isFinite(lat) || lat < -90 || lat > 90)) || (lng !== null && (!Number.isFinite(lng) || lng < -180 || lng > 180))) {
        return res.status(400).json({ error: 'The selected map location is invalid' });
    }
    try {
        const [oldProfiles] = await pool.query('SELECT phone FROM customer_profiles WHERE user_id = ?', [req.session.user.id]);
        const oldPhone = normalizePhoneNumber(oldProfiles[0]?.phone) || oldProfiles[0]?.phone || '';
        if (req.session.user.phoneVerified && oldPhone !== savedPhone) req.session.user.phoneVerified = false;
        await pool.query('UPDATE users SET name = ? WHERE id = ?', [name.trim(), req.session.user.id]);
        await pool.query(
            `INSERT INTO customer_profiles (user_id, phone, default_address, latitude, longitude)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE phone = VALUES(phone), default_address = VALUES(default_address), latitude = VALUES(latitude), longitude = VALUES(longitude)`,
            [req.session.user.id, savedPhone, address.trim(), lat, lng]
        );
        req.session.user.name = name.trim();
        req.session.save(error => {
            if (error) return res.status(500).json({ error: 'Your profile was saved, but the session could not be refreshed' });
            res.json({ profile: { id: req.session.user.id, name: req.session.user.name, email: req.session.user.email, phone: savedPhone, phoneVerified: Boolean(req.session.user.phoneVerified), address: address.trim(), latitude: lat, longitude: lng } });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unable to save your account details' });
    }
});

app.get('/api/cart', requireAuth, (req, res) => res.json({ items: req.session.cart || [] }));

app.post('/api/cart', requireAuth, (req, res) => {
    const { name, image } = req.body;
    if (!name) return res.status(400).json({ error: 'Item name is required' });
    const product = sellableItems.find(item => item.name.toLowerCase() === String(name).trim().toLowerCase() && item.image === image);
    if (!product) return res.status(404).json({ error: 'That dish is not available in the current menu' });
    const cart = req.session.cart || [];
    const existing = cart.find(item => item.name === product.name && item.image === product.image);
    if (existing) {
        existing.quantity += 1;
    } else cart.push({ name: product.name, price: Number(product.price), image: product.image, quantity: 1 });
    req.session.cart = cart;
    req.session.checkoutDraft = null;
    res.status(201).json({ items: cart });
});

app.patch('/api/cart', requireAuth, (req, res) => {
    const { name, image, quantity } = req.body;
    const nextQuantity = Number(quantity);
    if (!name || !Number.isInteger(nextQuantity) || nextQuantity < 0) {
        return res.status(400).json({ error: 'Item name and a valid quantity are required' });
    }

    const cart = req.session.cart || [];
    const itemIndex = cart.findIndex(item => item.name === name && (!image || item.image === image));
    if (itemIndex === -1) return res.status(404).json({ error: 'Cart item not found' });

    if (nextQuantity === 0) cart.splice(itemIndex, 1);
    else cart[itemIndex].quantity = nextQuantity;
    req.session.cart = cart;
    req.session.checkoutDraft = null;
    res.json({ items: cart });
});

app.delete('/api/cart', requireAuth, (req, res) => {
    req.session.cart = [];
    req.session.checkoutDraft = null;
    res.json({ items: [] });
});

app.post('/api/checkout/draft', requireAuth, (req, res) => {
    const { customerName, phone, address, message, orderDate } = req.body;
    const items = req.session.cart || [];
    if (!customerName || !phone || !address || !items.length) {
        return res.status(400).json({ error: 'Contact details, delivery address, and cart items are required' });
    }

    const draft = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        message: message || null,
        orderDate: orderDate || null,
        items: items.map(item => ({ ...item })),
        total: items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0)
    };
    req.session.checkoutDraft = draft;
    req.session.save(error => {
        if (error) return res.status(500).json({ error: 'Unable to save checkout details' });
        res.status(201).json({ draft });
    });
});

app.get('/api/checkout/draft', requireAuth, (req, res) => {
    if (!req.session.checkoutDraft) return res.status(404).json({ error: 'No checkout is ready for payment' });
    res.json({ draft: req.session.checkoutDraft });
});

app.get('/api/favorites', requireAuth, (req, res) => {
    res.json({ items: req.session.favorites || [] });
});

app.post('/api/favorites', requireAuth, (req, res) => {
    const { name, image } = req.body;
    if (!name) return res.status(400).json({ error: 'Favorite item name is required' });
    const product = sellableItems.find(item => item.name.toLowerCase() === String(name).trim().toLowerCase() && item.image === image);
    if (!product) return res.status(404).json({ error: 'That dish is not available in the current menu' });

    const favorites = req.session.favorites || [];
    if (!favorites.some(item => item.name === product.name && item.image === product.image)) {
        favorites.push({ name: product.name, price: Number(product.price), image: product.image });
    }
    req.session.favorites = favorites;
    res.status(201).json({ items: favorites });
});

app.delete('/api/favorites', requireAuth, (req, res) => {
    const { name, image } = req.body;
    if (!name) return res.status(400).json({ error: 'Favorite item name is required' });

    req.session.favorites = (req.session.favorites || []).filter(item => !(item.name === name && (!image || item.image === image)));
    res.json({ items: req.session.favorites });
});

app.post('/api/orders', requireAuth, async (req, res) => {
    const { customerName, phone, address, message, orderDate, latitude = null, longitude = null } = req.body;
    const orderItems = req.session.cart || [];
    if (!customerName?.trim() || !phone?.trim() || !address?.trim() || !orderItems.length) {
        return res.status(400).json({ error: 'Contact details, delivery address, and cart items are required' });
    }
    const savedPhone = normalizePhoneNumber(phone);
    if (!savedPhone) return res.status(400).json({ error: 'Enter a valid phone number, including its country code.' });
    const lat = latitude === null || latitude === '' ? null : Number(latitude);
    const lng = longitude === null || longitude === '' ? null : Number(longitude);
    if ((lat !== null && (!Number.isFinite(lat) || lat < -90 || lat > 90)) || (lng !== null && (!Number.isFinite(lng) || lng < -180 || lng > 180))) {
        return res.status(400).json({ error: 'The selected map location is invalid' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const total = orderItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
        const [order] = await connection.query(
            'INSERT INTO orders (user_id, customer_name, phone, address, message, order_date, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.session.user.id, customerName.trim(), savedPhone, address.trim(), message || null, orderDate ? orderDate.replace('T', ' ') + ':00' : null, total]
        );
        for (const item of orderItems) {
            await connection.query(
                'INSERT INTO order_items (order_id, item_name, quantity, unit_price) VALUES (?, ?, ?, ?)',
                [order.insertId, item.name, Number(item.quantity) || 1, Number(item.price) || 0]
            );
        }
        await connection.query(
            `INSERT INTO customer_profiles (user_id, phone, default_address, latitude, longitude)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE phone = VALUES(phone), default_address = VALUES(default_address), latitude = VALUES(latitude), longitude = VALUES(longitude)`,
            [req.session.user.id, savedPhone, address.trim(), lat, lng]
        );
        await connection.query('UPDATE users SET name = ? WHERE id = ?', [customerName.trim(), req.session.user.id]);
        await connection.query(
            'INSERT INTO order_fulfillment (order_id, latitude, longitude) VALUES (?, ?, ?)',
            [order.insertId, lat, lng]
        );
        await connection.commit();
        req.session.cart = [];
        req.session.checkoutDraft = null;
        req.session.latestOrderId = order.insertId;
        req.session.user.name = customerName.trim();
        const notificationOrder = { orderId: order.insertId, customerName: customerName.trim(), phone: savedPhone, address: address.trim(), total };
        const notificationItems = orderItems.map(item => ({ name: item.name, price: Number(item.price) || 0, quantity: Number(item.quantity) || 1 }));
        req.session.save(error => {
            if (error) return res.status(500).json({ error: 'Order was saved but your checkout session could not be updated' });
            emailOrderToOwner(order.insertId, notificationOrder, notificationItems);
            res.status(201).json({ orderId: order.insertId, total });
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Unable to place your order' });
    } finally {
        connection.release();
    }
});

app.get('/api/orders/current', requireAuth, async (req, res) => {
    const orderId = Number(req.session.latestOrderId);
    if (!orderId) return res.status(404).json({ error: 'No recent order was found' });
    try {
        const [[order]] = await pool.query(
            `SELECT o.id, o.customer_name AS customerName, o.phone, o.address, o.message, o.order_date AS orderDate, o.total,
                    f.fulfillment_status AS fulfillmentStatus, f.payment_status AS paymentStatus, f.payment_method AS paymentMethod, f.payment_reference AS paymentReference,
                    f.latitude, f.longitude
             FROM orders o LEFT JOIN order_fulfillment f ON f.order_id = o.id
             WHERE o.id = ? AND o.user_id = ?`,
            [orderId, req.session.user.id]
        );
        if (!order) return res.status(404).json({ error: 'No recent order was found' });
        const [items] = await pool.query('SELECT item_name AS name, quantity, unit_price AS price FROM order_items WHERE order_id = ?', [orderId]);
        res.json({ order, items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unable to load your order' });
    }
});

app.post('/api/orders/current/payment-reference', requireAuth, async (req, res) => {
    const orderId = Number(req.session.latestOrderId);
    const reference = String(req.body.reference || '').trim();
    if (!orderId || reference.length < 6 || reference.length > 100) return res.status(400).json({ error: 'Enter the UPI UTR/reference shown by your payment app' });
    try {
        const [order] = await pool.query('SELECT id FROM orders WHERE id = ? AND user_id = ?', [orderId, req.session.user.id]);
        if (!order.length) return res.status(404).json({ error: 'Order not found' });
        await pool.query("UPDATE order_fulfillment SET payment_method = 'upi', payment_reference = ?, payment_status = 'verification_requested' WHERE order_id = ?", [reference, orderId]);
        res.json({ message: 'Payment reference sent to the restaurant for verification' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unable to send the payment reference' });
    }
});

app.post('/api/orders/current/payment-method', requireAuth, async (req, res) => {
    const orderId = Number(req.session.latestOrderId);
    const method = String(req.body.method || '').toLowerCase();
    if (!orderId || !['upi', 'cod'].includes(method)) return res.status(400).json({ error: 'Choose a valid payment method for your current order.' });
    try {
        const [result] = await pool.query(
            'UPDATE order_fulfillment SET payment_method = ?, payment_status = ? WHERE order_id = ? AND order_id IN (SELECT id FROM orders WHERE user_id = ?)',
            [method, method === 'cod' ? 'cod_due' : 'awaiting_payment', orderId, req.session.user.id]
        );
        if (!result.affectedRows) return res.status(404).json({ error: 'Order not found.' });
        res.json({ method, paymentStatus: method === 'cod' ? 'cod_due' : 'awaiting_payment', message: method === 'cod' ? 'Cash on delivery selected. The restaurant has your order.' : 'UPI selected for this order.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unable to update your payment method.' });
    }
});

app.get('/api/owner/orders', requireOwner, async (_req, res) => {
    try {
        const [orders] = await pool.query(
            `SELECT o.id, o.customer_name AS customerName, o.phone, o.address, o.message, o.order_date AS orderDate, o.total, o.created_at AS createdAt,
                    f.fulfillment_status AS fulfillmentStatus, f.payment_status AS paymentStatus, f.payment_method AS paymentMethod, f.payment_reference AS paymentReference,
                    f.latitude, f.longitude
             FROM orders o LEFT JOIN order_fulfillment f ON f.order_id = o.id
             ORDER BY o.created_at DESC LIMIT 100`
        );
        if (orders.length) {
            const [items] = await pool.query('SELECT order_id AS orderId, item_name AS name, quantity, unit_price AS price FROM order_items WHERE order_id IN (?)', [orders.map(order => order.id)]);
            const itemsByOrder = new Map();
            for (const item of items) itemsByOrder.set(item.orderId, [...(itemsByOrder.get(item.orderId) || []), item]);
            orders.forEach(order => { order.items = itemsByOrder.get(order.id) || []; });
        }
        res.json({ orders, checkedAt: new Date().toISOString() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unable to load owner orders' });
    }
});

app.patch('/api/owner/orders/:orderId', requireOwner, async (req, res) => {
    const allowedStatuses = ['new', 'accepted', 'preparing', 'out_for_delivery', 'completed', 'cancelled'];
    const allowedPayments = ['awaiting_payment', 'verification_requested', 'received', 'cod_due'];
    const { fulfillmentStatus, paymentStatus } = req.body;
    if (!allowedStatuses.includes(fulfillmentStatus) || !allowedPayments.includes(paymentStatus)) {
        return res.status(400).json({ error: 'Choose a valid fulfillment and payment status' });
    }
    try {
        const [result] = await pool.query('UPDATE order_fulfillment SET fulfillment_status = ?, payment_status = ? WHERE order_id = ?', [fulfillmentStatus, paymentStatus, Number(req.params.orderId)]);
        if (!result.affectedRows) return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Order updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unable to update order' });
    }
});

const port = Number(process.env.PORT || 3000);

if (require.main === module) {
    app.listen(port, () => console.log(`Bitty Bites server running at http://localhost:${port}`));
}

module.exports = app;
