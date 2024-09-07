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
exports.resetPassword = exports.forgotPassword = exports.isAuthenticated = exports.protect = exports.logout = exports.login = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const authModel_1 = __importDefault(require("../models/authModel"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const appError_1 = __importDefault(require("../utils/appError"));
const createSendToken_1 = __importDefault(require("../utils/createSendToken"));
const emailSender_1 = __importDefault(require("../utils/emailSender"));
exports.signup = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('called');
    // 1) get user details from request body
    const { name, email, password, passwordConfirm } = req.body;
    console.log(req.body);
    // 2) Creating a new user in the database
    const newUser = yield authModel_1.default.create({
        name,
        email,
        password,
        passwordConfirm,
    });
    // 3) Send token to client
    (0, createSendToken_1.default)(newUser, 201, res);
}));
exports.login = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // 1) Check if email and password are provided
    if (!email || !password) {
        return next(new appError_1.default('Please provide email and password!', 400));
    }
    // 2)  Check if user exists && password is correct
    const user = yield authModel_1.default.findOne({ email }).select('+password');
    if (!user || !(yield user.correctPassword(password, user.password))) {
        return next(new appError_1.default('Incorrect email or password', 401));
    }
    // 3) If everything ok, send token to client
    (0, createSendToken_1.default)(user, 200, res);
}));
const logout = (req, res) => {
    const options = {
        sameSite: 'none',
        secure: true,
    };
    res.clearCookie('jwt', options);
    res.status(200).json({
        status: 'success',
    });
};
exports.logout = logout;
exports.protect = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Getting token and check if it's there
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(new appError_1.default('You are not logged in! Please log in to get access.', 401));
    }
    // 2) Verification token
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    // 3) Check if user still exists
    const currentUser = yield authModel_1.default.findById(decoded.id);
    if (!currentUser) {
        return next(new appError_1.default('The user belonging to this token does no longer exist.', 404));
    }
    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new appError_1.default('User recently changed password! Please log in again.', 401));
    }
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
}));
exports.isAuthenticated = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Getting token and check if it's there
    let token = '';
    const jwtCookie = req.cookies.jwt;
    if (jwtCookie) {
        token = jwtCookie;
        // 2) Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // 3) Check if user still exists
        const currentUser = yield authModel_1.default.findById(decoded.id);
        if (!currentUser) {
            return next();
        }
        // 4) Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next();
        }
        // THERE IS A LOGGED IN USER
        return res.status(200).json({
            status: 'success',
            isAuthenticated: true,
            message: 'Authentication successful! User is currently logged in.',
            user: currentUser,
        });
    }
    res.status(401).json({
        status: 'fail',
        message: 'Authentication failed! Please log in to continue.',
        isAuthenticated: false,
    });
}));
exports.forgotPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Get user based on POSTed email
    const userEmail = req.body.email;
    const user = yield authModel_1.default.findOne({ email: userEmail });
    if (!user) {
        return next(new appError_1.default('There is no user with email address.', 404));
    }
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    yield user.save({ validateBeforeSave: false });
    // 3) Send it to user's email
    try {
        const resetURL = `${process.env.CLIENT_DOMAIN}/reset-password/${resetToken}`;
        yield new emailSender_1.default(user, resetURL).sendPasswordReset();
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email',
        });
    }
    catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        yield user.save({ validateBeforeSave: false });
        console.log(error);
        return next(new appError_1.default('There was an error sending the email. Try again later!', 500));
    }
}));
exports.resetPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Get user based on the token
    const token = req.params.token;
    const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
    const user = yield authModel_1.default.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new appError_1.default('Token is invalid or has expired', 400));
    }
    // 3) Update passwordChangedAt property for the user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    yield user.save();
    // 4) Log the user in, send JWT
    (0, createSendToken_1.default)(user, 200, res);
}));
