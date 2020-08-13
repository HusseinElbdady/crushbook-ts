import { Schema, model } from 'mongoose';
import { sign } from 'jsonwebtoken';
import { hash, compare, genSalt } from 'bcryptjs';

import { Ipayload } from '../../middlewares/verifytoken/verifytoken';

export interface IUser {
  name: string;
  password: string;
  image: string;
  email: string;
  gander: string;
  isPublic: boolean;
  friends: string;
  encryptPassword(password: string): Promise<string>;
  validatePassword(password: string): Promise<string>;
  generateToken(): string;
}

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
  const token = sign({
    _id: this._id,
    name: this.name,
    email: this.email,
  }, 'crushbook');
  return token;
};

usersSchema.methods.encryptPassword = async function (password: string) {
  const salt = await genSalt(10)
  await hash(password.toString(), salt)
}

usersSchema.methods.validatePassword = async function (password: string) {
  await compare(password.toString(), this.password);
}

export const User = model('User', usersSchema);
