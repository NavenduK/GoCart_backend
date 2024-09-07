"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTotals = exports.removeProduct = exports.addProduct = exports.decrementQuantity = exports.incrementQuantity = exports.showCart = void 0;
const mongoose_1 = require("mongoose");
const node_cache_1 = __importDefault(require("node-cache"));
const productModel_1 = __importDefault(require("../models/productModel"));
const cartModel_1 = __importDefault(require("../models/cartModel"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const appError_1 = __importDefault(require("../utils/appError"));
const mongoose_2 = __importDefault(require("mongoose"));
const cache = new node_cache_1.default();
exports.showCart = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Get user id from request
    const userId = new mongoose_2.default.Types.ObjectId(req.user._id);
    // let cart: ICart | undefined | null;
    // if (cache.has('cart')) {
    //   cart = cache.get('cart');
    // } else {
    //   cart = await Cart.findOne({ user: userId });
    //   cache.set('cart', cart?.toObject());
    // }
    const cart = yield cartModel_1.default.findOne({ user: userId });
    console.log(cart, 'this is cart');
    if (!cart || !(cart === null || cart === void 0 ? void 0 : cart.items.length) || cart === null) {
        res.status(400).json({
            status: 'false',
            message: 'No cart item found',
        });
    }
    // 3) Send success response
    res.status(200).json({
        status: 'success',
        message: 'Your cart',
        cart,
    });
}));
exports.incrementQuantity = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.params.productId;
    const incrementOperation = (cart, index) => {
        cart.items[index].quantity += 1;
    };
    yield updateCartQuantity(req, res, next, productId, incrementOperation, 'increment');
}));
exports.decrementQuantity = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.params.productId;
    const decrementOperation = (cart, index, productId) => {
        if (cart.items[index].quantity === 1) {
            cart.items = cart.items.filter((item) => !item.product.equals(productId));
        }
        else {
            cart.items[index].quantity -= 1;
        }
    };
    yield updateCartQuantity(req, res, next, productId, decrementOperation, 'decrement');
}));
exports.addProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const productId = req.params.productId;
    let cart = yield cartModel_1.default.findOne({ user: userId });
    if (!cart) {
        cart = yield cartModel_1.default.create({ user: userId });
        cart.populate({
            path: 'items.product',
            select: 'title price category.name images',
        });
    }
    const updatedCart = yield updateCart(cart, productId, true, next);
    res.status(201).json({
        status: 'success',
        message: 'Product added to cart',
        cart: updatedCart,
    });
}));
exports.removeProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const productId = req.params.productId;
    let cart = yield cartModel_1.default.findOne({ user: userId });
    if (!cart || !(cart === null || cart === void 0 ? void 0 : cart.items.length)) {
        return next(new appError_1.default('There are no items in your cart', 404));
    }
    const updatedCart = yield updateCart(cart, productId, false, next);
    res.status(200).json({
        status: 'success',
        message: 'Item successfully removed',
        cart: updatedCart,
    });
}));
// ########################
// ##### UTILS #####
// ########################
function getProductPrice(productId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const product = yield productModel_1.default.findById(productId);
            if (!product) {
                throw new Error('Product not found');
            }
            return product.price;
        }
        catch (error) {
            console.error('Error fetching product details:', error);
            return 0;
        }
    });
}
// Calculate totals based on cart items
function calculateTotals(cart) {
    return __awaiter(this, void 0, void 0, function* () {
        cart.total.totalItems = cart.items.length;
        cart.total.subtotal = 0;
        // Loop through cart items and calculate subtotal by fetching prices from the database
        for (const item of cart.items) {
            const productPrice = yield getProductPrice(item.product);
            cart.total.subtotal += item.quantity * productPrice;
        }
        // Update taxes and totalQuantity
        const taxRate = 0.1;
        cart.total.taxes = +(cart.total.subtotal * taxRate).toFixed(2);
        cart.total.totalQuantity = cart.items.reduce((acc, curr) => {
            return acc + curr.quantity;
        }, 0);
    });
}
exports.calculateTotals = calculateTotals;
const updateCartQuantity = (req, res, next, productId, updateOperation, operationType) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const cart = yield cartModel_1.default.findOne({ user: userId });
    if (!cart || !cart.items.length) {
        return next(new appError_1.default('There are no items in your cart', 404));
    }
    const existingItemIndex = cart.items.findIndex((item) => item.product.equals(productId));
    if (existingItemIndex !== -1) {
        yield updateOperation(cart, existingItemIndex, productId);
    }
    else {
        return next(new appError_1.default('The product is not in your cart', 404));
    }
    yield calculateTotals(cart);
    yield cart.save();
    // cache.set('cart', cart.toObject());
    res.status(200).json({
        status: 'success',
        message: operationType === 'increment'
            ? 'Product quantity incremented'
            : 'Product quantity decremented',
        cart,
    });
});
// ########################
const updateCart = (cart, productId, adding, next) => __awaiter(void 0, void 0, void 0, function* () {
    const existingItemIndex = cart.items.findIndex((item) => item.product.equals(productId));
    if (adding) {
        if (existingItemIndex !== -1) {
            cart.items[existingItemIndex].quantity += 1;
        }
        else {
            const newProduct = new mongoose_1.Types.ObjectId(productId);
            cart.items.push({ product: newProduct, quantity: 1 });
        }
    }
    else {
        if (existingItemIndex === -1) {
            return next(new appError_1.default('Product not found in your cart', 404));
        }
        cart.items = cart.items.filter((item) => !item.product.equals(productId));
    }
    yield calculateTotals(cart);
    yield cart.save();
    // const cachedCart = await cart.populate({
    //   path: 'items.product',
    //   select: 'title price category.name images',
    // });
    // cache.set('cart', cachedCart.toObject());
    return cart;
});
