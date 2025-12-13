// Community Types for Data Structures Visualizer

// User Roles
export type UserRole = 'user' | 'moderator' | 'creator';

// Creator emails - users with these emails get creator role automatically (site owner)
export const CREATOR_EMAILS = [
  'ssolayman244@gmail.com'
];

// Creator user IDs - users with these IDs get creator role automatically (site owner)
export const CREATOR_USER_IDS = [
  'baZs92TPs5Rwh42HL1s37ef7wqq1'
];

// User Types
export interface CommunityUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  reputation: number;
  badges: Badge[];
  role: UserRole;
  createdAt: Date;
  lastActive: Date;
  bio?: string;
  location?: string;
  favoriteTopics: string[];
  bookmarkedProblems: string[];
  followingTopics: string[];
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  earnedAt: Date;
}

export const BADGE_DEFINITIONS: Record<string, Omit<Badge, 'earnedAt'>> = {
  seedling: {
    id: 'seedling',
    name: 'Seedling',
    emoji: '🌱',
    description: 'First contribution (1 point)'
  },
  sprout: {
    id: 'sprout',
    name: 'Sprout',
    emoji: '🌿',
    description: '50 reputation points'
  },
  treeMaster: {
    id: 'treeMaster',
    name: 'Tree Master',
    emoji: '🌳',
    description: '500 reputation points'
  },
  algorithmGuru: {
    id: 'algorithmGuru',
    name: 'Algorithm Guru',
    emoji: '🏆',
    description: '1000 reputation points'
  },
  conversationalist: {
    id: 'conversationalist',
    name: 'Conversationalist',
    emoji: '💬',
    description: '50 comments posted'
  },
  helper: {
    id: 'helper',
    name: 'Helper',
    emoji: '⭐',
    description: '10 best answers'
  },
  problemSetter: {
    id: 'problemSetter',
    name: 'Problem Setter',
    emoji: '🎯',
    description: '20 problems submitted'
  },
  streaker: {
    id: 'streaker',
    name: 'Streak Master',
    emoji: '🔥',
    description: '7-day login streak'
  }
};

// Problem Types
export type ProblemDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ProblemCategory = 'BST' | 'AVL' | 'Graph' | 'Floyd' | 'Huffman' | 'Sorting' | 'Traversal' | 'General';
export type ProblemType = 'algorithm' | 'conceptual' | 'debugging' | 'optimization';

export interface CommunityProblem {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  title: string;
  description: string; // Rich text/markdown
  problemType: ProblemType;
  difficulty: ProblemDifficulty;
  category: ProblemCategory;
  tags: string[];
  codeSnippet?: string;
  language?: string;
  solution?: string; // Hidden until user attempts
  testCases?: TestCase[];
  isMultipleChoice: boolean;
  choices?: string[];
  correctAnswer?: string;
  // Rating system (1-5 stars: 1=very bad, 2=bad, 3=normal, 4=good, 5=very good)
  totalRating: number;      // Sum of all ratings
  ratingCount: number;      // Number of ratings
  viewCount: number;
  attemptCount: number;
  solveCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
  isFeatured: boolean;
  status: 'active' | 'closed' | 'flagged';
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
}

// Comment Types
export interface Comment {
  id: string;
  problemId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  userReputation: number;
  parentCommentId: string | null; // For nesting
  content: string; // Markdown
  codeBlock?: string;
  language?: string;
  upvotes: number;
  downvotes: number;
  isBestAnswer: boolean;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  replies?: Comment[]; // Populated on fetch
}

// Rating Types
export interface Rating {
  id: string;
  userId: string;
  problemId: string;
  clarityScore: number; // 1-5
  difficultyScore: number; // 1-5
  educationalScore: number; // 1-5
  reviewText?: string; // Max 500 chars
  createdAt: Date;
}

export interface AggregatedRating {
  totalRatings: number;
  avgClarity: number;
  avgDifficulty: number;
  avgEducational: number;
  overallScore: number;
}

// Reputation Types
export type ReputationReason = 
  | 'problem_submitted'
  | 'problem_upvoted'
  | 'problem_downvoted'
  | 'answer_best'
  | 'answer_upvoted'
  | 'answer_downvoted'
  | 'comment_upvoted'
  | 'comment_downvoted'
  | 'five_star_review'
  | 'problem_solved'
  | 'first_solver'
  | 'content_flagged';

export interface ReputationEvent {
  id: string;
  userId: string;
  points: number; // Can be negative
  reason: ReputationReason;
  relatedId?: string; // Problem or comment ID
  description: string;
  createdAt: Date;
}

export const REPUTATION_VALUES: Record<ReputationReason, number> = {
  problem_submitted: 10,
  problem_upvoted: 5,
  problem_downvoted: -2,
  answer_best: 25,
  answer_upvoted: 2,
  answer_downvoted: -2,
  comment_upvoted: 2,
  comment_downvoted: -2,
  five_star_review: 15,
  problem_solved: 5,
  first_solver: 10,
  content_flagged: -20
};

// Vote Types
export interface Vote {
  id: string;
  userId: string;
  targetId: string; // Problem or comment ID
  targetType: 'problem' | 'comment';
  voteType: 'up' | 'down';
  createdAt: Date;
}

// Activity Feed Types
export type ActivityType = 
  | 'problem_created'
  | 'problem_solved'
  | 'comment_posted'
  | 'answer_marked_best'
  | 'badge_earned'
  | 'reputation_milestone';

export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  activityType: ActivityType;
  targetId?: string;
  targetTitle?: string;
  description: string;
  createdAt: Date;
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar: string | null;
  reputation: number;
  problemsSubmitted: number;
  problemsSolved: number;
  bestAnswers: number;
  badges: Badge[];
}

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'allTime';

// Filter Types
export interface ProblemFilters {
  difficulty?: ProblemDifficulty;
  category?: ProblemCategory;
  problemType?: ProblemType;
  tags?: string[];
  sortBy: 'newest' | 'popular' | 'mostAttempted' | 'leastSolved';
  search?: string;
}

// Report/Flag Types
export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'problem' | 'comment' | 'user';
  reason: 'spam' | 'offensive' | 'incorrect' | 'plagiarism' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
}

// Notification Types
export type NotificationType =
  | 'comment_reply'
  | 'answer_best'
  | 'problem_upvoted'
  | 'badge_earned'
  | 'problem_commented'
  | 'following_new_problem';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: Date;
}
