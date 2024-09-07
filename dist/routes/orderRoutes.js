"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authController_1 = require("../controllers/authController");
const orderController_1 = require("../controllers/orderController");
router.use(authController_1.protect);
router.get('/', orderController_1.getOrders);
router.get('/:orderID', orderController_1.getSingleOrder);
exports.default = router;
