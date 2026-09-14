import mongoose from "mongoose";

enum UserRole{
  user = 'user',
  admin = 'admin'
}

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: "" },
    role : {
      type : String,
      default : UserRole.user
    },
    circles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Circle" }],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
