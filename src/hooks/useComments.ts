import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../components/Auth/AuthProvider';
import { Comment } from '../types/community';

const COMMENTS_COLLECTION = 'comments';

// Fetch comments for a problem
export function useComments(problemId: string | undefined) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    console.log('fetchComments called with problemId:', problemId);
    
    if (!problemId) {
      console.log('No problemId provided, skipping fetch');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try query with ordering first
      let snapshot;
      try {
        const q = query(
          collection(db, COMMENTS_COLLECTION),
          where('problemId', '==', problemId),
          orderBy('createdAt', 'desc')
        );
        snapshot = await getDocs(q);
      } catch (indexError) {
        // Fallback: query without orderBy if composite index doesn't exist
        console.warn('Composite index not found, falling back to simple query:', indexError);
        const q = query(
          collection(db, COMMENTS_COLLECTION),
          where('problemId', '==', problemId)
        );
        snapshot = await getDocs(q);
      }

      console.log('Comments fetched:', snapshot.docs.length, 'for problemId:', problemId);
      
      const allComments: Comment[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Comment[];

      // Fetch current user data for all unique comment authors
      const uniqueUserIds = [...new Set(allComments.map(c => c.userId))];
      const userDataMap: Record<string, { displayName: string; avatarUrl: string | null; reputation: number }> = {};
      
      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              userDataMap[userId] = {
                displayName: userData.displayName || 'Unknown User',
                avatarUrl: userData.avatarUrl || null,
                reputation: userData.reputation || 0
              };
            }
          } catch (err) {
            console.warn(`Failed to fetch user data for ${userId}:`, err);
          }
        })
      );

      // Update comments with current user data
      const enrichedComments = allComments.map(comment => {
        const currentUserData = userDataMap[comment.userId];
        if (currentUserData) {
          return {
            ...comment,
            userName: currentUserData.displayName,
            userAvatar: currentUserData.avatarUrl,
            userReputation: currentUserData.reputation
          };
        }
        return comment;
      });

      // Sort by createdAt descending (newest first) - client-side sort for fallback
      enrichedComments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Organize into nested structure
      const topLevel = enrichedComments.filter(c => !c.parentCommentId);
      const nested = topLevel.map(comment => ({
        ...comment,
        replies: enrichedComments.filter(c => c.parentCommentId === comment.id)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      }));

      setComments(nested);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  }, [problemId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, loading, error, refresh: fetchComments };
}

// Add a new comment
export function useAddComment() {
  const { communityUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addComment = async (
    problemId: string,
    content: string,
    parentCommentId: string | null = null,
    codeBlock?: string,
    language?: string
  ): Promise<string | null> => {
    if (!communityUser) {
      setError('You must be logged in to comment');
      return null;
    }

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const newComment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'replies'> = {
        problemId,
        userId: communityUser.id,
        userName: communityUser.displayName,
        userAvatar: communityUser.avatarUrl,
        userReputation: communityUser.reputation,
        parentCommentId,
        content,
        upvotes: 0,
        downvotes: 0,
        isBestAnswer: false,
        isEdited: false
      };

      // Only add optional fields if they have values (Firestore doesn't accept undefined)
      const commentData: Record<string, unknown> = {
        ...newComment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      if (codeBlock) {
        commentData.codeBlock = codeBlock;
      }
      if (language) {
        commentData.language = language;
      }

      const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), commentData);
      console.log('Comment added successfully with ID:', docRef.id, 'for problemId:', problemId);

      // Increment comment count on problem
      const problemRef = doc(db, 'problems', problemId);
      await updateDoc(problemRef, {
        commentCount: increment(1)
      });

      return docRef.id;
    } catch (err) {
      console.error('Failed to add comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to add comment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { addComment, loading, error, clearError: () => setError(null) };
}

// Edit a comment
export function useEditComment() {
  const { communityUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editComment = async (
    commentId: string,
    content: string,
    codeBlock?: string
  ): Promise<boolean> => {
    if (!communityUser) {
      setError('You must be logged in');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
      const commentSnap = await getDoc(commentRef);

      if (!commentSnap.exists()) {
        setError('Comment not found');
        return false;
      }

      if (commentSnap.data().userId !== communityUser.id) {
        setError('You can only edit your own comments');
        return false;
      }

      // Build update data, excluding undefined values
      const updateData: { 
        content: string; 
        isEdited: boolean; 
        updatedAt: ReturnType<typeof serverTimestamp>;
        codeBlock?: string;
      } = {
        content,
        isEdited: true,
        updatedAt: serverTimestamp()
      };
      
      // Only include codeBlock if it's defined (or set to empty string to remove)
      if (codeBlock !== undefined) {
        updateData.codeBlock = codeBlock;
      }

      await updateDoc(commentRef, updateData);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit comment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { editComment, loading, error };
}

// Delete a comment
export function useDeleteComment() {
  const { communityUser, isAdmin, isModerator } = useAuth();
  const [loading, setLoading] = useState(false);

  const deleteComment = async (commentId: string, problemId: string): Promise<boolean> => {
    console.log('deleteComment called:', { commentId, problemId, userId: communityUser?.id, isAdmin, isModerator });
    
    if (!communityUser) {
      console.log('Delete failed: no user logged in');
      return false;
    }

    setLoading(true);

    try {
      const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
      const commentSnap = await getDoc(commentRef);

      if (!commentSnap.exists()) {
        console.log('Delete failed: comment not found');
        return false;
      }
      
      // Allow delete if user is owner, admin, or moderator
      const isOwner = commentSnap.data().userId === communityUser.id;
      if (!isOwner && !isAdmin && !isModerator) {
        console.log('Delete failed: not owner or admin. Comment userId:', commentSnap.data().userId, 'Current user:', communityUser.id);
        return false;
      }

      await deleteDoc(commentRef);
      console.log('Comment deleted successfully by', isOwner ? 'owner' : 'admin/mod');

      // Decrement comment count
      const problemRef = doc(db, 'problems', problemId);
      await updateDoc(problemRef, {
        commentCount: increment(-1)
      });

      return true;
    } catch (err) {
      console.error('Delete comment error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteComment, loading };
}

// Vote on a comment
export function useVoteComment() {
  const { communityUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const vote = async (commentId: string, voteType: 'up' | 'down'): Promise<boolean> => {
    console.log('vote function called:', { commentId, voteType, userId: communityUser?.id });
    
    if (!communityUser) {
      console.log('Vote failed: no user logged in');
      return false;
    }

    setLoading(true);

    try {
      const voteId = `${communityUser.id}_comment_${commentId}`;
      console.log('Vote ID:', voteId);
      
      const voteRef = doc(db, 'votes', voteId);
      const voteSnap = await getDoc(voteRef);
      const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
      
      // First verify the comment exists
      const commentSnap = await getDoc(commentRef);
      if (!commentSnap.exists()) {
        console.log('Vote failed: comment does not exist');
        return false;
      }
      console.log('Comment found:', commentSnap.id);

      if (voteSnap.exists()) {
        const existingVote = voteSnap.data().voteType;
        console.log('Existing vote found:', existingVote);

        if (existingVote === voteType) {
          // Remove vote (toggle off)
          console.log('Removing vote...');
          await deleteDoc(voteRef);
          await updateDoc(commentRef, {
            [voteType === 'up' ? 'upvotes' : 'downvotes']: increment(-1)
          });
          console.log('Vote removed successfully');
        } else {
          // Change vote direction
          console.log('Changing vote direction...');
          await updateDoc(voteRef, { voteType });
          await updateDoc(commentRef, {
            [existingVote === 'up' ? 'upvotes' : 'downvotes']: increment(-1),
            [voteType === 'up' ? 'upvotes' : 'downvotes']: increment(1)
          });
          console.log('Vote changed from', existingVote, 'to', voteType);
        }
      } else {
        // New vote - use setDoc with explicit ID instead of addDoc
        console.log('Creating new vote...');
        await setDoc(voteRef, {
          userId: communityUser.id,
          targetId: commentId,
          targetType: 'comment',
          voteType,
          createdAt: serverTimestamp()
        });
        console.log('Vote document created, now updating comment...');
        await updateDoc(commentRef, {
          [voteType === 'up' ? 'upvotes' : 'downvotes']: increment(1)
        });
        console.log('New vote added:', voteType);
      }

      return true;
    } catch (err) {
      console.error('Vote error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { vote, loading };
}

// Mark as best answer
export function useMarkBestAnswer() {
  const { communityUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const markBestAnswer = async (
    commentId: string,
    problemId: string,
    problemAuthorId: string
  ): Promise<boolean> => {
    if (!communityUser || communityUser.id !== problemAuthorId) {
      return false;
    }

    setLoading(true);

    try {
      // Unmark any existing best answer
      const existingBest = query(
        collection(db, COMMENTS_COLLECTION),
        where('problemId', '==', problemId),
        where('isBestAnswer', '==', true)
      );
      const existingSnapshot = await getDocs(existingBest);
      
      for (const docSnap of existingSnapshot.docs) {
        await updateDoc(doc(db, COMMENTS_COLLECTION, docSnap.id), {
          isBestAnswer: false
        });
      }

      // Mark new best answer
      await updateDoc(doc(db, COMMENTS_COLLECTION, commentId), {
        isBestAnswer: true
      });

      return true;
    } catch (err) {
      console.error('Mark best answer error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { markBestAnswer, loading };
}
