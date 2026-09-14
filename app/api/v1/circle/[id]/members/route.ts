import { DbConnection } from "@/database/connection";
import Circle from "@/database/schemas/circle.schema";
import Transaction from "@/database/schemas/transaction.schema";
import { getAuthUser } from "@/middleware/checkAuth";
import { fail, ok } from "@/libs/response";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return fail("Unauthorized", 401);

    const { id } = await params;
    await DbConnection();

    const circle = await Circle.findById(id).populate(
      "members",
      "name username avatar"
    );
    if (!circle) return fail("Circle not found", 404);

    const memberTotals = await Transaction.aggregate([
      { $match: { circle: circle._id, status: { $ne: "rejected" } } },
      { $group: { _id: "$user", total: { $sum: "$amount" } } },
    ]);

    console.log("memberTotals", memberTotals)
    
    
    const totalsMap = Object.fromEntries(
      memberTotals.map((m: any) => [m._id.toString(), m.total])
    );

    console.log("totalsMap", totalsMap)

    const members = circle.members.map((m: any) => ({
      ...m.toObject(),
      totalContributed: totalsMap[m._id.toString()] || 0,
    }));

    console.log("members", members)


    return ok(members);
  } catch (err: any) {
    console.log("Error while fetching circle members", err);
    return fail(err.message, 500);
  }
}