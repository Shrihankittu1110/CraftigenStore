const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const {
    asyncHandler,
    assertRequiredString,
    cleanString,
    isAdminRequest,
    isValidId,
    requireAuth,
    requireAdmin,
    sendNotFound,
    validationError
} = require('./helpers');

const allowedTrackingStatuses = [
    'Order received',
    'Payment confirmed',
    'Packed by store',
    'Handed to courier',
    'Out for delivery',
    'Delivered',
    'Cancelled'
];

const allowedOrderStatuses = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const allowedPaymentStatuses = ['Pending', 'Paid', 'Failed', 'Refunded'];
const MIN_ITEM_PRICE = 0;
const MAX_ITEM_PRICE = 100000;

const buildOrderItems = async (items, errors) => {
    if (!Array.isArray(items) || !items.length) {
        errors.items = 'Order must include at least one item';
        return [];
    }

    const normalizedItems = [];

    for (const item of items) {
        const productId = cleanString(item.productId || item.id || item._id);
        const quantity = Number(item.quantity);
        const name = assertRequiredString(item, 'name', errors, { min: 2, max: 120, label: 'Item name' });
        const image = cleanString(item.image);
        const price = Number(item.price);

        if (!Number.isInteger(quantity) || quantity < 1) {
            errors.items = 'Each item must include a valid quantity';
            continue;
        }

        if (!Number.isFinite(price) || price < MIN_ITEM_PRICE || price > MAX_ITEM_PRICE) {
            errors.items = 'Each item must include a valid price';
            continue;
        }

        if (productId && isValidId(productId)) {
            const product = await Product.findById(productId);
            if (!product) {
                errors.items = 'One or more products are no longer available';
                continue;
            }

            normalizedItems.push({
                productId: product._id,
                name: product.title || product.name,
                image: product.image,
                price: product.price,
                quantity
            });
        } else {
            normalizedItems.push({
                name,
                image,
                price,
                quantity
            });
        }
    }

    return normalizedItems;
};

const buildOrderPayload = async (req) => {
    const errors = {};
    const userId = String(req.authUser?._id || req.authUser?.id || '');
    const email = cleanString(req.authUser?.email).toLowerCase();

    if (!userId || !isValidId(userId)) errors.user = 'Login is required to place an order';

    const items = await buildOrderItems(req.body.items, errors);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal > 0 && subtotal < 999 ? 79 : 0;

    const payload = {
        userId,
        customer: {
            name: assertRequiredString(req.body.customer || {}, 'name', errors, { min: 2, max: 80, label: 'Customer name' }),
            email,
            phone: assertRequiredString(req.body.customer || {}, 'phone', errors, { min: 8, max: 20, label: 'Phone' })
        },
        shippingAddress: {
            address: assertRequiredString(req.body.shippingAddress || {}, 'address', errors, { min: 8, max: 240, label: 'Address' }),
            city: assertRequiredString(req.body.shippingAddress || {}, 'city', errors, { min: 2, max: 80, label: 'City' }),
            state: assertRequiredString(req.body.shippingAddress || {}, 'state', errors, { min: 2, max: 80, label: 'State' }),
            pincode: assertRequiredString(req.body.shippingAddress || {}, 'pincode', errors, { min: 4, max: 12, label: 'Pincode' })
        },
        items,
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        paymentMethod: cleanString(req.body.paymentMethod) || 'Cash on Delivery',
        paymentStatus: 'Pending',
        orderStatus: 'Placed',
        tracking: {
            status: 'Order received'
        }
    };

    return { errors, payload };
};

router.post('/create', requireAuth, asyncHandler(async (req, res) => {
    const { errors, payload } = await buildOrderPayload(req);
    if (Object.keys(errors).length) return validationError(res, errors);

    const order = await Order.create(payload);
    return res.status(201).json(order);
}));

router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
    const userId = String(req.authUser?._id || req.authUser?.id || '');

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return res.json(orders);
}));

router.put('/cancel/:id', requireAuth, asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid order id' });

    const userId = String(req.authUser?._id || req.authUser?.id || '');
    const order = await Order.findById(req.params.id);

    if (!order) return sendNotFound(res, 'Order not found');

    const isOwner = userId && String(userId) === String(order.userId);
    if (!isOwner && !isAdminRequest(req)) return res.status(403).json({ message: 'You can cancel only your own orders' });

    if (order.orderStatus === 'Cancelled') {
        return res.status(400).json({ message: 'Order is already cancelled' });
    }

    order.orderStatus = 'Cancelled';
    order.tracking.status = 'Cancelled';
    if (order.paymentStatus === 'Paid') {
        order.paymentStatus = 'Refunded';
    }

    await order.save();
    return res.json(order);
}));

router.get('/getall', requireAdmin, asyncHandler(async (req, res) => {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return res.json(orders);
}));

router.get('/getid/:id', requireAuth, asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid order id' });

    const order = await Order.findById(req.params.id);
    if (!order) return sendNotFound(res, 'Order not found');

    const userId = String(req.authUser?._id || req.authUser?.id || '');
    const isOwner = userId && String(userId) === String(order.userId);
    if (!isOwner && !isAdminRequest(req)) return res.status(403).json({ message: 'You can view only your own orders' });

    return res.json(order);
}));

router.put('/tracking/:id', requireAdmin, asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid order id' });

    const errors = {};
    const trackingStatus = cleanString(req.body.trackingStatus || req.body.status);
    const orderStatus = cleanString(req.body.orderStatus);
    const paymentStatus = cleanString(req.body.paymentStatus);
    const updates = {};

    if (trackingStatus) {
        if (!allowedTrackingStatuses.includes(trackingStatus)) {
            errors.trackingStatus = 'Invalid tracking status';
        } else {
            updates['tracking.status'] = trackingStatus;
        }
    }

    if (orderStatus) {
        if (!allowedOrderStatuses.includes(orderStatus)) {
            errors.orderStatus = 'Invalid order status';
        } else {
            updates.orderStatus = orderStatus;
        }
    }

    if (paymentStatus) {
        if (!allowedPaymentStatuses.includes(paymentStatus)) {
            errors.paymentStatus = 'Invalid payment status';
        } else {
            updates.paymentStatus = paymentStatus;
        }
    }

    ['courier', 'trackingId', 'estimatedDelivery', 'note'].forEach((field) => {
        if (req.body[field] !== undefined) updates[`tracking.${field}`] = cleanString(req.body[field]);
    });

    if (Object.keys(errors).length) return validationError(res, errors);
    if (!Object.keys(updates).length) return res.status(400).json({ message: 'No updates provided' });

    const order = await Order.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true
    });

    if (!order) return sendNotFound(res, 'Order not found');
    return res.json(order);
}));

module.exports = router;
