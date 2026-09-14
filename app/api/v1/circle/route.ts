// Create a new Circle. The creator picks any name they like, as long as

import { DbConnection } from "@/database/connection";
import Circle from "@/database/schemas/circle.schema";
import User from "@/database/schemas/user.schema";
import { fail, ok } from "@/libs/response";
import { getAuthUser } from "@/middleware/checkAuth";

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return fail("Unauthorized", 401);

    await DbConnection();
    const { name, goalAmount, durationMonths, currency } = await req.json();
    if (!name) return fail("name is required");

    const existing = await Circle.findOne({ name });
    if (existing) return fail("That name is already taken, try another", 409);

    const circle = await Circle.create({
      name,
      goalAmount,
      durationMonths,
      currency,
      createdBy: authUser.id,
      members: [authUser.id],
    });

    await User.findByIdAndUpdate(authUser.id, {
      $addToSet: { circles: circle._id },
    });

    return ok(circle, 201);
  } catch (err: any) {
    console.log("Error while creating a new Saving circle", err);
    return fail(err.message, 500);
  }
}
