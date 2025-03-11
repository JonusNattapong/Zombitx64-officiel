import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
  password?: string;
  role: string;
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  twoFactorSecret?: string;
  recoveryCodes?: string;
  twoFactorEnabled: boolean;
  reputation: number;
}

const UserSchema: Schema = new Schema({
  name: { type: String },
  email: { type: String, unique: true, sparse: true },
  emailVerified: { type: Date },
  image: { type: String },
  password: { type: String },
  role: { type: String, default: 'user' },
  walletAddress: { type: String, unique: true, sparse: true },
  twoFactorSecret: { type: String },
  recoveryCodes: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  reputation: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
