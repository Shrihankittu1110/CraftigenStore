const { model, Schema } = require('mongoose');

const myschema = new Schema({
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
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = model('contact', myschema);
