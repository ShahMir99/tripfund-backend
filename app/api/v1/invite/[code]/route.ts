import { DbConnection } from "@/database/connection";
import Invite from "@/database/schemas/Invite.schema";
import Circle from "@/database/schemas/circle.schema";
import User from "@/database/schemas/user.schema";
import { getAuthUser } from "@/middleware/checkAuth";
import { fail, ok } from "@/libs/response";

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return fail("Unauthorized", 401);

    const { code } = await params;
    await DbConnection();

    const invite = await Invite.findOne({ code }).populate(
      "circle",
      "name goalAmount durationMonths currency"
    );
    if (!invite) return fail("Invalid invite code", 404);
    if (invite.status !== "pending" || invite.expiresAt < new Date()) {
      return fail("This invite has expired", 410);
    }

    return ok(invite);
  } catch (err: any) {
    console.log("Error while previewing invite", err);
    return fail(err.message, 500);
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return fail("Unauthorized", 401);

    const { code } = await params;
    await DbConnection();

    const invite = await Invite.findOne({ code });
    if (!invite) return fail("Invalid invite code", 404);
    if (invite.status !== "pending" || invite.expiresAt < new Date()) {
      return fail("This invite has expired", 410);
    }

    await Circle.findByIdAndUpdate(invite.circle, {
      $addToSet: { members: authUser.id },
    });
    await User.findByIdAndUpdate(authUser.id, {
      $addToSet: { circles: invite.circle },
    });

    invite.status = "accepted";
    await invite.save();

    const circle = await Circle.findById(invite.circle).populate(
      "members",
      "name username avatar"
    );
    return ok(circle);
  } catch (err: any) {
    console.log("Error while joining circle", err);
    return fail(err.message, 500);
  }
}