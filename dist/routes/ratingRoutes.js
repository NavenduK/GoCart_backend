"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ratingController_1 = require("../controllers/ratingController");
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
router.use(authController_1.protect);
router.route('/:id').get(ratingController_1.getAllRatings);
router.route('/:id').post(ratingController_1.rateProduct);
exports.default = router;
