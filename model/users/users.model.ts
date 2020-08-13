import { Schema, model } from 'mongoose';
import { sign } from 'jsonwebtoken';
import { Ipayload } from '../../middlewares/verifytoken/verifytoken';

const usersSchema = new Schema({
  name: String,
  password: String,
  image: String,
  email: { index: { unique: true }, type: String, lowercase: true, trim: true },
  gander: { type: String, enum: ['male', 'female'] },
  isPublic: { type: Boolean, default: false },
  friends: [{ type: Schema.Types.ObjectId, ref: 'Friend' }]
}, { timestamps: true });

usersSchema.methods.generateToken = function () {
  const token: Ipayload = sign({
    _id: this._id,
    name: this.name,
    email: this.email,
  }, process.env.SECREC_KEY);
  return token;
};

export const User = model('User', usersSchema);
