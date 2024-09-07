import express from 'express';
const router = express.Router();

import { protect } from '../controllers/authController';
import {
  checkOut
} from '../controllers/checkoutController';

router.use(protect);

router.post('/', checkOut);

export default router;
