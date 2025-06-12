const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        trim: true,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }

    next();
});

userSchema.methods.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema); 