import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  completedChallenges: number;
  totalTransactions: number;
}

interface StatsCardProps {
  stats: Stats;
}

export function StatsCard({ stats }: StatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Stats</CardTitle>
        <CardDescription>Statistics about the community</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Active Users</p>
            <p className="text-2xl font-bold">{stats.activeUsers}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Completed Challenges</p>
            <p className="text-2xl font-bold">{stats.completedChallenges}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold">{stats.totalTransactions}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
