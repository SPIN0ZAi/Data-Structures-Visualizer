import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { collection, query, getDocs, orderBy, limit, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../components/Auth/AuthProvider';
import { CommunityUser, CommunityProblem, UserRole } from '../types/community';
import ProfilePicture from '../components/ProfilePicture/ProfilePicture';
import './AdminPanel.css';

interface UserWithId extends CommunityUser {
  id: string;
}

interface ProblemWithId extends CommunityProblem {
  id: string;
}

const AdminPanel: React.FC = () => {
  const { currentUser, isAdmin, isModerator, assignRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'problems' | 'stats'>('users');
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [problems, setProblems] = useState<ProblemWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Redirect non-admins
  if (!currentUser || (!isAdmin && !isModerator)) {
    return <Navigate to="/community" replace />;
  }

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const usersQuery = query(
          collection(db, 'users'),
          orderBy('reputation', 'desc'),
          limit(50)
        );
        const snapshot = await getDocs(usersQuery);
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserWithId[];
        setUsers(usersData);
      } else if (activeTab === 'problems') {
        const problemsQuery = query(
          collection(db, 'problems'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        const snapshot = await getDocs(problemsQuery);
        const problemsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ProblemWithId[];
        setProblems(problemsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!isAdmin) {
      setMessage({ type: 'error', text: 'Only admins can change roles' });
      return;
    }

    setActionLoading(userId);
    try {
      await assignRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setMessage({ type: 'success', text: `Role updated to ${newRole}` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update role' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProblem = async (problemId: string) => {
    if (!confirm('Are you sure you want to delete this problem? This action cannot be undone.')) {
      return;
    }

    setActionLoading(problemId);
    try {
      await deleteDoc(doc(db, 'problems', problemId));
      setProblems(problems.filter(p => p.id !== problemId));
      setMessage({ type: 'success', text: 'Problem deleted successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete problem' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (problemId: string, currentFeatured: boolean) => {
    setActionLoading(problemId);
    try {
      await updateDoc(doc(db, 'problems', problemId), {
        isFeatured: !currentFeatured
      });
      setProblems(problems.map(p => 
        p.id === problemId ? { ...p, isFeatured: !currentFeatured } : p
      ));
      setMessage({ type: 'success', text: `Problem ${!currentFeatured ? 'featured' : 'unfeatured'}` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update problem' });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-title">
          <span className="admin-icon">🛡️</span>
          <div>
            <h1>Admin Panel</h1>
            <p>Manage users, content, and platform settings</p>
          </div>
        </div>
        <div className="admin-role-badge">
          {isAdmin ? '👑 Admin' : '🔧 Moderator'}
        </div>
      </div>

      {message && (
        <div className={`admin-message ${message.type}`}>
          <span className="message-icon">{message.type === 'success' ? '✅' : '❌'}</span>
          {message.text}
          <button className="message-close" onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button 
          className={`admin-tab ${activeTab === 'problems' ? 'active' : ''}`}
          onClick={() => setActiveTab('problems')}
        >
          📚 Problems
        </button>
        <button 
          className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistics
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        {loading ? (
          <div className="admin-loading">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="users-management">
                <div className="section-header">
                  <h2>User Management</h2>
                  <span className="count">{users.length} users</span>
                </div>
                
                <div className="users-table">
                  <div className="table-header">
                    <span>User</span>
                    <span>Email</span>
                    <span>Reputation</span>
                    <span>Role</span>
                    <span>Joined</span>
                    <span>Actions</span>
                  </div>
                  
                  {users.map(user => (
                    <div key={user.id} className="table-row">
                      <div className="user-cell">
                        <ProfilePicture 
                          src={user.avatarUrl}
                          name={user.displayName}
                          size="sm"
                        />
                        <Link to={`/community/user/${user.id}`} className="user-name">
                          {user.displayName}
                        </Link>
                      </div>
                      <div className="email-cell">
                        {user.email}
                      </div>
                      <div className="reputation-cell">
                        ⭐ {user.reputation}
                      </div>
                      <div className="role-cell">
                        {isAdmin ? (
                          <select 
                            value={user.role || 'user'}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                            disabled={actionLoading === user.id || user.email === currentUser?.email}
                            className={`role-select ${user.role || 'user'}`}
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`role-badge ${user.role || 'user'}`}>
                            {user.role || 'user'}
                          </span>
                        )}
                      </div>
                      <div className="date-cell">
                        {formatDate(user.createdAt)}
                      </div>
                      <div className="actions-cell">
                        <Link 
                          to={`/community/user/${user.id}`}
                          className="action-btn view"
                          title="View Profile"
                        >
                          👁️
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Problems Tab */}
            {activeTab === 'problems' && (
              <div className="problems-management">
                <div className="section-header">
                  <h2>Problem Management</h2>
                  <span className="count">{problems.length} problems</span>
                </div>
                
                <div className="problems-table">
                  <div className="table-header">
                    <span>Title</span>
                    <span>Author</span>
                    <span>Difficulty</span>
                    <span>Stats</span>
                    <span>Created</span>
                    <span>Actions</span>
                  </div>
                  
                  {problems.map(problem => (
                    <div key={problem.id} className="table-row">
                      <div className="title-cell">
                        <Link to={`/community/problem/${problem.id}`} className="problem-title">
                          {problem.title}
                        </Link>
                        {problem.isFeatured && <span className="featured-badge">⭐ Featured</span>}
                      </div>
                      <div className="author-cell">
                        <Link to={`/community/user/${problem.authorId}`}>
                          {problem.authorName}
                        </Link>
                      </div>
                      <div className="difficulty-cell">
                        <span className={`difficulty-badge ${problem.difficulty}`}>
                          {problem.difficulty}
                        </span>
                      </div>
                      <div className="stats-cell">
                        <span>⭐ {problem.ratingCount > 0 ? (problem.totalRating / problem.ratingCount).toFixed(1) : '—'}</span>
                        <span>({problem.ratingCount || 0})</span>
                      </div>
                      <div className="date-cell">
                        {formatDate(problem.createdAt)}
                      </div>
                      <div className="actions-cell">
                        <button 
                          className={`action-btn ${problem.isFeatured ? 'unfeature' : 'feature'}`}
                          onClick={() => handleToggleFeatured(problem.id, problem.isFeatured || false)}
                          disabled={actionLoading === problem.id}
                          title={problem.isFeatured ? 'Remove from featured' : 'Add to featured'}
                        >
                          {problem.isFeatured ? '⭐' : '☆'}
                        </button>
                        <Link 
                          to={`/community/problem/${problem.id}`}
                          className="action-btn view"
                          title="View Problem"
                        >
                          👁️
                        </Link>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDeleteProblem(problem.id)}
                          disabled={actionLoading === problem.id}
                          title="Delete Problem"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="stats-overview">
                <div className="section-header">
                  <h2>Platform Statistics</h2>
                </div>
                
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-icon">👥</span>
                    <div className="stat-info">
                      <span className="stat-value">{users.length}</span>
                      <span className="stat-label">Total Users</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon">📚</span>
                    <div className="stat-info">
                      <span className="stat-value">{problems.length}</span>
                      <span className="stat-label">Total Problems</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon">🛡️</span>
                    <div className="stat-info">
                      <span className="stat-value">{users.filter(u => u.role === 'creator').length}</span>
                      <span className="stat-label">Creators</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon">🔧</span>
                    <div className="stat-info">
                      <span className="stat-value">{users.filter(u => u.role === 'moderator').length}</span>
                      <span className="stat-label">Moderators</span>
                    </div>
                  </div>
                </div>

                <div className="recent-activity">
                  <h3>Quick Actions</h3>
                  <div className="quick-actions">
                    <Link to="/community/submit" className="quick-action-btn">
                      ✏️ Create Problem
                    </Link>
                    <Link to="/community/problems" className="quick-action-btn">
                      📖 View All Problems
                    </Link>
                    <Link to="/community/leaderboard" className="quick-action-btn">
                      🏆 View Leaderboard
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
