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
exports.checkOut = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const appError_1 = __importDefault(require("../utils/appError"));
const cartModel_1 = __importDefault(require("../models/cartModel"));
const orderModel_1 = __importDefault(require("../models/orderModel"));
exports.checkOut = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const cart = yield cartModel_1.default.findOne({ user: userId });
    if (!cart || !cart.items || cart.items.length === 0) {
        return next(new appError_1.default('Cart is empty or not found.', 404));
    }
    const orderItems = cart.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.product.price,
    }));
    // Calculate total amount based on cart subtotal ONLY
    const totalAmount = cart.total.subtotal;
    // Create new order
    const newOrder = yield orderModel_1.default.create({
        user: userId,
        items: orderItems,
        totalAmount,
        status: 'processing',
        paymentDetails: {
            paymentMethod: 'stripe',
        },
    });
    yield cartModel_1.default.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
    res.status(200).json({
        status: 'success',
        message: 'Order successfully created.',
        order: newOrder,
    });
}));
