import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { auth, db, googleProvider } from '../../config/firebase';
import { CommunityUser, CREATOR_EMAILS, CREATOR_USER_IDS, UserRole } from '../../types/community';
import { compressImage } from '../../utils/imageUtils';

// Helper to determine user role
function getUserRole(email: string, uid?: string): UserRole {
  if (CREATOR_EMAILS.includes(email.toLowerCase()) || (uid && CREATOR_USER_IDS.includes(uid))) {
    return 'creator';
  }
  return 'user';
}

interface AuthContextType {
  currentUser: User | null;
  communityUser: CommunityUser | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
  isGuest: boolean;
  isCreator: boolean;
  isAdmin: boolean; // alias for isCreator
  isModerator: boolean;
  updateCommunityUser: (updates: Partial<CommunityUser>) => Promise<void>;
  updateProfilePicture: (file: File) => Promise<string>;
  removeProfilePicture: () => Promise<void>;
  syncAvatarToContent: () => Promise<{ comments: number; problems: number }>;
  assignRole: (userId: string, role: UserRole) => Promise<void>;
  deleteUserContent: (contentType: 'problem' | 'comment', contentId: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [communityUser, setCommunityUser] = useState<CommunityUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(true);

  // Create or update user document in Firestore
  async function createOrUpdateUserDoc(user: User): Promise<CommunityUser> {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    // Check if user should be creator based on email or user ID
    const shouldBeCreator = CREATOR_EMAILS.includes((user.email || '').toLowerCase()) || 
      CREATOR_USER_IDS.includes(user.uid);

    if (userSnap.exists()) {
      const existingUser = userSnap.data() as CommunityUser;
      const updates: { lastActive: ReturnType<typeof serverTimestamp>; role?: UserRole } = { lastActive: serverTimestamp() };
      
      // Always upgrade to creator if email/ID matches
      if (shouldBeCreator && existingUser.role !== 'creator') {
        updates.role = 'creator';
        console.log('Upgrading user to creator:', user.email);
      }
      
      await updateDoc(userRef, updates);
      const finalRole = shouldBeCreator ? 'creator' : existingUser.role;
      console.log('User role:', finalRole, 'for email:', user.email);
      return { ...existingUser, role: finalRole };
    } else {
      // Create new user document
      const role = getUserRole(user.email || '');
      const newUser: Omit<CommunityUser, 'createdAt' | 'lastActive'> & { createdAt: ReturnType<typeof serverTimestamp>, lastActive: ReturnType<typeof serverTimestamp> } = {
        id: user.uid,
        email: user.email || '',
        username: user.displayName?.toLowerCase().replace(/\s+/g, '_') || `user_${user.uid.slice(0, 8)}`,
        displayName: user.displayName || 'Anonymous User',
        avatarUrl: user.photoURL,
        reputation: 0,
        badges: [],
        role: role,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        bio: '',
        favoriteTopics: [],
        bookmarkedProblems: [],
        followingTopics: []
      };

      await setDoc(userRef, newUser);
      
      return {
        ...newUser,
        createdAt: new Date(),
        lastActive: new Date()
      } as CommunityUser;
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const communityUserData = await createOrUpdateUserDoc(user);
          setCommunityUser(communityUserData);
          setIsGuest(false);
        } catch (err) {
          console.error('Error fetching community user:', err);
          setError('Failed to load user profile');
        }
      } else {
        setCommunityUser(null);
        setIsGuest(true);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const communityUserData = await createOrUpdateUserDoc(result.user);
      setCommunityUser(communityUserData);
      setIsGuest(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function signInWithEmail(email: string, password: string) {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const communityUserData = await createOrUpdateUserDoc(result.user);
      setCommunityUser(communityUserData);
      setIsGuest(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function signUpWithEmail(email: string, password: string, username: string) {
    try {
      setError(null);
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with username
      await updateProfile(result.user, {
        displayName: username
      });

      const communityUserData = await createOrUpdateUserDoc(result.user);
      setCommunityUser(communityUserData);
      setIsGuest(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      setError(null);
      await signOut(auth);
      setCommunityUser(null);
      setIsGuest(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to log out';
      setError(errorMessage);
      throw err;
    }
  }

  function continueAsGuest() {
    setIsGuest(true);
    setLoading(false);
  }

  async function updateCommunityUser(updates: Partial<CommunityUser>) {
    if (!currentUser || !communityUser) {
      throw new Error('No user logged in');
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...updates,
        lastActive: serverTimestamp()
      });

      setCommunityUser({
        ...communityUser,
        ...updates
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw err;
    }
  }

  async function updateProfilePicture(file: File): Promise<string> {
    if (!currentUser || !communityUser) {
      throw new Error('No user logged in');
    }

    try {
      // Compress and convert image to Base64 (200x200 max, JPEG quality 0.8)
      // This stores the image directly in Firestore - no Firebase Storage needed!
      console.log('Compressing image...');
      const compressed = await compressImage(file, 200, 200, 0.8);
      console.log(`Compressed to ${compressed.width}x${compressed.height}, ${compressed.sizeKB}KB`);
      
      // Check if compressed image is too large for Firestore (max ~1MB per document)
      if (compressed.sizeKB > 500) {
        throw new Error('Image too large. Please use a smaller image.');
      }
      
      const base64Url = compressed.base64;
      
      // Update Firebase Auth profile (Auth doesn't support data URLs, so we skip this)
      // Note: photoURL in Auth must be a regular URL, so we only store in Firestore
      
      // Update Firestore user document with Base64 image
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        avatarUrl: base64Url,
        lastActive: serverTimestamp()
      });
      
      console.log('Profile picture saved to Firestore');
      
      // Update all comments by this user to have the new avatar
      try {
        const commentsQuery = query(
          collection(db, 'comments'),
          where('userId', '==', currentUser.uid)
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        
        if (!commentsSnapshot.empty) {
          const batch = writeBatch(db);
          commentsSnapshot.docs.forEach((commentDoc) => {
            batch.update(commentDoc.ref, { userAvatar: base64Url });
          });
          await batch.commit();
          console.log(`Updated avatar in ${commentsSnapshot.docs.length} comments`);
        }
      } catch (commentErr) {
        // Don't fail the whole operation if comment update fails
        console.warn('Failed to update avatar in comments:', commentErr);
      }
      
      // Update all problems by this user to have the new author avatar
      try {
        const problemsQuery = query(
          collection(db, 'problems'),
          where('authorId', '==', currentUser.uid)
        );
        const problemsSnapshot = await getDocs(problemsQuery);
        
        if (!problemsSnapshot.empty) {
          const batch = writeBatch(db);
          problemsSnapshot.docs.forEach((problemDoc) => {
            batch.update(problemDoc.ref, { authorAvatar: base64Url });
          });
          await batch.commit();
          console.log(`Updated avatar in ${problemsSnapshot.docs.length} problems`);
        }
      } catch (problemErr) {
        console.warn('Failed to update avatar in problems:', problemErr);
      }
      
      // Update local state
      setCommunityUser({
        ...communityUser,
        avatarUrl: base64Url
      });
      
      return base64Url;
    } catch (err: unknown) {
      console.error('Profile picture upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload profile picture';
      setError(errorMessage);
      throw err;
    }
  }

  async function removeProfilePicture(): Promise<void> {
    if (!currentUser || !communityUser) {
      throw new Error('No user logged in');
    }

    try {
      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        photoURL: null
      });
      
      // Update Firestore user document - just set to null
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        avatarUrl: null,
        lastActive: serverTimestamp()
      });
      
      // Update all comments by this user to remove the avatar
      try {
        const commentsQuery = query(
          collection(db, 'comments'),
          where('userId', '==', currentUser.uid)
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        
        if (!commentsSnapshot.empty) {
          const batch = writeBatch(db);
          commentsSnapshot.docs.forEach((commentDoc) => {
            batch.update(commentDoc.ref, { userAvatar: null });
          });
          await batch.commit();
          console.log(`Removed avatar from ${commentsSnapshot.docs.length} comments`);
        }
      } catch (commentErr) {
        console.warn('Failed to remove avatar from comments:', commentErr);
      }
      
      // Update all problems by this user to remove the author avatar
      try {
        const problemsQuery = query(
          collection(db, 'problems'),
          where('authorId', '==', currentUser.uid)
        );
        const problemsSnapshot = await getDocs(problemsQuery);
        
        if (!problemsSnapshot.empty) {
          const batch = writeBatch(db);
          problemsSnapshot.docs.forEach((problemDoc) => {
            batch.update(problemDoc.ref, { authorAvatar: null });
          });
          await batch.commit();
          console.log(`Removed avatar from ${problemsSnapshot.docs.length} problems`);
        }
      } catch (problemErr) {
        console.warn('Failed to remove avatar from problems:', problemErr);
      }
      
      // Update local state
      setCommunityUser({
        ...communityUser,
        avatarUrl: null
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove profile picture';
      setError(errorMessage);
      throw err;
    }
  }

  function clearError() {
    setError(null);
  }

  // Sync current avatar to all user's comments and problems
  async function syncAvatarToContent(): Promise<{ comments: number; problems: number }> {
    if (!currentUser || !communityUser) {
      throw new Error('No user logged in');
    }

    const avatarUrl = communityUser.avatarUrl;
    let commentsUpdated = 0;
    let problemsUpdated = 0;

    // Update all comments by this user
    try {
      const commentsQuery = query(
        collection(db, 'comments'),
        where('userId', '==', currentUser.uid)
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      
      if (!commentsSnapshot.empty) {
        const batch = writeBatch(db);
        commentsSnapshot.docs.forEach((commentDoc) => {
          batch.update(commentDoc.ref, { userAvatar: avatarUrl });
        });
        await batch.commit();
        commentsUpdated = commentsSnapshot.docs.length;
        console.log(`Synced avatar to ${commentsUpdated} comments`);
      }
    } catch (err) {
      console.error('Failed to sync avatar to comments:', err);
    }

    // Update all problems by this user
    try {
      const problemsQuery = query(
        collection(db, 'problems'),
        where('authorId', '==', currentUser.uid)
      );
      const problemsSnapshot = await getDocs(problemsQuery);
      
      if (!problemsSnapshot.empty) {
        const batch = writeBatch(db);
        problemsSnapshot.docs.forEach((problemDoc) => {
          batch.update(problemDoc.ref, { authorAvatar: avatarUrl });
        });
        await batch.commit();
        problemsUpdated = problemsSnapshot.docs.length;
        console.log(`Synced avatar to ${problemsUpdated} problems`);
      }
    } catch (err) {
      console.error('Failed to sync avatar to problems:', err);
    }

    return { comments: commentsUpdated, problems: problemsUpdated };
  }

  // Creator/Admin functions - check Firestore role, email list, AND user ID list
  const isCreator = communityUser?.role === 'creator' || 
    CREATOR_EMAILS.includes((communityUser?.email || '').toLowerCase()) ||
    CREATOR_USER_IDS.includes(communityUser?.id || '');
  const isModerator = communityUser?.role === 'moderator' || isCreator;
  
  // isAdmin is an alias for isCreator (for backwards compatibility)
  const isAdmin = isCreator;

  async function assignRole(userId: string, role: UserRole): Promise<void> {
    if (!isCreator) {
      throw new Error('Only the creator can assign roles');
    }

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign role';
      setError(errorMessage);
      throw err;
    }
  }

  async function deleteUserContent(contentType: 'problem' | 'comment', contentId: string): Promise<void> {
    if (!isModerator) {
      throw new Error('Only moderators can delete content');
    }

    try {
      const collectionName = contentType === 'problem' ? 'problems' : 'comments';
      const contentRef = doc(db, collectionName, contentId);
      
      // Instead of deleting, we mark as deleted (soft delete)
      await updateDoc(contentRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: currentUser?.uid
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete content';
      setError(errorMessage);
      throw err;
    }
  }

  const value: AuthContextType = {
    currentUser,
    communityUser,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    continueAsGuest,
    isGuest,
    isCreator,
    isAdmin,
    isModerator,
    updateCommunityUser,
    updateProfilePicture,
    removeProfilePicture,
    syncAvatarToContent,
    assignRole,
    deleteUserContent,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
