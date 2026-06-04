const express = require('express');
const router = express.Router();
const Contact = require('../models/contactModel');
const {
    asyncHandler,
    assertRequiredString,
    cleanString,
    isValidId,
    sendNotFound,
    validateEmail,
    validationError
} = require('./helpers');

const buildContactPayload = (body, options = {}) => {
    const errors = {};
    const payload = {};

    if (!options.partial || body.name !== undefined) {
        payload.name = assertRequiredString(body, 'name', errors, { max: 80 });
    }

    if (!options.partial || body.email !== undefined) {
        payload.email = validateEmail(body.email, errors);
    }

    if (!options.partial || body.message !== undefined) {
        payload.message = assertRequiredString(body, 'message', errors, { min: 5, max: 2000 });
    }

    return { errors, payload };
};

router.post('/add', asyncHandler(async (req, res) => {
    const { errors, payload } = buildContactPayload(req.body);
    if (Object.keys(errors).length) return validationError(res, errors);

    const contact = await Contact.create(payload);
    return res.json(contact);
}));

router.get('/getall', asyncHandler(async (req, res) => {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    return res.json(contacts);
}));

router.get('/getid/:id', asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid contact id' });

    const contact = await Contact.findById(req.params.id);
    if (!contact) return sendNotFound(res, 'Contact message not found');

    return res.json(contact);
}));

router.get('/getbyfirstName/:firstName', asyncHandler(async (req, res) => {
    const name = cleanString(req.params.firstName);
    const contacts = await Contact.find({ name: new RegExp(name, 'i') });
    return res.json(contacts);
}));

router.delete('/delete/:id', asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid contact id' });

    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return sendNotFound(res, 'Contact message not found');

    return res.json({ message: 'Contact message deleted successfully', contact });
}));

router.put('/update/:id', asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid contact id' });

    const { errors, payload } = buildContactPayload(req.body, { partial: true });
    if (Object.keys(errors).length) return validationError(res, errors);

    const contact = await Contact.findByIdAndUpdate(req.params.id, payload, {
        new: true,
        runValidators: true
    });

    if (!contact) return sendNotFound(res, 'Contact message not found');
    return res.json(contact);
}));

module.exports = router;
