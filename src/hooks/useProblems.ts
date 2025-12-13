import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  DocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../components/Auth/AuthProvider';
import {
  CommunityProblem,
  ProblemFilters,
  ProblemDifficulty,
  ProblemCategory,
  ProblemType,
  TestCase
} from '../types/community';

const PROBLEMS_COLLECTION = 'problems';
const PAGE_SIZE = 20;

// Create a new problem
export function useCreateProblem() {
  const { communityUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProblem = async (problemData: {
    title: string;
    description: string;
    problemType: ProblemType;
    difficulty: ProblemDifficulty;
    category: ProblemCategory;
    tags: string[];
    codeSnippet?: string;
    language?: string;
    solution?: string;
    testCases?: TestCase[];
    isMultipleChoice: boolean;
    choices?: string[];
    correctAnswer?: string;
  }): Promise<string | null> => {
    if (!communityUser) {
      setError('You must be logged in to submit a problem');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Build problem data, excluding undefined values (Firestore doesn't accept undefined)
      const newProblem: Record<string, unknown> = {
        title: problemData.title,
        description: problemData.description,
        problemType: problemData.problemType,
        difficulty: problemData.difficulty,
        category: problemData.category,
        tags: problemData.tags,
        authorId: communityUser.id,
        authorName: communityUser.displayName,
        totalRating: 0,
        ratingCount: 0,
        viewCount: 0,
        attemptCount: 0,
        solveCount: 0,
        commentCount: 0,
        isFeatured: false,
        status: 'active',
        isMultipleChoice: problemData.isMultipleChoice
      };

      // Only add optional fields if they have values
      if (communityUser.avatarUrl) {
        newProblem.authorAvatar = communityUser.avatarUrl;
      }
      if (problemData.codeSnippet) {
        newProblem.codeSnippet = problemData.codeSnippet;
      }
      if (problemData.language) {
        newProblem.language = problemData.language;
      }
      if (problemData.solution) {
        newProblem.solution = problemData.solution;
      }
      if (problemData.testCases && problemData.testCases.length > 0) {
        newProblem.testCases = problemData.testCases;
      }
      if (problemData.isMultipleChoice && problemData.choices && problemData.choices.length > 0) {
        newProblem.choices = problemData.choices;
      }
      if (problemData.isMultipleChoice && problemData.correctAnswer) {
        newProblem.correctAnswer = problemData.correctAnswer;
      }

      const docRef = await addDoc(collection(db, PROBLEMS_COLLECTION), {
        ...newProblem,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return docRef.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create problem');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createProblem, loading, error };
}

// Delete a problem (owner, admin, or moderator only)
export function useDeleteProblem() {
  const { communityUser, isAdmin, isModerator } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteProblem = async (problemId: string): Promise<boolean> => {
    if (!communityUser) {
      setError('You must be logged in');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const problemRef = doc(db, PROBLEMS_COLLECTION, problemId);
      const problemSnap = await getDoc(problemRef);

      if (!problemSnap.exists()) {
        setError('Problem not found');
        return false;
      }

      const problemData = problemSnap.data();
      const isOwner = problemData.authorId === communityUser.id;

      // Only allow owner, admin, or moderator to delete
      if (!isOwner && !isAdmin && !isModerator) {
        setError('You do not have permission to delete this problem');
        return false;
      }

      await deleteDoc(problemRef);
      
      console.log('Problem deleted successfully by', isOwner ? 'owner' : 'admin/mod');
      return true;
    } catch (err) {
      console.error('Delete problem error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete problem');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteProblem, loading, error };
}

// Fetch problems with filters and pagination
export function useProblems(filters: ProblemFilters) {
  const [problems, setProblems] = useState<CommunityProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchProblems = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);

    try {
      // Simple query - just order by createdAt to avoid needing composite indexes
      // We'll filter status, difficulty, category, problemType on the client side
      const constraints: QueryConstraint[] = [];

      // Sorting - only use one orderBy to avoid composite index requirements
      switch (filters.sortBy) {
        case 'popular':
          // Sort by average rating (will be done client-side after fetch)
          constraints.push(orderBy('ratingCount', 'desc'));
          break;
        case 'mostAttempted':
          constraints.push(orderBy('attemptCount', 'desc'));
          break;
        case 'leastSolved':
          constraints.push(orderBy('solveCount', 'asc'));
          break;
        case 'newest':
        default:
          constraints.push(orderBy('createdAt', 'desc'));
      }

      // Fetch more than needed since we filter client-side
      constraints.push(limit(PAGE_SIZE * 3));

      if (!reset && lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(collection(db, PROBLEMS_COLLECTION), ...constraints);
      const snapshot = await getDocs(q);

      const fetchedProblems: CommunityProblem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as CommunityProblem[];

      // Client-side filtering to avoid composite index requirements
      let filteredProblems = fetchedProblems;
      
      // Filter by status (only show active problems)
      filteredProblems = filteredProblems.filter(p => p.status === 'active');

      // Filter by difficulty
      if (filters.difficulty) {
        filteredProblems = filteredProblems.filter(p => p.difficulty === filters.difficulty);
      }

      // Filter by category
      if (filters.category) {
        filteredProblems = filteredProblems.filter(p => p.category === filters.category);
      }

      // Filter by problem type
      if (filters.problemType) {
        filteredProblems = filteredProblems.filter(p => p.problemType === filters.problemType);
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProblems = filteredProblems.filter(p =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags.some(t => t.toLowerCase().includes(searchLower))
        );
      }

      // Tag filter
      if (filters.tags && filters.tags.length > 0) {
        filteredProblems = filteredProblems.filter(p =>
          filters.tags!.some(tag => p.tags.includes(tag))
        );
      }

      // Limit to PAGE_SIZE after filtering
      filteredProblems = filteredProblems.slice(0, PAGE_SIZE);

      // Fetch current author data for all unique problem authors
      const uniqueAuthorIds = [...new Set(filteredProblems.map(p => p.authorId))];
      const authorDataMap: Record<string, { displayName: string; avatarUrl: string | null }> = {};
      
      await Promise.all(
        uniqueAuthorIds.map(async (authorId) => {
          try {
            const authorDoc = await getDoc(doc(db, 'users', authorId));
            if (authorDoc.exists()) {
              const userData = authorDoc.data();
              authorDataMap[authorId] = {
                displayName: userData.displayName || 'Unknown User',
                avatarUrl: userData.avatarUrl || null
              };
            }
          } catch (err) {
            console.warn(`Failed to fetch author data for ${authorId}:`, err);
          }
        })
      );

      // Update problems with current author data
      const enrichedProblems = filteredProblems.map(problem => {
        const currentAuthorData = authorDataMap[problem.authorId];
        if (currentAuthorData) {
          return {
            ...problem,
            authorName: currentAuthorData.displayName,
            authorAvatar: currentAuthorData.avatarUrl
          };
        }
        return problem;
      });

      if (reset) {
        setProblems(enrichedProblems);
      } else {
        setProblems(prev => [...prev, ...enrichedProblems]);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length >= PAGE_SIZE);
    } catch (err) {
      console.error('Failed to fetch problems:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch problems');
    } finally {
      setLoading(false);
    }
  }, [filters, lastDoc]);

  // Reset and fetch when filters change
  useEffect(() => {
    setLastDoc(null);
    fetchProblems(true);
  }, [filters.difficulty, filters.category, filters.problemType, filters.sortBy, filters.search]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchProblems(false);
    }
  };

  const refresh = () => {
    setLastDoc(null);
    fetchProblems(true);
  };

  return { problems, loading, error, hasMore, loadMore, refresh };
}

// Helper to check if user has viewed a problem (uses localStorage)
const VIEWED_PROBLEMS_KEY = 'dsv_viewed_problems';

function hasViewedProblem(problemId: string, userId?: string): boolean {
  try {
    const key = userId ? `${VIEWED_PROBLEMS_KEY}_${userId}` : VIEWED_PROBLEMS_KEY;
    const viewed = localStorage.getItem(key);
    if (!viewed) return false;
    const viewedSet: string[] = JSON.parse(viewed);
    return viewedSet.includes(problemId);
  } catch {
    return false;
  }
}

function markProblemAsViewed(problemId: string, userId?: string): void {
  try {
    const key = userId ? `${VIEWED_PROBLEMS_KEY}_${userId}` : VIEWED_PROBLEMS_KEY;
    const viewed = localStorage.getItem(key);
    const viewedSet: string[] = viewed ? JSON.parse(viewed) : [];
    if (!viewedSet.includes(problemId)) {
      viewedSet.push(problemId);
      // Keep only last 500 viewed problems to avoid localStorage bloat
      if (viewedSet.length > 500) {
        viewedSet.shift();
      }
      localStorage.setItem(key, JSON.stringify(viewedSet));
    }
  } catch {
    // Ignore localStorage errors
  }
}

// Fetch a single problem
export function useProblem(problemId: string | undefined) {
  const { communityUser } = useAuth();
  const [problem, setProblem] = useState<CommunityProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!problemId) {
      setLoading(false);
      return;
    }

    const fetchProblem = async () => {
      setLoading(true);
      setError(null);

      try {
        const docRef = doc(db, PROBLEMS_COLLECTION, problemId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          let problemData = {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as CommunityProblem;

          // Fetch current author data to ensure up-to-date info
          if (data.authorId) {
            try {
              const authorDoc = await getDoc(doc(db, 'users', data.authorId));
              if (authorDoc.exists()) {
                const authorData = authorDoc.data();
                problemData = {
                  ...problemData,
                  authorName: authorData.displayName || problemData.authorName,
                  authorAvatar: authorData.avatarUrl || null
                };
              }
            } catch (authorErr) {
              console.warn('Failed to fetch author data:', authorErr);
            }
          }

          setProblem(problemData);

          // Only increment view count if user hasn't viewed this problem before
          const userId = communityUser?.id;
          if (!hasViewedProblem(problemId, userId)) {
            // Mark as viewed in localStorage first
            markProblemAsViewed(problemId, userId);
            
            // Then increment in Firestore
            await updateDoc(docRef, {
              viewCount: increment(1)
            });
          }
        } else {
          setError('Problem not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch problem');
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId, communityUser?.id]);

  return { problem, loading, error };
}

// Rating labels for display
export const RATING_LABELS = {
  1: 'Very Bad',
  2: 'Bad', 
  3: 'Normal',
  4: 'Good',
  5: 'Very Good'
} as const;

// Rate a problem (1-5 stars)
export function useRateProblem() {
  const { communityUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);

  // Check if user has already rated this problem
  const checkUserRating = async (problemId: string) => {
    if (!communityUser) return null;
    
    try {
      const ratingRef = doc(db, 'ratings', `${communityUser.id}_${problemId}`);
      const ratingSnap = await getDoc(ratingRef);
      
      if (ratingSnap.exists()) {
        const rating = ratingSnap.data().rating as number;
        setUserRating(rating);
        return rating;
      }
      setUserRating(null);
      return null;
    } catch {
      return null;
    }
  };

  const rate = async (problemId: string, rating: number): Promise<boolean> => {
    if (!communityUser) return false;
    if (rating < 1 || rating > 5) return false;

    setLoading(true);
    try {
      const ratingRef = doc(db, 'ratings', `${communityUser.id}_${problemId}`);
      const ratingSnap = await getDoc(ratingRef);
      const problemRef = doc(db, PROBLEMS_COLLECTION, problemId);

      if (ratingSnap.exists()) {
        // User has already rated - update their rating
        const oldRating = ratingSnap.data().rating as number;
        
        if (oldRating === rating) {
          // Same rating, do nothing
          setLoading(false);
          return true;
        }
        
        // Update the rating document
        await updateDoc(ratingRef, { 
          rating,
          updatedAt: serverTimestamp()
        });
        
        // Update problem: subtract old rating, add new rating
        await updateDoc(problemRef, {
          totalRating: increment(rating - oldRating)
        });
      } else {
        // New rating
        await setDoc(ratingRef, {
          odcument: communityUser.id,
          odcumentName: communityUser.displayName,
          problemId,
          rating,
          createdAt: serverTimestamp()
        });
        
        // Update problem totals
        await updateDoc(problemRef, {
          totalRating: increment(rating),
          ratingCount: increment(1)
        });
      }

      setUserRating(rating);
      return true;
    } catch (err) {
      console.error('Rating error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { rate, checkUserRating, userRating, loading };
}

// Bookmark a problem
export function useBookmark() {
  const { communityUser, updateCommunityUser } = useAuth();

  const isBookmarked = (problemId: string) => {
    return communityUser?.bookmarkedProblems.includes(problemId) || false;
  };

  const toggleBookmark = async (problemId: string) => {
    if (!communityUser) return false;

    const currentBookmarks = communityUser.bookmarkedProblems || [];
    const isCurrentlyBookmarked = currentBookmarks.includes(problemId);

    const newBookmarks = isCurrentlyBookmarked
      ? currentBookmarks.filter(id => id !== problemId)
      : [...currentBookmarks, problemId];

    try {
      await updateCommunityUser({ bookmarkedProblems: newBookmarks });
      return true;
    } catch {
      return false;
    }
  };

  return { isBookmarked, toggleBookmark };
}

// Featured and trending problems
export function useFeaturedProblems() {
  const [problems, setProblems] = useState<CommunityProblem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Simple query - just get recent problems and filter client-side
        // This avoids needing composite indexes
        const q = query(
          collection(db, PROBLEMS_COLLECTION),
          orderBy('createdAt', 'desc'),
          limit(20)
        );

        const snapshot = await getDocs(q);
        const allProblems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as CommunityProblem[];

        // Filter for featured and active client-side
        let featured = allProblems.filter(p => p.status === 'active' && p.isFeatured);
        
        // If no featured problems, show top rated ones instead
        if (featured.length === 0) {
          featured = allProblems
            .filter(p => p.status === 'active')
            .sort((a, b) => {
              const avgA = a.ratingCount > 0 ? a.totalRating / a.ratingCount : 0;
              const avgB = b.ratingCount > 0 ? b.totalRating / b.ratingCount : 0;
              return avgB - avgA;
            })
            .slice(0, 5);
        }

        setProblems(featured.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch featured problems:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return { problems, loading };
}

export function useTrendingProblems() {
  const [problems, setProblems] = useState<CommunityProblem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // Simple query to avoid composite index requirements
        const q = query(
          collection(db, PROBLEMS_COLLECTION),
          orderBy('createdAt', 'desc'),
          limit(30)
        );

        const snapshot = await getDocs(q);
        const allProblems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as CommunityProblem[];

        // Filter active and sort by engagement (views + attempts + ratings)
        const trending = allProblems
          .filter(p => p.status === 'active')
          .sort((a, b) => {
            const scoreA = a.viewCount + (a.attemptCount * 2) + (a.ratingCount * 3);
            const scoreB = b.viewCount + (b.attemptCount * 2) + (b.ratingCount * 3);
            return scoreB - scoreA;
          })
          .slice(0, 10);

        setProblems(trending);
      } catch (err) {
        console.error('Failed to fetch trending problems:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return { problems, loading };
}
