"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const checkoutRoutes_1 = __importDefault(require("./routes/checkoutRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const ratingRoutes_1 = __importDefault(require("./routes/ratingRoutes"));
const errorController_1 = __importDefault(require("./controllers/errorController"));
const app = (0, express_1.default)();
// 1) GLOBAL MIDDLEWARES
// Body parser, reading data from body into req.body
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Implement CORS
const allowedOrigin = process.env.CLIENT_DOMAIN;
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        callback(null, origin || '*'); // Dynamically set origin to the requesting origin or '*'
    },
    credentials: true, // Allow credentials for all origins
}));
// Serving static files
app.use(express_1.default.static(`${__dirname}/public`));
app.use('*/images', express_1.default.static('public/images'));
// // Set security HTTP headers
// app.use(helmet());
// // Development loggin
// if (process.env.NODE_ENV === 'development') {
// app.use(morgan('dev'));
// }
// Limit requests from same API
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   limit: 300,
//   message: 'Too many requests from this IP, please try again in 15 minutes!',
// });
// app.use('/api', limiter);
// Data sanitization against NoSQL query injection
// app.use(mongoSanitize());
// Prevent parameter pollution
// app.use(hpp());
// Compresses response data to optimize transmission for static assets
// app.use(compression());
// app.set('trust proxy', 1); // trust first proxy
// 2) ROUTES
// auth routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/user', userRoutes_1.default);
// products routes
app.use('/api/products', productRoutes_1.default);
// cart routes
app.use('/api/cart', cartRoutes_1.default);
// order routes
app.use('/api/orders', orderRoutes_1.default);
// checkout routes
app.use('/api/checkout', checkoutRoutes_1.default);
app.use('/api/ratings', ratingRoutes_1.default);
app.use(errorController_1.default);
exports.default = app;
