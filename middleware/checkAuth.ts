import jwt from "jsonwebtoken";
import { DbConnection } from "@/database/connection";
import User from "@/database/schemas/user.schema";

export async function getAuthUser(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    console.log("[getAuthUser] No Bearer token on request");
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    console.log("[getAuthUser] Token verified, decoded id:", decoded.id);

    await DbConnection();
    console.log("[getAuthUser] DB connected, looking up user...");

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("[getAuthUser] No user found for id:", decoded.id);
      return null;
    }

    console.log("[getAuthUser] User found:", user._id.toString());

    (req as any).user = user;
    return user;
  } catch (err: any) {
    console.log("[getAuthUser] FAILED:", err?.name, "-", err?.message);
    return null;
  }
}