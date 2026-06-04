const { model, Schema } = require('mongoose');

const orderItemSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'product'
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
    },
    image: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
}, {
    _id: false
});

const trackingSchema = new Schema({
    status: {
        type: String,
        enum: ['Order received', 'Payment confirmed', 'Packed by store', 'Handed to courier', 'Out for delivery', 'Delivered', 'Cancelled'],
        default: 'Order received'
    },
    courier: {
        type: String,
        trim: true,
        maxlength: 80,
        default: ''
    },
    trackingId: {
        type: String,
        trim: true,
        maxlength: 80,
        default: ''
    },
    estimatedDelivery: {
        type: String,
        trim: true,
        maxlength: 80,
        default: ''
    },
    note: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ''
    }
}, {
    _id: false
});

const orderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true
    },
    customer: {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20
        }
    },
    shippingAddress: {
        address: {
            type: String,
            required: true,
            trim: true,
            maxlength: 240
        },
        city: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80
        },
        state: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80
        },
        pincode: {
            type: String,
            required: true,
            trim: true,
            maxlength: 12
        }
    },
    items: {
        type: [orderItemSchema],
        validate: {
            validator: (items) => Array.isArray(items) && items.length > 0,
            message: 'Order must include at least one item'
        }
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    deliveryFee: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['Cash on Delivery', 'UPI', 'Card'],
        default: 'Cash on Delivery'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending',
        index: true
    },
    orderStatus: {
        type: String,
        enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Placed',
        index: true
    },
    tracking: {
        type: trackingSchema,
        default: () => ({})
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = model('order', orderSchema);
