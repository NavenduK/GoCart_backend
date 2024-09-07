"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authController_1 = require("../controllers/authController");
const cartController_1 = require("../controllers/cartController");
router.use(authController_1.protect);
router.get('/', cartController_1.showCart);
router.patch('/add-item/:productId', cartController_1.addProduct);
router.delete('/remove-item/:productId', cartController_1.removeProduct);
router.patch('/increase-quantity/:productId', cartController_1.incrementQuantity);
router.patch('/decrease-quantity/:productId', cartController_1.decrementQuantity);
exports.default = router;
