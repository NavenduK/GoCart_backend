"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const orderSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [
        {
            product: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                validate: {
                    validator: (value) => value > 0,
                    message: 'Qunatity must be greater than 0',
                },
            },
            price: {
                type: Number,
                required: true,
                validate: {
                    validator: (value) => value >= 0,
                    message: 'Price must be greater than or equal to 0',
                },
            },
        },
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered'],
        default: 'pending',
    },
    paymentDetails: {
        paymentMethod: String,
    },
    paid: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});
orderSchema.pre(/^find/, function (next) {
    this.populate('user', 'name email').populate('items.product', 'title price category.name images');
    next();
});
const Order = (0, mongoose_1.model)('Order', orderSchema);
exports.default = Order;
