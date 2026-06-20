const { model, Schema } = require('mongoose');

const myschema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
    },
    title: {
        type: String,
        trim: true,
        maxlength: 120
    },
    category: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    price: {
        type: Number,
        required: true,
        min: 50,
        max: 100000
    },
    description: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: ''
    },
    material: {
        type: String,
        trim: true,
        maxlength: 120,
        default: ''
    },
    colour: {
        type: String,
        trim: true,
        maxlength: 120,
        default: ''
    },
    dimensions: {
        type: String,
        trim: true,
        maxlength: 120,
        default: ''
    },
    weight: {
        type: String,
        trim: true,
        maxlength: 120,
        default: ''
    },
    brand: {
        type: String,
        trim: true,
        maxlength: 120,
        default: 'Craftigen'
    },
    image: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = model('product', myschema);
