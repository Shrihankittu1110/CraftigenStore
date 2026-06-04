const { model, Schema } = require('mongoose');

const myschema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    avatar: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer',
        index: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = model('users', myschema);
