import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "@/database/schemas/user.schema";
import { DbConnection } from "@/database/connection";
import { fail, ok } from "@/libs/response";

import "@/database/schemas";

export async function POST(req: Request) {
  try {
    await DbConnection();
    const { email, password } = await req.json();

    if (!email || !password) return fail("email and password are required");

    const user = await User.findOne({ email })
      .select("+password")
      .populate("circles", "name goalAmount currency durationMonths");

    if (!user) return fail("Invalid credentials", 401);

    const match = await bcrypt.compare(password, user.password);
    if (!match) return fail("Invalid credentials", 401);

    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    const { password: _pw, ...userData } = user.toObject();
    return ok({ token, user: userData });
  } catch (err: any) {
    console.log("Error while logging in", err);
    return fail(err.message, 500);
  }
}