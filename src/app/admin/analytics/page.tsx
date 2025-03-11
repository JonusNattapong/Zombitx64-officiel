"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";

interface AnalyticsSummary {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  totalProducts: number;
  newProducts: number;
}

const fetchAnalytics = async (): Promise<AnalyticsSummary> => {
  const response = await fetch("/api/admin/analytics");
  if (!response.ok) {
    throw new Error("Failed to fetch analytics");
  }
  return response.json();
};

export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminAnalytics"],
    queryFn: fetchAnalytics,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Admin Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-2">Total Users</h2>
          <p className="text-4xl">{data?.totalUsers}</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-2">New Users (Last 7 Days)</h2>
          <p className="text-4xl">{data?.newUsers}</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-2">Active Users (Last 30 Days)</h2>
          <p className="text-4xl">{data?.activeUsers}</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-2">Total Products</h2>
          <p className="text-4xl">{data?.totalProducts}</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-2">New Products (Last 7 Days)</h2>
          <p className="text-4xl">{data?.newProducts}</p>
        </Card>
      </div>
    </div>
  );
}
