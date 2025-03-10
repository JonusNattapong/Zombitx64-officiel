import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IPasswordReset extends Document {
  token: string;
  expires: Date;
  userId: mongoose.Types.ObjectId;
  user: IUser['_id'];
  createdAt: Date;
  used: boolean;
}

const PasswordResetSchema: Schema = new Schema({
  token: { type: String, required: true, unique: true },
  expires: { type: Date, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

PasswordResetSchema.index({ userId: 1 });
PasswordResetSchema.index({ token: 1 });
PasswordResetSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.PasswordReset || mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema);
