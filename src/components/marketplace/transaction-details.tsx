"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TransactionDetailsProps {
  transaction: any;
}

export function TransactionDetails({ transaction }: TransactionDetailsProps) {
  const [status, setStatus] = useState(transaction.status);
  const router = useRouter();

  useEffect(() => {
    setStatus(transaction.status);
  }, [transaction.status]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Details</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Transaction ID: {transaction.id}</p>
        <p>Product: {transaction.product.title}</p>
        <p>Buyer: {transaction.buyer.name}</p>
        <p>Seller: {transaction.seller.name}</p>
        <p>Amount: {formatCurrency(transaction.totalAmount)}</p>
        <p>Status: {status}</p>
        <p>Transaction Hash: {transaction.transactionHash}</p>
      </CardContent>
    </Card>
  );
}
