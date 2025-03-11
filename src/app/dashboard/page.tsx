<<<<<<< HEAD
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">แดชบอร์ด</h2>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/dashboard/products/new">เพิ่มสินค้าใหม่</Link>
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="products">สินค้า</TabsTrigger>
          <TabsTrigger value="analytics">วิเคราะห์</TabsTrigger>
          <TabsTrigger value="datasets">ชุดข้อมูล</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">รายได้ทั้งหมด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">฿45,231.89</div>
                <p className="text-xs text-muted-foreground">+20.1% จากเดือนที่แล้ว</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">สินค้าทั้งหมด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">+201 สินค้าใหม่เดือนนี้</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ชุดข้อมูล</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">124</div>
                <p className="text-xs text-muted-foreground">+42 ชุดข้อมูลใหม่</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ผู้ติดตาม</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,350</div>
                <p className="text-xs text-muted-foreground">+180 ผู้ติดตามใหม่</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
=======
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
>>>>>>> c839f9429fbacc1f7300d807d5691a20a4fcba27
