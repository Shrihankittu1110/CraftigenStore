const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../models/userModel');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const tokenTtlSeconds = Number(process.env.AUTH_TOKEN_TTL_SECONDS || 60 * 60 * 24 * 7);
const authSecret = process.env.AUTH_SECRET || process.env.JWT_SECRET || 'craftigen-dev-secret-change-me';
const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const asyncHandler = (handler) => (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const sendNotFound = (res, message = 'Resource not found') => {
    return res.status(404).json({ message });
};

const base64UrlEncode = (value) => {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
};

const base64UrlDecode = (value) => {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
};

const signValue = (value) => {
    return crypto.createHmac('sha256', authSecret).update(value).digest('base64url');
};

const createAuthToken = (user) => {
    const safeUser = sanitizeUser(user);
    const header = base64UrlEncode({ alg: 'HS256', typ: 'JWT' });
    const payload = base64UrlEncode({
        sub: String(safeUser._id || safeUser.id),
        email: safeUser.email,
        role: safeUser.role,
        exp: Math.floor(Date.now() / 1000) + tokenTtlSeconds
    });
    const unsignedToken = `${header}.${payload}`;

    return `${unsignedToken}.${signValue(unsignedToken)}`;
};

const verifyAuthToken = (token) => {
    if (!token) return null;

    const parts = String(token).split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const unsignedToken = `${header}.${payload}`;
    const expectedSignature = signValue(unsignedToken);
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
        return null;
    }

    const data = base64UrlDecode(payload);
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;

    return data;
};

const sanitizeUser = (user) => {
    if (!user) return null;

    const data = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete data.password;
    if (adminEmails.includes(String(data.email || '').toLowerCase())) {
        data.role = 'admin';
    } else if (!data.role) {
        data.role = 'customer';
    }
    return data;
};

const withAuthToken = (user) => {
    const safeUser = sanitizeUser(user);
    return {
        ...safeUser,
        token: createAuthToken(user)
    };
};

const getBearerToken = (req) => {
    const authorization = cleanString(req.headers.authorization);
    if (authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.slice(7).trim();
    }

    return cleanString(req.headers['x-auth-token']);
};

const requireAuth = asyncHandler(async (req, res, next) => {
    const tokenData = verifyAuthToken(getBearerToken(req));
    if (!tokenData || !isValidId(tokenData.sub)) {
        return res.status(401).json({ message: 'Login is required' });
    }

    const user = await User.findById(tokenData.sub);
    if (!user) return res.status(401).json({ message: 'Login is required' });

    req.authUser = sanitizeUser(user);
    return next();
});

const isAdminRequest = (req) => {
    const user = req.authUser;
    const email = cleanString(user?.email).toLowerCase();
    return user?.role === 'admin' && adminEmails.includes(email);
};

const requireAdmin = [
    requireAuth,
    (req, res, next) => {
        if (!isAdminRequest(req)) {
            return res.status(403).json({ message: 'Only an admin can manage this resource' });
        }
        return next();
    }
];

const requireOwner = [
    requireAuth,
    (req, res, next) => {
        const userId = req.authUser?._id || req.authUser?.id;
        if (userId && String(userId) === String(req.params.id)) {
            return next();
        }

        return res.status(403).json({ message: 'You can update only your own profile' });
    }
];

const requireOwnerOrAdminForOrder = asyncHandler(async (req, res, next) => {
    const userId = req.authUser?._id || req.authUser?.id;
    const orderUserId = req.resourceOwnerId;

    if ((userId && String(userId) === String(orderUserId)) || isAdminRequest(req)) {
        return next();
    }

    return res.status(403).json({ message: 'You can access only your own orders' });
});

const requireProductionSecret = () => {
    if (process.env.NODE_ENV === 'production' && authSecret === 'craftigen-dev-secret-change-me') {
        throw new Error('AUTH_SECRET must be set in production');
    }
};

const cleanString = (value) => {
    if (typeof value !== 'string') return '';
    return value.trim();
};

const requireConfiguredAdmin = (req, res, next) => {
    if (!adminEmails.length) {
        return res.status(403).json({ message: 'Only an admin can manage products' });
    }

    return next();
};

const assertRequiredString = (body, field, errors, options = {}) => {
    const value = cleanString(body[field]);
    const label = options.label || field;

    if (!value) {
        errors[field] = `${label} is required`;
        return '';
    }

    if (options.min && value.length < options.min) {
        errors[field] = `${label} must be at least ${options.min} characters`;
    }

    if (options.max && value.length > options.max) {
        errors[field] = `${label} must be at most ${options.max} characters`;
    }

    return value;
};

const validateEmail = (email, errors) => {
    const value = cleanString(email).toLowerCase();
    if (!value) {
        errors.email = 'Email is required';
    } else if (!emailPattern.test(value)) {
        errors.email = 'Email is invalid';
    }
    return value;
};

const validationError = (res, errors) => {
    return res.status(400).json({ message: 'Validation failed', errors });
};

module.exports = {
    asyncHandler,
    assertRequiredString,
    cleanString,
    createAuthToken,
    isValidId,
    isAdminRequest,
    requireAuth,
    requireAdmin,
    requireConfiguredAdmin,
    requireOwner,
    requireOwnerOrAdminForOrder,
    requireProductionSecret,
    sanitizeUser,
    sendNotFound,
    validateEmail,
    validationError,
    withAuthToken
};
