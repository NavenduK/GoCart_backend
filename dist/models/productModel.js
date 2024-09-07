"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const slugify_1 = __importDefault(require("slugify"));
const categorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
const productSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    slug: String,
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        required: true,
    },
    category: {
        type: categorySchema,
        required: true,
    },
    featured: {
        type: Boolean,
        required: true,
        default: false,
    },
    recommended: {
        type: Boolean,
        required: true,
        default: false,
    },
}, {
    timestamps: true,
});
productSchema.pre('save', function (next) {
    this.slug = (0, slugify_1.default)(this.name, { lower: true });
    next();
});
const Product = (0, mongoose_1.model)('Product', productSchema);
exports.default = Product;
