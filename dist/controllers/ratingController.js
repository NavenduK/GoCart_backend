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
exports.rateProduct = exports.getAllRatings = void 0;
const productModel_1 = __importDefault(require("../models/productModel"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const appError_1 = __importDefault(require("../utils/appError"));
const RatingModel_1 = __importDefault(require("../models/RatingModel"));
const mongoose_1 = __importDefault(require("mongoose"));
exports.getAllRatings = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const prodcutId = new mongoose_1.default.Types.ObjectId(req.params.id);
    console.log(prodcutId);
    const ratings = yield RatingModel_1.default.find({ product: prodcutId })
        .populate({
        path: 'user',
        select: 'name profilePicture' // Adjust fields as needed
    });
    console.log(ratings);
    res.status(200).json({
        status: 'success',
        results: ratings.length,
        data: {
            ratings,
        },
    });
}));
exports.rateProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const productId = req.params.id;
    console.log(productId, req.body, userId);
    const { rating, review } = req.body;
    const product = yield productModel_1.default.findById(productId);
    if (!product) {
        return next(new appError_1.default('There is no product with the given ID', 404));
    }
    const result = yield RatingModel_1.default.create({
        user: userId,
        product: productId,
        rating: rating,
        review: review
    });
    res.status(200).json({
        status: 'success',
        data: {
            result,
        },
    });
}));
