"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ratingSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    rating: { type: Number },
    review: { type: String },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});
const Rating = (0, mongoose_1.model)('Rating', ratingSchema);
exports.default = Rating;
