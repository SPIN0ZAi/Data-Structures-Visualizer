import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useAuthModals, LoginModal, SignupModal } from '../components/Auth';
import { useTrendingProblems, useFeaturedProblems } from '../hooks/useProblems';
import { useLeaderboard } from '../hooks/useReputation';
import './CommunityHub.css';

const CommunityHub: React.FC = () => {
  const { communityUser, isGuest } = useAuth();
  const { problems: trendingProblems, loading: trendingLoading } = useTrendingProblems();
  const { problems: featuredProblems, loading: featuredLoading } = useFeaturedProblems();
  const { leaderboard, loading: leaderboardLoading } = useLeaderboard('weekly');
  const { loginOpen, signupOpen, openLogin, closeLogin, openSignup, closeSignup, switchToSignup, switchToLogin } = useAuthModals();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'var(--success)';
      case 'intermediate': return 'var(--warning)';
      case 'advanced': return 'var(--danger)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="community-hub">
      {/* Hero Section */}
      <section className="community-hero">
        <div className="hero-content">
          <h1>🌳 Community Hub</h1>
          <p>Learn together, solve problems, share knowledge</p>
          {isGuest ? (
            <div className="hero-actions">
              <button className="btn-primary" onClick={openSignup}>
                Join the Community
              </button>
              <button className="btn-secondary" onClick={openLogin}>
                Sign In
              </button>
            </div>
          ) : (
            <div className="hero-user-welcome">
              <span>Welcome back, {communityUser?.displayName}!</span>
              <Link to="/community/submit" className="btn-primary">
                Submit a Problem
              </Link>
            </div>
          )}
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">{trendingProblems.length}+</span>
            <span className="stat-label">Problems</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{leaderboard.length}+</span>
            <span className="stat-label">Contributors</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">∞</span>
            <span className="stat-label">Learning</span>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <Link to="/community/problems" className="action-card">
          <span className="action-icon">📚</span>
          <div className="action-text">
            <h3>Browse Problems</h3>
            <p>Explore community-submitted challenges</p>
          </div>
        </Link>
        <Link to="/community/submit" className="action-card">
          <span className="action-icon">✏️</span>
          <div className="action-text">
            <h3>Submit Problem</h3>
            <p>Share your own algorithm challenges</p>
          </div>
        </Link>
        <Link to="/community/leaderboard" className="action-card">
          <span className="action-icon">🏆</span>
          <div className="action-text">
            <h3>Leaderboard</h3>
            <p>See top contributors</p>
          </div>
        </Link>
      </section>

      <div className="community-grid">
        {/* Featured Problems */}
        <section className="featured-section">
          <div className="section-header">
            <h2>⭐ Featured Problems</h2>
            <Link to="/community/problems?featured=true">View All</Link>
          </div>
          {featuredLoading ? (
            <div className="loading-skeleton">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-card"></div>
              ))}
            </div>
          ) : featuredProblems.length > 0 ? (
            <div className="featured-list">
              {featuredProblems.map(problem => (
                <Link 
                  key={problem.id} 
                  to={`/community/problem/${problem.id}`}
                  className="featured-card"
                >
                  <div className="featured-header">
                    <span 
                      className="difficulty-badge"
                      style={{ color: getDifficultyColor(problem.difficulty) }}
                    >
                      {problem.difficulty}
                    </span>
                    <span className="category-tag">{problem.category}</span>
                  </div>
                  <h3>{problem.title}</h3>
                  <p>{problem.description.substring(0, 100)}...</p>
                  <div className="featured-stats">
                    <span>⭐ {problem.ratingCount > 0 ? (problem.totalRating / problem.ratingCount).toFixed(1) : '-'}</span>
                    <span>💬 {problem.commentCount}</span>
                    <span>👁️ {problem.viewCount}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No featured problems yet. Be the first to submit!</p>
              <Link to="/community/submit" className="btn-primary">
                Submit a Problem
              </Link>
            </div>
          )}
        </section>

        {/* Trending Problems */}
        <section className="trending-section">
          <div className="section-header">
            <h2>🔥 Trending</h2>
            <Link to="/community/problems?sort=popular">View All</Link>
          </div>
          {trendingLoading ? (
            <div className="loading-skeleton">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skeleton-row"></div>
              ))}
            </div>
          ) : (
            <div className="trending-list">
              {trendingProblems.slice(0, 5).map((problem, index) => (
                <Link 
                  key={problem.id} 
                  to={`/community/problem/${problem.id}`}
                  className="trending-item"
                >
                  <span className="trending-rank">#{index + 1}</span>
                  <div className="trending-info">
                    <h4>{problem.title}</h4>
                    <div className="trending-meta">
                      <span style={{ color: getDifficultyColor(problem.difficulty) }}>
                        {problem.difficulty}
                      </span>
                      <span>•</span>
                      <span>{problem.category}</span>
                    </div>
                  </div>
                  <span className="trending-votes">
                    ⭐ {problem.ratingCount > 0 
                      ? (problem.totalRating / problem.ratingCount).toFixed(1) 
                      : '—'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Leaderboard Preview */}
        <section className="leaderboard-section">
          <div className="section-header">
            <h2>🏅 Top Contributors</h2>
            <Link to="/community/leaderboard">Full Leaderboard</Link>
          </div>
          {leaderboardLoading ? (
            <div className="loading-skeleton">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skeleton-row"></div>
              ))}
            </div>
          ) : (
            <div className="leaderboard-list">
              {leaderboard.slice(0, 5).map((entry) => (
                <Link 
                  key={entry.userId} 
                  to={`/community/user/${entry.userId}`}
                  className="leaderboard-item"
                >
                  <span className={`rank rank-${entry.rank}`}>
                    {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                  </span>
                  <div className="user-info">
                    {entry.userAvatar ? (
                      <img src={entry.userAvatar} alt="" className="user-avatar" />
                    ) : (
                      <div className="user-avatar-placeholder">
                        {entry.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="user-name">{entry.userName}</span>
                  </div>
                  <span className="user-reputation">{entry.reputation} pts</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Categories */}
        <section className="categories-section">
          <div className="section-header">
            <h2>📂 Categories</h2>
          </div>
          <div className="categories-grid">
            {['BST', 'AVL', 'Graph', 'Floyd', 'Huffman', 'Sorting', 'Traversal'].map(cat => (
              <Link 
                key={cat}
                to={`/community/problems?category=${cat}`}
                className="category-card"
              >
                <span className="category-icon">
                  {cat === 'BST' || cat === 'AVL' ? '🌳' :
                   cat === 'Graph' ? '🕸️' :
                   cat === 'Floyd' ? '🛤️' :
                   cat === 'Huffman' ? '🗜️' :
                   cat === 'Sorting' ? '📊' : '🔄'}
                </span>
                <span className="category-name">{cat}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Auth Modals */}
      <LoginModal 
        isOpen={loginOpen} 
        onClose={closeLogin} 
        onSwitchToSignup={switchToSignup}
      />
      <SignupModal 
        isOpen={signupOpen} 
        onClose={closeSignup} 
        onSwitchToLogin={switchToLogin}
      />
    </div>
  );
};

export default CommunityHub;
