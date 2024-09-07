import { Document } from 'mongoose';
import { Schema, model } from 'mongoose';

interface Rating extends Document {
  user: Schema.Types.ObjectId;
  product: Schema.Types.ObjectId;
  rating : number;
  review : string;
  createdAt: Date;
}

const ratingSchema = new Schema<Rating>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  rating : {type : Number},
  review : {type : String},
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Rating = model<Rating>('Rating', ratingSchema);

export default Rating;
