import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../components/Auth/AuthProvider';
import {
  ReputationEvent,
  ReputationReason,
  REPUTATION_VALUES,
  BADGE_DEFINITIONS,
  Badge,
  LeaderboardEntry,
  LeaderboardPeriod
} from '../types/community';

// Add reputation points
export function useReputation() {
  const { communityUser, updateCommunityUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const addReputation = async (
    reason: ReputationReason,
    relatedId?: string,
    description?: string
  ): Promise<boolean> => {
    if (!communityUser) return false;

    const points = REPUTATION_VALUES[reason];
    if (points === 0) return true;

    setLoading(true);

    try {
      // SECURITY: Check if user already got reputation for this action
      // This prevents duplicate reputation on refresh/re-click
      if (relatedId) {
        const existingQuery = query(
          collection(db, 'reputation_history'),
          where('userId', '==', communityUser.id),
          where('reason', '==', reason),
          where('relatedId', '==', relatedId),
          limit(1)
        );
        const existingSnap = await getDocs(existingQuery);
        
        if (!existingSnap.empty) {
          // User already received reputation for this action
          console.log('Reputation already awarded for this action');
          setLoading(false);
          return true;
        }
      }

      // Add reputation event
      await addDoc(collection(db, 'reputation_history'), {
        userId: communityUser.id,
        points,
        reason,
        relatedId: relatedId || null,
        description: description || getDefaultDescription(reason, points),
        createdAt: serverTimestamp()
      });

      // Update user reputation
      const userRef = doc(db, 'users', communityUser.id);
      const newReputation = Math.max(0, communityUser.reputation + points);
      
      await updateDoc(userRef, {
        reputation: newReputation
      });

      // Check for new badges
      await checkAndAwardBadges(communityUser.id, newReputation);

      // Update local state
      await updateCommunityUser({ reputation: newReputation });

      return true;
    } catch (err) {
      console.error('Add reputation error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkAndAwardBadges = async (userId: string, reputation: number) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return;
    
    const userData = userSnap.data();
    const currentBadges: Badge[] = userData.badges || [];
    const badgeIds = currentBadges.map((b: Badge) => b.id);
    const newBadges: Badge[] = [];

    // Check reputation milestones
    if (reputation >= 1 && !badgeIds.includes('seedling')) {
      newBadges.push({
        ...BADGE_DEFINITIONS.seedling,
        earnedAt: new Date()
      });
    }
    if (reputation >= 50 && !badgeIds.includes('sprout')) {
      newBadges.push({
        ...BADGE_DEFINITIONS.sprout,
        earnedAt: new Date()
      });
    }
    if (reputation >= 500 && !badgeIds.includes('treeMaster')) {
      newBadges.push({
        ...BADGE_DEFINITIONS.treeMaster,
        earnedAt: new Date()
      });
    }
    if (reputation >= 1000 && !badgeIds.includes('algorithmGuru')) {
      newBadges.push({
        ...BADGE_DEFINITIONS.algorithmGuru,
        earnedAt: new Date()
      });
    }

    if (newBadges.length > 0) {
      await updateDoc(userRef, {
        badges: [...currentBadges, ...newBadges]
      });
    }
  };

  return { addReputation, loading };
}

function getDefaultDescription(reason: ReputationReason, points: number): string {
  const sign = points > 0 ? '+' : '';
  switch (reason) {
    case 'problem_submitted':
      return `${sign}${points} for submitting a problem`;
    case 'problem_upvoted':
      return `${sign}${points} for receiving an upvote on your problem`;
    case 'problem_downvoted':
      return `${sign}${points} for receiving a downvote on your problem`;
    case 'answer_best':
      return `${sign}${points} for your answer being marked as best`;
    case 'answer_upvoted':
      return `${sign}${points} for receiving an upvote on your answer`;
    case 'answer_downvoted':
      return `${sign}${points} for receiving a downvote on your answer`;
    case 'comment_upvoted':
      return `${sign}${points} for receiving an upvote on your comment`;
    case 'comment_downvoted':
      return `${sign}${points} for receiving a downvote on your comment`;
    case 'five_star_review':
      return `${sign}${points} for receiving a 5-star review`;
    case 'problem_solved':
      return `${sign}${points} for solving a problem`;
    case 'first_solver':
      return `${sign}${points} bonus for being the first to solve`;
    case 'content_flagged':
      return `${sign}${points} for flagged content`;
    default:
      return `${sign}${points} reputation`;
  }
}

// Get reputation history
export function useReputationHistory(userId: string | undefined) {
  const [history, setHistory] = useState<ReputationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, 'reputation_history'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(50)
        );

        const snapshot = await getDocs(q);
        const events: ReputationEvent[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date()
        })) as ReputationEvent[];

        setHistory(events);
      } catch (err) {
        console.error('Failed to fetch reputation history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  return { history, loading };
}

// Leaderboard
export function useLeaderboard(period: LeaderboardPeriod = 'allTime') {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);

      try {
        // For now, just get top users by reputation
        // In production, you'd have separate aggregation for different periods
        const q = query(
          collection(db, 'users'),
          orderBy('reputation', 'desc'),
          limit(50)
        );

        const snapshot = await getDocs(q);
        const entries: LeaderboardEntry[] = snapshot.docs.map((docSnap, index) => {
          const data = docSnap.data();
          return {
            rank: index + 1,
            userId: docSnap.id,
            userName: data.displayName || data.username,
            userAvatar: data.avatarUrl,
            reputation: data.reputation || 0,
            problemsSubmitted: data.problemsSubmitted || 0,
            problemsSolved: data.problemsSolved || 0,
            bestAnswers: data.bestAnswers || 0,
            badges: data.badges || []
          };
        });

        setLeaderboard(entries);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [period]);

  return { leaderboard, loading };
}

// User stats
export function useUserStats(userId: string | undefined) {
  const [stats, setStats] = useState({
    problemsSubmitted: 0,
    problemsSolved: 0,
    commentsPosted: 0,
    bestAnswers: 0,
    totalUpvotes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        // Count problems submitted
        const problemsQuery = query(
          collection(db, 'problems'),
          where('authorId', '==', userId)
        );
        const problemsSnapshot = await getDocs(problemsQuery);
        const problemsSubmitted = problemsSnapshot.size;
        const totalProblemUpvotes = problemsSnapshot.docs.reduce(
          (sum, d) => sum + (d.data().upvotes || 0),
          0
        );

        // Count comments
        const commentsQuery = query(
          collection(db, 'comments'),
          where('userId', '==', userId)
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        const commentsPosted = commentsSnapshot.size;
        const bestAnswers = commentsSnapshot.docs.filter(d => d.data().isBestAnswer).length;
        const totalCommentUpvotes = commentsSnapshot.docs.reduce(
          (sum, d) => sum + (d.data().upvotes || 0),
          0
        );

        setStats({
          problemsSubmitted,
          problemsSolved: 0, // Would need a separate collection to track
          commentsPosted,
          bestAnswers,
          totalUpvotes: totalProblemUpvotes + totalCommentUpvotes
        });
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return { stats, loading };
}
