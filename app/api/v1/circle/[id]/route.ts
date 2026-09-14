import { DbConnection } from "@/database/connection";
import Circle from "@/database/schemas/circle.schema";
import "@/database/schemas/user.schema"; // registers User for .populate("members")
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

    const totals = await Transaction.aggregate([
      { $match: { circle: circle._id, status: { $ne: "rejected" } } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    const deposits = totals.find((t: any) => t._id === "deposit")?.total || 0;
    const withdrawals =
      totals.find((t: any) => t._id === "withdrawal")?.total || 0;

    return ok({
      circle,
      totalSaved: deposits - withdrawals,
      memberCount: circle.members.length,
    });
  } catch (err: any) {
    console.log("Error while fetching circle dashboard", err);
    return fail(err.message, 500);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return fail("Unauthorized", 401);

    const { id } = await params;
    await DbConnection();

    const body = await req.json();
    delete body.members; 

    const circle = await Circle.findByIdAndUpdate(id, body, { new: true });
    if (!circle) return fail("Circle not found", 404);
    return ok(circle);
  } catch (err: any) {
    console.log("Error while updating circle", err);
    return fail(err.message, 500);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return fail("Unauthorized", 401);

    const { id } = await params;
    await DbConnection();

    const circle = await Circle.findByIdAndDelete(id);
    if (!circle) return fail("Circle not found", 404);
    return ok({ message: "Circle deleted" });
  } catch (err: any) {
    console.log("Error while deleting circle", err);
    return fail(err.message, 500);
  }
}