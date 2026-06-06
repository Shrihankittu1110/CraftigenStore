const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const { hashPassword, needsPasswordRehash, verifyPassword } = require('../services/passwordService');
const {
    asyncHandler,
    assertRequiredString,
    cleanString,
    isValidId,
    requireAdmin,
    requireOwner,
    sanitizeUser,
    sendNotFound,
    validateEmail,
    validationError,
    withAuthToken
} = require('./helpers');

const passwordPattern = /^.{6,}$/;

const buildUserPayload = async (body, options = {}) => {
    const errors = {};
    const payload = {};

    if (!options.partial || body.name !== undefined) {
        payload.name = assertRequiredString(body, 'name', errors, { min: 2, max: 50 });
    }

    if (!options.partial || body.email !== undefined) {
        payload.email = validateEmail(body.email, errors);
    }

    if (!options.partial || body.avatar !== undefined) {
        payload.avatar = cleanString(body.avatar);
    }

    if (!options.partial || body.password) {
        const password = cleanString(body.password);
        if (!password) {
            errors.password = 'Password is required';
        } else if (!passwordPattern.test(password)) {
            errors.password = 'Password must be at least 6 characters long';
        } else {
            payload.password = await hashPassword(password);
        }
    }

    return { errors, payload };
};

router.post('/add', asyncHandler(async (req, res) => {
    const { errors, payload } = await buildUserPayload(req.body);
    if (Object.keys(errors).length) return validationError(res, errors);

    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser) {
        return res.status(409).json({ message: 'Email is already registered' });
    }

    const user = await User.create(payload);
    return res.json(withAuthToken(user));
}));

router.get('/getall', requireAdmin, asyncHandler(async (req, res) => {
    const users = await User.find({}).sort({ createdAt: -1 });
    const visibleUsers = users
        .map(sanitizeUser)
        .filter((user) => user && ['admin', 'customer'].includes(user.role));

    return res.json(visibleUsers);
}));

router.get('/getid/:id', requireOwner, asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid user id' });

    const user = await User.findById(req.params.id);
    if (!user) return sendNotFound(res, 'User not found');

    return res.json(sanitizeUser(user));
}));

router.get('/getbyemail/:email', requireAdmin, asyncHandler(async (req, res) => {
    const email = cleanString(req.params.email).toLowerCase();
    const users = await User.find({ email });
    return res.json(users.map(sanitizeUser));
}));

router.delete('/delete/:id', requireAdmin, asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid user id' });

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return sendNotFound(res, 'User not found');

    return res.json({ message: 'User deleted successfully', user: sanitizeUser(user) });
}));

router.put('/update/:id', requireOwner, asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid user id' });

    const { errors, payload } = await buildUserPayload(req.body, { partial: true });
    if (Object.keys(errors).length) return validationError(res, errors);

    if (payload.email) {
        const existingUser = await User.findOne({ email: payload.email, _id: { $ne: req.params.id } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email is already registered' });
        }
    }

    const user = await User.findByIdAndUpdate(req.params.id, payload, {
        new: true,
        runValidators: true
    });

    if (!user) return sendNotFound(res, 'User not found');
    return res.json(withAuthToken(user));
}));

const authenticate = asyncHandler(async (req, res) => {
    const errors = {};
    const email = validateEmail(req.body.email, errors);
    const password = cleanString(req.body.password);

    if (!password) errors.password = 'Password is required';
    if (Object.keys(errors).length) return validationError(res, errors);

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await verifyPassword(password, user.password))) {
        return res.status(401).json({ message: 'Login failed' });
    }

    if (needsPasswordRehash(user.password)) {
        user.password = await hashPassword(password);
        await user.save();
    }

    return res.json(withAuthToken(user));
});

router.post('/authenticate', authenticate);
router.post('/authenicate', authenticate);

module.exports = router;
