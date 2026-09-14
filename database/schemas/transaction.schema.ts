import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    circle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Circle",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ["deposit", "withdrawal"],
      default: "deposit",
    },
    method: {
      type: String,
      enum: ["jazzcash", "easypaisa", "sadapay", "bank"],
      required: true,
    },
    screenshotUrl: { type: String, default: "" },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);