import { CookieOptions, NextFunction, Request, Response } from 'express';
import Stripe from 'stripe';

import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import Cart from '../models/cartModel';
import Order from '../models/orderModel';

export const checkOut = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId });

    if (!cart || !cart.items || cart.items.length === 0) {
      return next(new AppError('Cart is empty or not found.', 404));
    }
        const orderItems = cart.items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          price: (item.product as any).price,
        }));

        // Calculate total amount based on cart subtotal ONLY
        const totalAmount = cart.total.subtotal;

        // Create new order
        const newOrder = await Order.create({
          user: userId,
          items: orderItems,
          totalAmount,
          status: 'processing',
          paymentDetails: {
            paymentMethod: 'stripe',
          },
        });

        await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

        res.status(200).json({
          status: 'success',
          message: 'Order successfully created.',
          order: newOrder,
        });
      } 
);
