import mongoose from "mongoose";


const CircleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    goalAmount: { type: Number, default: 0 },
    durationMonths: { type: Number, default: 0 },
    currency: { type: String, default: "PKR" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.models.Circle || mongoose.model("Circle", CircleSchema);