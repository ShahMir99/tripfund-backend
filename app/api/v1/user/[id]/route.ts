import bcrypt from "bcryptjs";
import { ok, fail } from "@/libs/response";
import { DbConnection } from "@/database/connection";
import User from "@/database/schemas/user.schema";
import jwt from "jsonwebtoken";

export async function PATCH(req: Request, { params }: any) {
  try {
    // ---- inlined getAuthUser logic, for testing ----
    console.log("req.headers", req.headers)
    const authHeader = req.headers.get("authorization") || "";
    console.log("authHeader", authHeader)
    const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
    console.log("token", token)

    if (!token) {
      console.log("[inline-auth] No Bearer token on request");
      return fail("Unauthorized", 401);
    }

    let decoded: { id: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      console.log("[inline-auth] Token verified, decoded id:", decoded.id);
    } catch (err: any) {
      console.log("[inline-auth] jwt.verify FAILED:", err?.name, "-", err?.message);
      return fail("Unauthorized", 401);
    }

    await DbConnection();
    console.log("[inline-auth] DB connected, looking up user...");

    const checkUser = await User.findById(decoded.id).select("-password");
    console.log("[inline-auth] checkUser:", checkUser ? checkUser._id.toString() : null);

    if (!checkUser) {
      return fail("Unauthorized", 401);
    }
    // ---- end inlined logic ----

    const { id } = await params;

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