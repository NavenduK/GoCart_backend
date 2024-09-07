"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CartItemSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required'],
        index: true,
    },
    quantity: {
        type: Number,
        min: [1, 'Quantity cannot be less than 1.'],
        required: [true, 'Quantity is required and must be at least 1'],
    },
});
const CartSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true,
    },
    items: [CartItemSchema],
    total: {
        subtotal: {
            type: Number,
            default: 0,
        },
        taxes: {
            type: Number,
            default: 0,
        },
        totalQuantity: {
            type: Number,
            default: 0,
        },
        totalItems: {
            type: Number,
            default: 0,
        },
    },
});
CartSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'items.product',
        select: 'title price category.name images',
    }).populate({
        path: 'user',
        select: 'name email -_id',
    });
    next();
});
const Cart = (0, mongoose_1.model)('Cart', CartSchema);
exports.default = Cart;
