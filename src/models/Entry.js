import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true },
    chakra_id: { type: String, default: null },
  },
  { timestamps: true }
);

export const Entry = mongoose.model('Entry', entrySchema);

/** API shape: { id, body, chakraId, createdAt } + optional userName, userEmail */
export function entryToResponse(doc, userDoc = null) {
  if (!doc) return null;
  const e = doc.toObject ? doc.toObject() : doc;
  const out = {
    id: String(e._id),
    body: e.body,
    chakraId: e.chakra_id ?? null,
    createdAt: (e.createdAt || doc.createdAt)?.toISOString?.() || new Date().toISOString(),
  };
  if (userDoc) {
    const u = userDoc.toObject ? userDoc.toObject() : userDoc;
    out.userName = u.name;
    out.userEmail = u.email;
  }
  return out;
}
