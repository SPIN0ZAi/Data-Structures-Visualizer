import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../components/Auth/AuthProvider';
import { CommunityUser, CommunityProblem, Comment } from '../types/community';
import { getUserRank, getRankProgress, SPECIAL_RANKS, calculateAverageRating } from '../utils/userRanks';
import ProfilePicture from '../components/ProfilePicture/ProfilePicture';
import './UserProfile.css';

interface UserStats {
  totalProblems: number;
  totalComments: number;
  bestAnswers: number;
  averageRating: number;
}

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { communityUser: currentUser } = useAuth();
  const [user, setUser] = useState<CommunityUser | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalProblems: 0,
    totalComments: 0,
    bestAnswers: 0,
    averageRating: 0,
  });
  const [userProblems, setUserProblems] = useState<CommunityProblem[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'problems' | 'activity' | 'badges'>('problems');
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        // Fetch user profile
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as CommunityUser);
        }

        // Check if this is the current user's profile
        setIsOwnProfile(currentUser?.id === userId);

        // Fetch user's problems - simple query without orderBy to avoid index requirements
        const problemsQuery = query(
          collection(db, 'problems'),
          where('authorId', '==', userId),
          limit(20)
        );
        const problemsSnapshot = await getDocs(problemsQuery);
        const problems = problemsSnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date()
        })) as CommunityProblem[];
        
        // Sort client-side
        problems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setUserProblems(problems.slice(0, 10));

        // Calculate average rating from all user's problems
        const avgRating = calculateAverageRating(problems);

        // Fetch comments for stats - simple query
        const commentsQuery = query(
          collection(db, 'comments'),
          where('userId', '==', userId),
          limit(50)
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        const comments = commentsSnapshot.docs.map(docSnap => ({
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate?.() || new Date()
        })) as Comment[];
        
        let bestAnswerCount = 0;
        comments.forEach(c => {
          if (c.isBestAnswer) bestAnswerCount++;
        });

        setStats({
          totalProblems: problems.length,
          totalComments: comments.length,
          bestAnswers: bestAnswerCount,
          averageRating: avgRating,
        });

        // Recent activity (simplified - just show recent problems and comments)
        const activity = [
          ...problems.slice(0, 5).map(p => ({
            type: 'problem' as const,
            title: `Submitted "${p.title}"`,
            date: p.createdAt,
            link: `/community/problem/${p.id}`,
          })),
          ...comments.slice(0, 5).map(c => ({
            type: 'comment' as const,
            title: c.isBestAnswer ? 'Best answer on a problem' : 'Commented on a problem',
            date: c.createdAt,
            link: `/community/problem/${c.problemId}`,
          })),
        ].sort((a, b) => {
          const getTime = (d: any) => d instanceof Date ? d.getTime() : (d?.toMillis ? d.toMillis() : 0);
          return getTime(b.date) - getTime(a.date);
        }).slice(0, 10);

        setRecentActivity(activity);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, currentUser]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Get user's rank based on reputation
  const userRank = user ? getUserRank(user.reputation) : null;
  const rankProgress = user ? getRankProgress(user.reputation) : null;
  
  // Check if user has a special role
  const getSpecialRank = () => {
    if (!user) return null;
    if (user.role === 'creator') return SPECIAL_RANKS.owner; // Owner/Creator for you specifically
    if (user.role === 'moderator') return SPECIAL_RANKS.moderator;
    return null;
  };
  const specialRank = getSpecialRank();

  if (!user) {
    return (
      <div className="user-profile-page">
        <div className="profile-not-found">
          <span className="not-found-icon">😢</span>
          <h2>User not found</h2>
          <p>The user you're looking for doesn't exist or has been removed.</p>
          <Link to="/community" className="btn-back">
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          <ProfilePicture
            src={user.avatarUrl}
            name={user.displayName}
            size="xl"
          />
          {specialRank && (
            <span 
              className="special-rank-badge"
              style={{ backgroundColor: specialRank.color }}
              title={specialRank.description}
            >
              {specialRank.icon}
            </span>
          )}
        </div>
        <div className="profile-info">
          <div className="profile-name-row">
            <h1>{user.displayName}</h1>
            {specialRank && (
              <span 
                className="role-badge"
                style={{ backgroundColor: specialRank.color }}
              >
                {specialRank.title}
              </span>
            )}
          </div>
          
          {/* User Rank */}
          <div className="user-rank" style={{ color: userRank?.color }}>
            <span className="rank-icon">{userRank?.icon}</span>
            <span className="rank-title">{userRank?.titleSpanish}</span>
            <span className="rank-reputation">({user.reputation} rep)</span>
          </div>
          
          {/* Rank Progress Bar */}
          {rankProgress?.next && (
            <div className="rank-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${rankProgress.progress}%`, backgroundColor: userRank?.color }}
                />
              </div>
              <span className="progress-text">
                {Math.round(rankProgress.progress)}% to {rankProgress.next.titleSpanish}
              </span>
            </div>
          )}
          
          {user.bio && <p className="profile-bio">{user.bio}</p>}
          <div className="profile-meta">
            <span className="meta-item">
              📅 Joined {formatDate(user.createdAt)}
            </span>
            {user.location && (
              <span className="meta-item">
                📍 {user.location}
              </span>
            )}
          </div>
          {isOwnProfile && (
            <Link to="/community/settings" className="btn-edit-profile">
              Edit Profile
            </Link>
          )}
        </div>
        <div className="profile-reputation">
          <div className="reputation-circle">
            <span className="reputation-value">{user.reputation}</span>
            <span className="reputation-label">Reputation</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📝</span>
          <span className="stat-value">{stats.totalProblems}</span>
          <span className="stat-label">Problems</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">💬</span>
          <span className="stat-value">{stats.totalComments}</span>
          <span className="stat-label">Comments</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <span className="stat-value">{stats.bestAnswers}</span>
          <span className="stat-label">Best Answers</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⭐</span>
          <span className="stat-value">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}</span>
          <span className="stat-label">Avg Rating</span>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'problems' ? 'active' : ''}`}
          onClick={() => setActiveTab('problems')}
        >
          Problems ({stats.totalProblems})
        </button>
        <button
          className={`profile-tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
        <button
          className={`profile-tab ${activeTab === 'badges' ? 'active' : ''}`}
          onClick={() => setActiveTab('badges')}
        >
          Badges ({user.badges?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'problems' && (
          <div className="problems-list">
            {userProblems.length === 0 ? (
              <div className="empty-tab">
                <span className="empty-icon">📝</span>
                <p>No problems submitted yet</p>
                {isOwnProfile && (
                  <Link to="/community/submit" className="btn-primary">
                    Submit Your First Problem
                  </Link>
                )}
              </div>
            ) : (
              userProblems.map(problem => (
                <Link
                  key={problem.id}
                  to={`/community/problem/${problem.id}`}
                  className="problem-item"
                >
                  <div className="problem-main">
                    <h3>{problem.title}</h3>
                    <p>{problem.description.substring(0, 120)}...</p>
                  </div>
                  <div className="problem-meta">
                    <span className={`difficulty-badge ${getDifficultyClass(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                    <span className="problem-stats">
                      ⭐ {problem.ratingCount > 0 ? (problem.totalRating / problem.ratingCount).toFixed(1) : '-'} | 💬 {problem.commentCount}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <div className="empty-tab">
                <span className="empty-icon">📊</span>
                <p>No recent activity</p>
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <Link
                  key={index}
                  to={activity.link}
                  className="activity-item"
                >
                  <span className="activity-icon">
                    {activity.type === 'problem' ? '📝' : '💬'}
                  </span>
                  <div className="activity-content">
                    <span className="activity-title">{activity.title}</span>
                    <span className="activity-date">{formatDate(activity.date)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="badges-grid">
            {(!user.badges || user.badges.length === 0) ? (
              <div className="empty-tab">
                <span className="empty-icon">🏅</span>
                <p>No badges earned yet</p>
                <span className="empty-hint">
                  Keep contributing to earn badges!
                </span>
              </div>
            ) : (
              user.badges.map(badge => (
                <div key={badge.id} className="badge-card">
                  <span className="badge-emoji">{badge.emoji}</span>
                  <h4>{badge.name}</h4>
                  <p>{badge.description}</p>
                  <span className="badge-date">
                    {badge.earnedAt instanceof Date 
                      ? badge.earnedAt.toLocaleDateString() 
                      : 'Earned'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
