import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { TransactionDetails } from "@/components/marketplace/transaction-details";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect("/api/auth/signin?callbackUrl=/marketplace/transactions");
  }

  const transactions = await db.transaction.findMany({
    where: {
      OR: [
        { buyerId: session.user.id },
        { sellerId: session.user.id },
      ],
    },
    include: {
      buyer: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Transactions</h1>
      {transactions.length === 0 ? (
        <Alert>
          <AlertTitle>No Transactions</AlertTitle>
          <AlertDescription>You have no transactions yet.</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <TransactionDetails key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}
    </div>
  );
}
