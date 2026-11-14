import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false }, // never returned by default
    role: { type: String, enum: ['customer', 'admin', 'superadmin'], default: 'customer' },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    phone: String,
    avatar: String,
    verifyTokenHash: { type: String, select: false },
    resetTokenHash: { type: String, select: false },
    resetExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

// Hash on save so no code path can accidentally store a plain-text password.
schema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});
schema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};
schema.set('toJSON', {
  transform: (_doc, ret) => {
    for (const k of ['password', 'verifyTokenHash', 'resetTokenHash', 'resetExpires', '__v'])
      delete ret[k];
    return ret;
  },
});

export const User = mongoose.model('User', schema);
