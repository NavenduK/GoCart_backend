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
exports.updatePassword = exports.updateMe = exports.resizeUserPhoto = exports.uploadUserPhoto = void 0;
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const authModel_1 = __importDefault(require("../models/authModel"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const createSendToken_1 = __importDefault(require("../utils/createSendToken"));
const appError_1 = __importDefault(require("../utils/appError"));
// const multerStorage = multer.diskStorage({
//   destination: (req, res, cb) => {
//     cb(null, 'public/images/users');
//   },
//   filename: function (req, file, cb) {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer_1.default.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    }
    else {
        const error = new appError_1.default('Not an image! Please upload only images', 400);
        cb(error, false);
    }
};
const upload = (0, multer_1.default)({
    storage: multerStorage,
    fileFilter: multerFilter,
});
exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        return next();
    req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
    yield (0, sharp_1.default)(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/users/${req.file.filename}`);
    next();
}));
const filterObj = (obj, allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el))
            newObj[el] = obj[el];
    });
    return newObj;
};
exports.updateMe = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new appError_1.default('This route is not for password updates. Please use /updateMyPassword.', 400));
    }
    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const allowedFields = ['name', 'email', 'phone', 'country', 'photo'];
    const filteredBody = filterObj(req.body, allowedFields);
    if (req.file)
        filteredBody.photo = req.file.filename;
    // 3) Update user document
    const updatedUser = yield authModel_1.default.findByIdAndUpdate(req.user._id, filteredBody, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
}));
exports.updatePassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Get user from collection
    const user = yield authModel_1.default.findById(req.user._id).select('+password');
    // 2) Check if POSTed password is correct
    if (user &&
        !(yield user.correctPassword(req.body.currentPassword, user.password))) {
        return next(new appError_1.default('Your current password is wrong', 401));
    }
    // 3) Check if the new password isn't the same as the old one
    if (user &&
        (yield user.correctPassword(req.body.password, user.password))) {
        return next(new appError_1.default('The new password cannot be the same as the old password', 400));
    }
    // 4) If so, update password
    if (user) {
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        yield user.save();
        // 4) Log user in, send JWT
        (0, createSendToken_1.default)(user, 200, res);
    }
}));
