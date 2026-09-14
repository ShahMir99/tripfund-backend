import { DbConnection } from "@/database/connection";
import User from "@/database/schemas/user.schema";
import { fail, ok } from "@/libs/response";
import { getAuthUser } from "@/middleware/checkAuth";

export async function GET(req : Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return fail("Unauthorized", 401);

    await DbConnection();

    const user = await User.findById(authUser.id).populate(
      "circles",
      "name goalAmount currency durationMonths"
    );
    if (!user) return fail("User not found", 404);

    return ok(user);
  } catch (err : any) {
    console.log("error while fetching logged in user detail", err)
    return fail(err.message, 500);
  }
}