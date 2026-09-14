import bcrypt from "bcryptjs";
import { ok, fail } from "@/libs/response";
import { getAuthUser } from "@/middleware/checkAuth";
import { DbConnection } from "@/database/connection";
import User from "@/database/schemas/user.schema";


export async function PATCH(req : Request, { params } : any) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return fail("Unauthorized", 401);

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
  } catch (err : any) {
    console.log("Error while updating the user", err)
    return fail(err.message, 500);
  }
}

export async function DELETE(req : Request, { params } : any) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return fail("Unauthorized", 401);

    const { id } = await params;
    await DbConnection();

    const user = await User.findByIdAndDelete(id);
    if (!user) return fail("User not found", 404);
    return ok({ message: "User deleted" });
  } catch (err : any) {
    console.log("Error while deleting the user", err)
    return fail(err.message, 500);
  }
}
