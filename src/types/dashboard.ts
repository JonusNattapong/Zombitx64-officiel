export interface LearningProgress {
  id: string;
  courseId: string;
  progress: number;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

export interface UserStats {
  totalListings: number;
  activeListings: number;
  totalSales: number;
}

export interface CommunityStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
}

export interface DashboardData {
  learningProgress: LearningProgress[];
  activities: Activity[];
  userStats: UserStats;
  communityStats: CommunityStats;
}

export interface DashboardError {
  error: string;
}

// Union type for API response
export type DashboardResponse = DashboardData | DashboardError;

// Type guard to check if response is an error
export function isDashboardError(response: DashboardResponse): response is DashboardError {
  return 'error' in response;
}
