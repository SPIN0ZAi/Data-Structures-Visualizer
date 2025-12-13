import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  category: 'progress' | 'achievement' | 'special' | 'streak';
}

export interface SolvedProblem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  solvedAt: Date;
  attempts: number;
  timeSpent: number; // in seconds
  code?: string;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  problemsSolved: number;
  xpEarned: number;
}

export interface UserProfile {
  name: string;
  avatar: string; // emoji or initials
  createdAt: Date;
}

export interface UserProgress {
  profile: UserProfile;
  xp: number;
  level: number;
  solvedProblems: SolvedProblem[];
  badges: Badge[];
  streak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  dailyActivity: DailyActivity[];
  totalTimeSpent: number; // in seconds
}

// Badge definitions
export const ALL_BADGES: Badge[] = [
  // Progress Badges
  { id: 'first-blood', name: 'First Blood', description: 'Solve your first problem', icon: '🩸', category: 'progress' },
  { id: 'getting-started', name: 'Getting Started', description: 'Solve 5 problems', icon: '🚀', category: 'progress' },
  { id: 'problem-solver', name: 'Problem Solver', description: 'Solve 10 problems', icon: '🧩', category: 'progress' },
  { id: 'dedicated', name: 'Dedicated Learner', description: 'Solve 25 problems', icon: '📚', category: 'progress' },
  { id: 'expert', name: 'Algorithm Expert', description: 'Solve 50 problems', icon: '🎓', category: 'progress' },
  { id: 'master', name: 'Data Structure Master', description: 'Solve 100 problems', icon: '👑', category: 'progress' },
  
  // Achievement Badges
  { id: 'easy-10', name: 'Easy Street', description: 'Solve 10 easy problems', icon: '🟢', category: 'achievement' },
  { id: 'medium-10', name: 'Medium Rare', description: 'Solve 10 medium problems', icon: '🟡', category: 'achievement' },
  { id: 'hard-5', name: 'Hard Mode', description: 'Solve 5 hard problems', icon: '🔴', category: 'achievement' },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Solve a problem on first attempt', icon: '✨', category: 'achievement' },
  { id: 'speed-demon', name: 'Speed Demon', description: 'Solve a problem in under 2 minutes', icon: '⚡', category: 'achievement' },
  { id: 'night-owl', name: 'Night Owl', description: 'Solve a problem after midnight', icon: '🦉', category: 'achievement' },
  { id: 'early-bird', name: 'Early Bird', description: 'Solve a problem before 7 AM', icon: '🐦', category: 'achievement' },
  
  // Streak Badges
  { id: 'streak-3', name: 'On Fire', description: '3 day streak', icon: '🔥', category: 'streak' },
  { id: 'streak-7', name: 'Week Warrior', description: '7 day streak', icon: '⚔️', category: 'streak' },
  { id: 'streak-14', name: 'Fortnight Fighter', description: '14 day streak', icon: '🛡️', category: 'streak' },
  { id: 'streak-30', name: 'Monthly Master', description: '30 day streak', icon: '🏆', category: 'streak' },
  
  // Special Badges
  { id: 'tree-explorer', name: 'Tree Explorer', description: 'Complete all tree problems', icon: '🌳', category: 'special' },
  { id: 'graph-guru', name: 'Graph Guru', description: 'Complete all graph problems', icon: '🕸️', category: 'special' },
  { id: 'sort-king', name: 'Sort King', description: 'Try all sorting algorithms', icon: '📊', category: 'special' },
  { id: 'pathfinder', name: 'Pathfinder', description: 'Find paths with all algorithms', icon: '🗺️', category: 'special' },
];

// XP rewards
const XP_REWARDS = {
  easy: 10,
  medium: 25,
  hard: 50,
  firstAttempt: 10,
  speedBonus: 5,
  streakBonus: 5,
};

// Level thresholds
const getLevelFromXP = (xp: number): number => {
  if (xp < 50) return 1;
  if (xp < 150) return 2;
  if (xp < 300) return 3;
  if (xp < 500) return 4;
  if (xp < 750) return 5;
  if (xp < 1100) return 6;
  if (xp < 1500) return 7;
  if (xp < 2000) return 8;
  if (xp < 2750) return 9;
  return Math.floor(10 + (xp - 2750) / 500);
};

const getXPForLevel = (level: number): number => {
  const thresholds = [0, 50, 150, 300, 500, 750, 1100, 1500, 2000, 2750];
  if (level <= 10) return thresholds[level - 1] || 0;
  return 2750 + (level - 10) * 500;
};

// Default user state
const defaultUserProgress: UserProgress = {
  profile: {
    name: '',
    avatar: '👨‍💻',
    createdAt: new Date(),
  },
  xp: 0,
  level: 1,
  solvedProblems: [],
  badges: [],
  streak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  dailyActivity: [],
  totalTimeSpent: 0,
};

// Context type
interface UserContextType {
  user: UserProgress;
  isSetup: boolean;
  setupProfile: (name: string, avatar: string) => void;
  solveProblem: (problem: Omit<SolvedProblem, 'solvedAt'>) => { xpEarned: number; newBadges: Badge[]; levelUp: boolean };
  unlockBadge: (badgeId: string) => Badge | null;
  getUnlockedBadges: () => Badge[];
  getLockedBadges: () => Badge[];
  resetProgress: () => void;
  updateStreak: () => void;
  getXPProgress: () => { current: number; needed: number; percentage: number };
  getTodayActivity: () => DailyActivity | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Storage key
const STORAGE_KEY = 'ds-visualizer-user-progress';

// Helper to get today's date string
const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProgress>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        parsed.profile.createdAt = new Date(parsed.profile.createdAt);
        parsed.solvedProblems = parsed.solvedProblems.map((p: SolvedProblem) => ({
          ...p,
          solvedAt: new Date(p.solvedAt),
        }));
        parsed.badges = parsed.badges.map((b: Badge) => ({
          ...b,
          unlockedAt: b.unlockedAt ? new Date(b.unlockedAt) : undefined,
        }));
        return parsed;
      } catch {
        return defaultUserProgress;
      }
    }
    return defaultUserProgress;
  });

  // Save to localStorage whenever user changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  // Check if user has completed setup
  const isSetup = user.profile.name !== '';

  // Setup profile
  const setupProfile = (name: string, avatar: string) => {
    setUser(prev => ({
      ...prev,
      profile: {
        name,
        avatar,
        createdAt: new Date(),
      },
      lastActiveDate: getTodayString(),
    }));
  };

  // Update streak based on last active date
  const updateStreak = () => {
    const today = getTodayString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    setUser(prev => {
      if (prev.lastActiveDate === today) {
        return prev; // Already active today
      }

      let newStreak = prev.streak;
      if (prev.lastActiveDate === yesterdayString) {
        newStreak = prev.streak + 1; // Continue streak
      } else if (prev.lastActiveDate !== today) {
        newStreak = 1; // Reset streak
      }

      return {
        ...prev,
        streak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastActiveDate: today,
      };
    });
  };

  // Unlock a badge
  const unlockBadge = (badgeId: string): Badge | null => {
    const badge = ALL_BADGES.find(b => b.id === badgeId);
    if (!badge) return null;

    const alreadyUnlocked = user.badges.some(b => b.id === badgeId);
    if (alreadyUnlocked) return null;

    const unlockedBadge = { ...badge, unlockedAt: new Date() };
    setUser(prev => ({
      ...prev,
      badges: [...prev.badges, unlockedBadge],
    }));

    return unlockedBadge;
  };

  // Check and unlock badges based on current progress
  const checkBadges = (updatedUser: UserProgress): Badge[] => {
    const newBadges: Badge[] = [];
    const unlockedIds = updatedUser.badges.map(b => b.id);
    const solvedCount = updatedUser.solvedProblems.length;
    const easyCount = updatedUser.solvedProblems.filter(p => p.difficulty === 'easy').length;
    const mediumCount = updatedUser.solvedProblems.filter(p => p.difficulty === 'medium').length;
    const hardCount = updatedUser.solvedProblems.filter(p => p.difficulty === 'hard').length;

    // Progress badges
    if (solvedCount >= 1 && !unlockedIds.includes('first-blood')) {
      const badge = ALL_BADGES.find(b => b.id === 'first-blood')!;
      newBadges.push({ ...badge, unlockedAt: new Date() });
    }
    if (solvedCount >= 5 && !unlockedIds.includes('getting-started')) {
      const badge = ALL_BADGES.find(b => b.id === 'getting-started')!;
      newBadges.push({ ...badge, unlockedAt: new Date() });
    }
    if (solvedCount >= 10 && !unlockedIds.includes('problem-solver')) {
      const badge = ALL_BADGES.find(b => b.id === 'problem-solver')!;
      newBadges.push({ ...badge, unlockedAt: new Date() });
    }
    if (solvedCount >= 25 && !unlockedIds.includes('dedicated')) {
      const badge = ALL_BADGES.find(b => b.id === 'dedicated')!;
      newBadges.push({ ...badge, unlockedAt: new Date() });
    }
    if (solvedCount >= 50 && !unlockedIds.includes('expert')) {
      const badge = ALL_BADGES.find(b => b.id === 'expert')!;
      newBadges.push({ ...badge, unlockedAt: new Date() });
    }
    if (solvedCount >= 100 && !unlockedIds.includes('master')) {
      const badge = ALL_BADGES.find(b => b.id === 'master')!;
      newBadges.push({ ...badge, unlockedAt: new Date() });
    }

    // Difficulty badges
    if (easyCount >= 10 && !unlockedIds.includes('easy-10')) {
      const badge = ALL_BADGES.find(b => b.id === 'easy-10')!;
      newBadges.push({ ...badge, unlockedAt: new Date() });
    }
    if (mediumCount >= 10 && !unlockedIds.includes('medium-10')) {
      const badge = ALL_BADGES.find(b => b.id === 'medium-10')!;
      newBadges.push({ ...badge, unlockedAt: new Date() });
    }
    if (hardCount >= 5 && !unlockedIds.includes('hard-5')) {
      const badge = ALL_BADGES.find(b => b.id === 'hard-5')!;
      newBadges.push({ ...badge, unlockedAt: new Date() });
    }

    // Streak badges
    if (updatedUser.streak >= 3 && !unlockedIds.includes('streak-3')) {
      const badge = ALL_BADGES.find(b => b.id === 'streak-3')!;
      newBadges.push({ ...badge, unlockedAt: new Date() });
    }
    if (updatedUser.streak >= 7 && !unlockedIds.includes('streak-7')) {
      const badge = ALL_BADGES.find(b => b.id === 'streak-7')!;
      newBadges.push({ ...badge, unlockedAt: new Date() });
    }
    if (updatedUser.streak >= 14 && !unlockedIds.includes('streak-14')) {
      const badge = ALL_BADGES.find(b => b.id === 'streak-14')!;
      newBadges.push({ ...badge, unlockedAt: new Date() });
    }
    if (updatedUser.streak >= 30 && !unlockedIds.includes('streak-30')) {
      const badge = ALL_BADGES.find(b => b.id === 'streak-30')!;
      newBadges.push({ ...badge, unlockedAt: new Date() });
    }

    return newBadges;
  };

  // Solve a problem
  const solveProblem = (problem: Omit<SolvedProblem, 'solvedAt'>) => {
    const today = getTodayString();
    const hour = new Date().getHours();
    let xpEarned = XP_REWARDS[problem.difficulty];
    const newBadges: Badge[] = [];

    // First attempt bonus
    if (problem.attempts === 1) {
      xpEarned += XP_REWARDS.firstAttempt;
      if (!user.badges.some(b => b.id === 'perfectionist')) {
        const badge = ALL_BADGES.find(b => b.id === 'perfectionist')!;
        newBadges.push({ ...badge, unlockedAt: new Date() });
      }
    }

    // Speed bonus (under 2 minutes)
    if (problem.timeSpent < 120) {
      xpEarned += XP_REWARDS.speedBonus;
      if (!user.badges.some(b => b.id === 'speed-demon')) {
        const badge = ALL_BADGES.find(b => b.id === 'speed-demon')!;
        newBadges.push({ ...badge, unlockedAt: new Date() });
      }
    }

    // Time-based badges
    if (hour >= 0 && hour < 5 && !user.badges.some(b => b.id === 'night-owl')) {
      const badge = ALL_BADGES.find(b => b.id === 'night-owl')!;
      newBadges.push({ ...badge, unlockedAt: new Date() });
    }
    if (hour >= 5 && hour < 7 && !user.badges.some(b => b.id === 'early-bird')) {
      const badge = ALL_BADGES.find(b => b.id === 'early-bird')!;
      newBadges.push({ ...badge, unlockedAt: new Date() });
    }

    // Streak bonus
    if (user.streak > 0) {
      xpEarned += XP_REWARDS.streakBonus * Math.min(user.streak, 10);
    }

    const solvedProblem: SolvedProblem = {
      ...problem,
      solvedAt: new Date(),
    };

    // Update daily activity
    const existingActivity = user.dailyActivity.find(a => a.date === today);
    const updatedActivity = existingActivity
      ? user.dailyActivity.map(a =>
          a.date === today
            ? { ...a, problemsSolved: a.problemsSolved + 1, xpEarned: a.xpEarned + xpEarned }
            : a
        )
      : [...user.dailyActivity, { date: today, problemsSolved: 1, xpEarned }];

    const newXP = user.xp + xpEarned;
    const newLevel = getLevelFromXP(newXP);
    const levelUp = newLevel > user.level;

    // Calculate new streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    let newStreak = user.streak;
    if (user.lastActiveDate === today) {
      // Already active today, keep streak
    } else if (user.lastActiveDate === yesterdayString) {
      newStreak = user.streak + 1;
    } else {
      newStreak = 1;
    }

    const updatedUser: UserProgress = {
      ...user,
      xp: newXP,
      level: newLevel,
      solvedProblems: [...user.solvedProblems, solvedProblem],
      totalTimeSpent: user.totalTimeSpent + problem.timeSpent,
      dailyActivity: updatedActivity,
      streak: newStreak,
      longestStreak: Math.max(user.longestStreak, newStreak),
      lastActiveDate: today,
    };

    // Check for additional badges based on updated progress
    const progressBadges = checkBadges(updatedUser);
    const allNewBadges = [...newBadges, ...progressBadges];

    // Add badges to user
    updatedUser.badges = [...user.badges, ...allNewBadges];

    setUser(updatedUser);

    return { xpEarned, newBadges: allNewBadges, levelUp };
  };

  // Get unlocked badges
  const getUnlockedBadges = (): Badge[] => {
    return user.badges;
  };

  // Get locked badges
  const getLockedBadges = (): Badge[] => {
    const unlockedIds = user.badges.map(b => b.id);
    return ALL_BADGES.filter(b => !unlockedIds.includes(b.id));
  };

  // Reset all progress
  const resetProgress = () => {
    setUser(defaultUserProgress);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Get XP progress for current level
  const getXPProgress = () => {
    const currentLevelXP = getXPForLevel(user.level);
    const nextLevelXP = getXPForLevel(user.level + 1);
    const current = user.xp - currentLevelXP;
    const needed = nextLevelXP - currentLevelXP;
    const percentage = Math.min((current / needed) * 100, 100);
    return { current, needed, percentage };
  };

  // Get today's activity
  const getTodayActivity = (): DailyActivity | null => {
    return user.dailyActivity.find(a => a.date === getTodayString()) || null;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isSetup,
        setupProfile,
        solveProblem,
        unlockBadge,
        getUnlockedBadges,
        getLockedBadges,
        resetProgress,
        updateStreak,
        getXPProgress,
        getTodayActivity,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Hook
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
