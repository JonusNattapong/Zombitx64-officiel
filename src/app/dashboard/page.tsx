'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { DashboardData, DashboardError, isDashboardError } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { IconRefresh, IconTrendingUp, IconTrendingDown } from '@/components/ui/icons';
import { LoadingPage, LoadingSpinner } from '@/components/ui/loading-spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { 
  pageVariants, 
  containerVariants, 
  cardVariants, 
  listItemVariants,
  progressVariants,
  numberVariants 
} from '@/lib/animations';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await fetch('/api/dashboard/stats');
      const responseData = await response.json();

      if (!response.ok || isDashboardError(responseData)) {
        throw new Error(isDashboardError(responseData) ? responseData.error : 'Failed to fetch dashboard data');
      }

      setData(responseData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to load dashboard data',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (status === 'loading' || loading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
          <Button onClick={handleRefresh} variant="outline" className="ml-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="container mx-auto p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            {refreshing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <IconRefresh className="h-4 w-4" />
            )}
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
        >
          <motion.div variants={cardVariants}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Total Sales
                  {data.userStats.totalSales > 0 && (
                    <IconTrendingUp className="h-5 w-5 text-green-500" />
                  )}
                </CardTitle>
                <CardDescription>Total revenue from all sales</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.p 
                  variants={numberVariants}
                  className="text-2xl font-bold"
                >
                  ${data.userStats.totalSales.toLocaleString()}
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Active Listings
                  <span className="text-sm font-normal text-gray-500">
                    {((data.userStats.activeListings / data.userStats.totalListings) * 100).toFixed(0)}% active
                  </span>
                </CardTitle>
                <CardDescription>Currently available products</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.p 
                  variants={numberVariants}
                  className="text-2xl font-bold"
                >
                  {data.userStats.activeListings}
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Total Products
                  <span className="text-sm font-normal text-gray-500">
                    Lifetime total
                  </span>
                </CardTitle>
                <CardDescription>All products created</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.p 
                  variants={numberVariants}
                  className="text-2xl font-bold"
                >
                  {data.userStats.totalListings}
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    {data.activities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        variants={listItemVariants}
                        className="flex justify-between items-center border-b pb-4 last:border-0"
                      >
                        <div>
                          <p className="font-medium">{activity.type}</p>
                          <p className="text-sm text-gray-500">{activity.description}</p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="community">
              <Card>
                <CardHeader>
                  <CardTitle>Community Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-3 gap-4"
                  >
                    <div>
                      <p className="text-sm text-gray-500">Total Users</p>
                      <motion.p 
                        variants={numberVariants}
                        className="text-2xl font-bold"
                      >
                        {data.communityStats.totalUsers}
                      </motion.p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Active Users</p>
                      <motion.p 
                        variants={numberVariants}
                        className="text-2xl font-bold"
                      >
                        {data.communityStats.activeUsers}
                      </motion.p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Transactions</p>
                      <motion.p 
                        variants={numberVariants}
                        className="text-2xl font-bold"
                      >
                        {data.communityStats.totalTransactions}
                      </motion.p>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="learning">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.learningProgress.map((course, index) => (
                    <motion.div
                      key={course.id}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1 }}
                      className="mb-4"
                    >
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium">Course {course.courseId}</p>
                        <p className="text-sm text-gray-500">{course.progress}%</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <motion.div
                          variants={progressVariants}
                          initial="hidden"
                          animate="visible"
                          custom={course.progress}
                          className="bg-blue-600 h-2.5 rounded-full"
                        />
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </AnimatePresence>
  );
}
