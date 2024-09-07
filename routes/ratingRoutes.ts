import express from 'express';
import { getAllRatings, rateProduct } from '../controllers/ratingController';
import { protect } from '../controllers/authController';
const router = express.Router();

router.use(protect);

router.route('/:id').get(getAllRatings);

router.route('/:id').post(rateProduct);

export default router;
