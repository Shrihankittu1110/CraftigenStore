const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const {
    asyncHandler,
    assertRequiredString,
    cleanString,
    isValidId,
    requireAdmin,
    sendNotFound,
    validationError
} = require('./helpers');

const MIN_PRODUCT_PRICE = 50;
const MAX_PRODUCT_PRICE = 100000;

const escapeRegExp = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const buildProductPayload = (body, options = {}) => {
    const errors = {};
    const payload = {};

    if (!options.partial || body.name !== undefined) {
        payload.name = assertRequiredString(body, 'name', errors, { max: 120, label: 'Product name' });
    }

    if (body.title !== undefined) {
        payload.title = cleanString(body.title);
    }

    if (!options.partial || body.category !== undefined) {
        payload.category = assertRequiredString(body, 'category', errors, { max: 80 });
    }

    if (!options.partial || body.price !== undefined) {
        const price = Number(body.price);
        if (!Number.isFinite(price)) {
            errors.price = 'Price must be a valid number';
        } else if (price < MIN_PRODUCT_PRICE) {
            errors.price = `Price must be at least Rs ${MIN_PRODUCT_PRICE}`;
        } else if (price > MAX_PRODUCT_PRICE) {
            errors.price = `Price must be Rs ${MAX_PRODUCT_PRICE} or less`;
        } else {
            payload.price = price;
        }
    }

    const description = body.description !== undefined ? body.description : body.discription;
    if (!options.partial || description !== undefined) {
        payload.description = cleanString(description);
    }

    if (!options.partial || body.material !== undefined) {
        payload.material = cleanString(body.material);
    }

    if (!options.partial || body.colour !== undefined || body.color !== undefined) {
        payload.colour = cleanString(body.colour !== undefined ? body.colour : body.color);
    }

    ['dimensions', 'weight', 'brand'].forEach((field) => {
        if (!options.partial || body[field] !== undefined) {
            payload[field] = cleanString(body[field]);
        }
    });

    if (!options.partial || body.image !== undefined) {
        payload.image = cleanString(body.image);
    }

    return { errors, payload };
};

router.post('/add', requireAdmin, asyncHandler(async (req, res) => {
    const { errors, payload } = buildProductPayload(req.body);
    if (Object.keys(errors).length) return validationError(res, errors);

    const product = await Product.create(payload);
    return res.json(product);
}));

router.get('/getall', asyncHandler(async (req, res) => {
    const filter = {};
    const category = cleanString(req.query.category);
    const search = cleanString(req.query.search);
    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    const sortBy = cleanString(req.query.sortBy);

    if (category) filter.category = category;
    if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
        filter.price = {};
        if (Number.isFinite(minPrice)) filter.price.$gte = minPrice;
        if (Number.isFinite(maxPrice)) filter.price.$lte = maxPrice;
    }
    if (search) {
        const searchRegex = new RegExp(escapeRegExp(search), 'i');
        filter.$or = [
            { name: searchRegex },
            { title: searchRegex },
            { category: searchRegex },
            { material: searchRegex },
            { colour: searchRegex },
            { dimensions: searchRegex },
            { weight: searchRegex },
            { brand: searchRegex },
            { description: searchRegex }
        ];
    }

    const sort = {};
    if (sortBy === 'price-low') {
        sort.price = 1;
    } else if (sortBy === 'price-high') {
        sort.price = -1;
    } else if (sortBy === 'newest') {
        sort.createdAt = -1;
    } else {
        sort.createdAt = -1;
    }

    const products = await Product.find(filter).sort(sort);
    return res.json(products);
}));

router.get('/getid/:id', asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid product id' });

    const product = await Product.findById(req.params.id);
    if (!product) return sendNotFound(res, 'Product not found');

    return res.json(product);
}));

router.get('/getbytitle/:title', asyncHandler(async (req, res) => {
    const title = cleanString(req.params.title);
    const products = await Product.find({ title: new RegExp(`^${title}$`, 'i') });
    return res.json(products);
}));

router.delete('/delete/:id', requireAdmin, asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid product id' });

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return sendNotFound(res, 'Product not found');

    return res.json({ message: 'Product deleted successfully', product });
}));

router.put('/update/:id', requireAdmin, asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid product id' });

    const { errors, payload } = buildProductPayload(req.body, { partial: true });
    if (Object.keys(errors).length) return validationError(res, errors);

    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
        new: true,
        runValidators: true
    });

    if (!product) return sendNotFound(res, 'Product not found');
    return res.json(product);
}));

module.exports = router;
