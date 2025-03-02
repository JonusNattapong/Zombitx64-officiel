import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Welcome, {session.user.name}!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Shortcuts to common tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/challenges/new">
              <Button variant="outline">Create New Challenge</Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="outline">Browse Marketplace</Button>
            </Link>
            <Link href="/learn">
              <Button variant="outline">View Learning Resources</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Challenge Progress */ }
        <Card>
          <CardHeader>
            <CardTitle>Challenge Progress</CardTitle>
            <CardDescription>Track your ongoing challenges</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for progress bar/chart */}
            <div className="text-center">
              <p>Challenge progress will be displayed here.</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>See your latest activities</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for activity list */}
            <ul>
              <li>Activity 1</li>
              <li>Activity 2</li>
              <li>Activity 3</li>
            </ul>
          </CardContent>
        </Card>

        {/* Community Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Community Stats</CardTitle>
            <CardDescription>Statistics about the community</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for community stats */}
            <div className="text-center">
              <p>Community statistics will be displayed here.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
