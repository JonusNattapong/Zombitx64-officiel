import { Suspense } from "react";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getDashboardData } from "@/lib/services/dashboard-service";
import { ProgressCard } from "@/components/dashboard/progress-card";
import { ActivityCard } from "@/components/dashboard/activity-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { LoadingCard } from "@/components/dashboard/loading-card";
import { ErrorCard } from "@/components/dashboard/error-card";
import { cache } from "react";

// Cache the data fetching to avoid duplicate requests
const getInitialData = cache(async (userId: string) => {
  try {
    return await getDashboardData(userId);
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    throw error;
  }
});

// Loading component for each section
function DashboardSectionLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <LoadingCard title="Quick Actions" items={3} />
      <LoadingCard title="Learning Progress" items={3} />
      <LoadingCard title="Recent Activity" items={5} />
      <LoadingCard title="Community Stats" items={4} />
    </div>
  );
}

// Error component for each section
function DashboardSectionError({ error }: { error: Error }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ErrorCard 
        title="Error Loading Dashboard"
        message={error.message || "Failed to load dashboard data. Please try again later."}
      />
    </div>
  );
}

// Async component to handle data fetching
async function DashboardContent() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  try {
    const dashboardData = await getInitialData(session.user.id);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Shortcuts to common tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/marketplace" className="w-full">
              <Button variant="outline" className="w-full flex items-center gap-2">
                Browse Marketplace
              </Button>
            </Link>
            <Link href="/learn" className="w-full">
              <Button variant="outline" className="w-full flex items-center gap-2">
                Start Learning
              </Button>
            </Link>
            <Link href="/community" className="w-full">
              <Button variant="outline" className="w-full flex items-center gap-2">
                Join Community
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Learning Progress */}
        <ProgressCard challenges={dashboardData.learningProgress.map(p => ({
          id: p.id,
          title: `Course ${p.courseId}`,
          progress: p.progress
        }))} />

        {/* Recent Activity */}
        <ActivityCard activities={dashboardData.activities} />

        {/* Community Stats */}
        <StatsCard stats={dashboardData.stats} />
      </div>
    );
  } catch (error) {
    return <DashboardSectionError error={error instanceof Error ? error : new Error("Unknown error")} />;
  }
}

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back to your learning journey
          </p>
        </div>
      </div>

      <Suspense fallback={<DashboardSectionLoading />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
