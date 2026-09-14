import { DbConnection } from "@/database/connection";
import Transaction from "@/database/schemas/transaction.schema";
import { getAuthUser } from "@/middleware/checkAuth";
import { fail, ok } from "@/libs/response";

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return fail("Unauthorized", 401);

    await DbConnection();
    const { circleId, amount, type, method, screenshotUrl, note } =
      await req.json();

    if (!circleId || !amount || !method) {
      return fail("circleId, amount and method are required");
    }

    const transaction = await Transaction.create({
      circle: circleId,
      user: authUser.id,
      amount,
      type,
      method,
      screenshotUrl,
      note,
    });

    return ok(transaction, 201);
  } catch (err: any) {
    console.log("Error while creating transaction", err);
    return fail(err.message, 500);
  }
}

// GET /api/transactions?circleId=...&userId=... (userId optional filter)
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return fail("Unauthorized", 401);

    await DbConnection();
    const { searchParams } = new URL(req.url);
    const circleId = searchParams.get("circleId");
    const userId = searchParams.get("userId");

    if (!circleId) return fail("circleId query param is required");

    const filter: Record<string, string> = { circle: circleId };
    if (userId) filter.user = userId;

    const transactions = await Transaction.find(filter)
      .populate("user", "name username avatar")
      .sort({ createdAt: -1 });

    return ok(transactions);
  } catch (err: any) {
    console.log("Error while fetching transactions", err);
    return fail(err.message, 500);
  }
}