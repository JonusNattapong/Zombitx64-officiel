import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Package,
  CreditCard,
  CircleDollarSign,
  TrendingUp,
} from "lucide-react";

export function DashboardStats({ stats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="p-2 bg-primary/10 text-primary rounded-full">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Datasets ทั้งหมด</p>
            <p className="text-2xl font-bold">{stats.totalProducts}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-full">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">การขายทั้งหมด</p>
            <p className="text-2xl font-bold">{stats.totalSales}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="p-2 bg-green-500/10 text-green-500 rounded-full">
            <CircleDollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">รายได้ทั้งหมด</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="p-2 bg-purple-500/10 text-purple-500 rounded-full">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ค่าเฉลี่ยต่อออร์เดอร์</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
