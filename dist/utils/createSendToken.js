"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const signToken_1 = __importDefault(require("./signToken"));
const createSendToken = (user, statusCode, res) => {
    const token = (0, signToken_1.default)(user._id);
    const jwtCookieExpiresInString = process.env.JWT_COOKIE_EXPIRES_IN;
    if (jwtCookieExpiresInString && !isNaN(Number(jwtCookieExpiresInString))) {
        const JWT_COOKIE_EXPIRES_IN = Number(jwtCookieExpiresInString);
        const cookieOptions = {
            expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
            httpOnly: true,
            sameSite: 'none',
            secure: false,
        };
        if (process.env.NODE_ENV === 'production') {
            cookieOptions.secure = true;
        }
        res.cookie('jwt', token, cookieOptions);
    }
    else {
        console.error('JWT_COOKIE_EXPIRES_IN is missing or not a valid date');
    }
    // Remove password from output
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};
exports.default = createSendToken;
