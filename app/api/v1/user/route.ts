import bcrypt from "bcryptjs";
import {DbConnection} from "@/database/connection"
import User from "@/database/schemas/user.schema"
import {fail, ok} from "@/libs/response"

import "@/database/schemas";


export async function POST(req : Request) {
  try {
    await DbConnection();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return fail("name, username, email and password are required");
    }

    const existing = await User.findOne({ $or: [{ email }] });
    if (existing) return fail("Email or username is already taken", 409);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const { password: _pw, ...userData } = user.toObject();
    return ok(userData, 201);
  } catch (err : any) {
    console.log("Error while registering user")
    return fail(err.message, 500);
  }
}

export async function GET(req : Request) {
  try {

    await DbConnection();
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (username) {
      const user = await User.findOne({ username }).populate(
        "circles",
        "name goalAmount currency"
      );
      if (!user) return fail("User not found", 404);
      return ok(user);
    }

    const users = await User.find().select("-password");
    return ok(users);
  } catch (err : any) {
    console.log("Error while getting user profile")
    return fail(err.message, 500);
  }
}
