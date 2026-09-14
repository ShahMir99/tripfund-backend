import { customAlphabet } from "nanoid";
import Invite from "@/database/schemas/Invite.schema";
import Circle from "@/database/schemas/circle.schema";
import { ok, fail } from "@/libs/response";
import { getAuthUser } from "@/middleware/checkAuth";
import { DbConnection } from "@/database/connection";

const generateCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

export async function POST(req : Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return fail("Unauthorized", 401);

    await DbConnection();
    const { circleId } = await req.json();
    if (!circleId) return fail("circleId is required");

    const circle = await Circle.findById(circleId);
    if (!circle) return fail("Circle not found", 404);

    if (!circle.members.some((m : any) => m.toString() === authUser.id)) {
      return fail("Only circle members can invite others", 403);
    }

    const invite = await Invite.create({
      circle: circleId,
      invitedBy: authUser.id,
      code: generateCode(),
    });

    return ok(invite, 201);
  } catch (err : any) {
    console.log("Error while inviting the user", err)
    return fail(err.message, 500);
  }
}
