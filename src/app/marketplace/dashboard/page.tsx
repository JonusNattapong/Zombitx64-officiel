import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/marketplace/dashboard-stats";
import { DashboardChart } from "@/components/marketplace/dashboard-chart";
import { DashboardFilterTabs } from "@/components/marketplace/dashboard-filter-tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, ExternalLink, User2 } from "lucide-react";
import { Prisma } from "@prisma/client";

interface SearchParams {
  period?: string;
}

// Utility function to calculate start date based on period
function getStartDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case "week":
      return new Date(now.setDate(now.getDate() - 7));
    case "year":
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case "all":
      return new Date(0); // From the beginning
    case "month":
    default:
      return new Date(now.setMonth(now.getMonth() - 1));
  }
}

const MAX_ITEMS = 5;

export default async function SellerDashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect("/api/auth/signin?callbackUrl=/marketplace/dashboard");
  }

  // Calculate the time range for analysis
  const { period = "month" } = searchParams;
  const startDate = getStartDate(period);

  const productSelect = {
    id: true,
    title: true,
    description: true,
    price: true,
    category: true,
    ownerId: true,
    createdAt: true,
    dataset: {
      select: {
        id: true,
        title: true,
      },
    },
  } satisfies Prisma.ProductSelect;

  type ProductWithIncludes = Prisma.ProductGetPayload<{
    select: typeof productSelect;
  }>;

  const transactionSelect = {
    id: true,
    totalAmount: true,
    status: true,
    paymentMethod: true,
    transactionHash: true,
    reference: true,
    createdAt: true,
    updatedAt: true,
    buyer: {
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
        price: true,
      },
    },
    sellerId: true,
    productId: true,
    buyerId: true,
  } satisfies Prisma.TransactionSelect;


   type TransactionWithIncludes = Prisma.TransactionGetPayload<{
    select: typeof transactionSelect
  }>


 type TransactionWithIncludes = Prisma.TransactionGetPayload<{
  select: {
    id: true;
    totalAmount: true;
    status: true;
    paymentMethod: true;
    transactionHash: true;
    reference: true;
    createdAt: true;
    updatedAt: true;
    buyer: {
      select: {
        id: true;
        name: true;
        image: true;
      };
    };
    product: {
      select: {
        id: true;
        title: true;
        price: true;
      };
    };
    sellerId: true;
    productId: true;
    buyerId: true;
  };
}>;

  const [products, sales] = await Promise.all([
    db.product.findMany({
      where: {
        ownerId: session.user.id,
      },
      select: productSelect,
      orderBy: {
        createdAt: "desc",
      },
    }),
    db.transaction.findMany({
      where: {
        sellerId: session.user.id,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        paymentMethod: true,
        transactionHash: true,
        reference: true,
        createdAt: true,
        updatedAt: true,
        buyer: {
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
            price: true,
          },
        },
        sellerId: true,
        productId: true,
        buyerId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  // Calculate total revenue
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  // Calculate the number of sales per day/month for the chart
  type SalesByDate = {
    [key: string]: { date: string; sales: number; revenue: number };
  };

  const salesByDate: SalesByDate = sales.reduce(
    (acc: SalesByDate, sale: TransactionWithIncludes) => {
      const date = new Date(sale.createdAt);
      let key;

      if (period === "week" || period === "month") {
        key = date.toISOString().split("T")[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      }

      if (!acc[key]) {
        acc[key] = {
          date: key,
          sales: 0,
          revenue: 0,
        };
      }

      acc[key].sales += 1;
      acc[key].revenue += sale.totalAmount;

      return acc;
    },
    {} as SalesByDate
  );

  type ChartData = { date: string; sales: number; revenue: number };
  const chartData: ChartData[] = Object.values(salesByDate).sort(
    (a: ChartData, b: ChartData) => a.date.localeCompare(b.date)
  );

  const stats = {
    totalProducts: products.length,
    totalSales: sales.length,
    totalRevenue: totalRevenue,
    averageOrderValue: sales.length ? totalRevenue / sales.length : 0,
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">
            Manage datasets and track your sales
          </p>
        </div>
        <Link href="/marketplace/upload" passHref>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Dataset
          </Button>
        </Link>
      </div>

      <DashboardStats stats={stats} />

      <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sales Analytics</CardTitle>
                <CardDescription>
                  Track your sales and revenue over time
                </CardDescription>
              </div>
              <DashboardFilterTabs currentPeriod={period} />
            </div>
          </CardHeader>
          <CardContent className="px-2">
            <DashboardChart data={chartData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>My Datasets</CardTitle>
            <CardDescription>
              Manage datasets you have created and are selling
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You have not created any datasets yet
                </p>
                <Link href="/marketplace/upload" passHref>
                  <Button>Start Creating Your First Dataset</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {products.slice(0, MAX_ITEMS).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <div>
                      <Link
                        href={`/marketplace/product-listing/${product.id}`}
                        className="font-medium hover:underline"
                      >
                        {product.title}
                      </Link>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(product.createdAt)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{product.category}</Badge>
                        {/* Removed productType */}
                      </div>
                    </div>
                    <Link href={`/marketplace/products/${product.id}/edit`} passHref>
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}

                {products.length > MAX_ITEMS && (
                  <div className="text-center pt-2">
                    <Link href="/marketplace/products" passHref>
                      <Button variant="link">View All My Datasets</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
              List of recent purchases from your customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No sales in the selected time period
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sales.slice(0, MAX_ITEMS).map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full overflow-hidden">
                        {sale.buyer?.image ? (
                          <img
                            src={sale.buyer?.image}
                            alt={sale.buyer.name || "Buyer"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 flex items-center justify-center text-gray-500">
                            <User2 className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{sale.product?.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {sale.buyer?.name} • {formatDate(sale.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(sale.totalAmount)}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {sale.paymentMethod.replace("_", " ")}
                      </div>
                    </div>
                  </div>
                ))}

                {sales.length > MAX_ITEMS && (
                  <div className="text-center pt-2">
                    <Link href="/marketplace/sales" passHref>
                      <Button variant="link">View All Sales</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
