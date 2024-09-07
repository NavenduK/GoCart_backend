"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
router.use(authController_1.protect);
router.patch('/update-me', userController_1.uploadUserPhoto, userController_1.resizeUserPhoto, userController_1.updateMe);
router.patch('/update-my-password', userController_1.updatePassword);
exports.default = router;
