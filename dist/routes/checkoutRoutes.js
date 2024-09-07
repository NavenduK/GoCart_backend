"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authController_1 = require("../controllers/authController");
const checkoutController_1 = require("../controllers/checkoutController");
router.use(authController_1.protect);
router.post('/', checkoutController_1.checkOut);
exports.default = router;
