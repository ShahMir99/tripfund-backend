import bcrypt from "bcryptjs";
import { ok, fail } from "@/libs/response";
import { getAuthUser } from "@/middleware/checkAuth";
import { DbConnection } from "@/database/connection";
import User from "@/database/schemas/user.schema";

import jwt from "jsonwebtoken";

export async function PATCH(req: Request, { params }: any) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      console.log("[getAuthUser] No Bearer token on request");
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    console.log("[getAuthUser] Token verified, decoded id:", decoded.id);

    await DbConnection();
    console.log("[getAuthUser] DB connected, looking up user...");

    const checkUser = await User.findById(decoded.id).select("-password");

    console.log("checkUser", checkUser)

    // const authUser = await getAuthUser(req);

    // console.log("authUser", authUser);

    // if (!authUser) return fail("Unauthorized", 401);

    const { id } = await params;
    await DbConnection();

    const body = await req.json();
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }
    delete body.circles;

    const user = await User.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return fail("User not found", 404);
    return ok(user);
  } catch (err: any) {
    console.log("Error while updating the user", err);
    return fail(err.message, 500);
  }
}

export async function DELETE(req: Request, { params }: any) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return fail("Unauthorized", 401);

    const { id } = await params;
    await DbConnection();

    const user = await User.findByIdAndDelete(id);
    if (!user) return fail("User not found", 404);
    return ok({ message: "User deleted" });
  } catch (err: any) {
    console.log("Error while deleting the user", err);
    return fail(err.message, 500);
  }
}
