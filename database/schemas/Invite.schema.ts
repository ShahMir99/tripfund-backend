import mongoose from "mongoose";

const InviteSchema = new mongoose.Schema(
  {
    circle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Circle",
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

export default mongoose.models.Invite || mongoose.model("Invite", InviteSchema);