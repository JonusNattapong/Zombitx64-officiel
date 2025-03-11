export interface LearningProgress {
  id: string;
  courseId: string;
  progress: number;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: Date;
}

export interface CommunityStats {
  totalUsers: number;
  activeUsers: number;
  completedChallenges: number;
  totalTransactions: number;
}

export interface DashboardData {
  learningProgress: LearningProgress[];
  activities: Activity[];
  stats: CommunityStats;
}
