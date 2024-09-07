import { NextFunction, Request, Response } from 'express';
import Product from '../models/productModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import Rating from '../models/RatingModel';
import mongoose from 'mongoose';

export const getAllRatings = catchAsync(async (req, res, next) => {
    const prodcutId = new mongoose.Types.ObjectId(req.params.id);
    console.log(prodcutId)
  const ratings = await Rating.find({product : prodcutId})
  .populate({
    path: 'user',
    select: 'name profilePicture' // Adjust fields as needed
  });

  console.log(ratings)
  res.status(200).json({
    status: 'success',
    results: ratings.length,
    data: {
      ratings,
    },
  });
});

export const rateProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const productId = req.params.id;
    console.log(productId, req.body, userId)
    const {rating, review} = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return next(new AppError('There is no product with the given ID', 404));
    }


    const result = await Rating.create({
        user : userId,
        product: productId,
        rating : rating,
        review : review
    })

    res.status(200).json({
      status: 'success',
      data: {
        result,
      },
    });
  }
);
