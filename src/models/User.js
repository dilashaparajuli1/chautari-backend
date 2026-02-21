import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true, enum: ['user', 'admin'], default: 'user' },
    member_since: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);

/** Shape for API: { id, email, name, role, memberSince } */
export function userToResponse(doc) {
  if (!doc) return null;
  const u = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(u._id),
    email: u.email,
    name: u.name,
    role: u.role,
    memberSince: u.member_since?.toISOString?.() ?? u.member_since,
  };
}
