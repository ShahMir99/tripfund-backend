import { DbConnection } from "@/database/connection";
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

    const transaction = await Transaction.findById(id).populate(
      "user",
      "name username avatar"
    );
    if (!transaction) return fail("Transaction not found", 404);
    return ok(transaction);
  } catch (err: any) {
    console.log("Error while fetching transaction", err);
    return fail(err.message, 500);
  }
}

// Mainly for flipping status: pending -> confirmed/rejected, once someone
// checks the JazzCash screenshot.
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
    const transaction = await Transaction.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!transaction) return fail("Transaction not found", 404);
    return ok(transaction);
  } catch (err: any) {
    console.log("Error while updating transaction", err);
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

    const transaction = await Transaction.findByIdAndDelete(id);
    if (!transaction) return fail("Transaction not found", 404);
    return ok({ message: "Transaction deleted" });
  } catch (err: any) {
    console.log("Error while deleting transaction", err);
    return fail(err.message, 500);
  }
}