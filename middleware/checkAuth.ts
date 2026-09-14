import jwt from "jsonwebtoken";
import { DbConnection } from "@/database/connection";
import User from "@/database/schemas/user.schema";

export async function getAuthUser(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    await DbConnection();
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return null;

    (req as any).user = user;

    return user;
  } catch {
    return null;
  }
}