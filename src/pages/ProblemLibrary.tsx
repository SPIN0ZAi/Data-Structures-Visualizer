import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth, useAuthModals, LoginModal, SignupModal } from '../components/Auth';
import { useProblems, useBookmark } from '../hooks/useProblems';
import { ProblemFilters, ProblemCategory, ProblemDifficulty, ProblemType } from '../types/community';
import './ProblemLibrary.css';

const ProblemLibrary: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isGuest } = useAuth();
  const { loginOpen, signupOpen, openLogin, closeLogin, closeSignup, switchToSignup, switchToLogin } = useAuthModals();
  const { isBookmarked, toggleBookmark } = useBookmark();

  // Initialize filters from URL params
  const [filters, setFilters] = useState<ProblemFilters>({
    difficulty: (searchParams.get('difficulty') as ProblemDifficulty) || undefined,
    category: (searchParams.get('category') as ProblemCategory) || undefined,
    problemType: (searchParams.get('type') as ProblemType) || undefined,
    sortBy: (searchParams.get('sort') as ProblemFilters['sortBy']) || 'newest',
    search: searchParams.get('q') || ''
  });

  const { problems, loading, hasMore, loadMore, refresh } = useProblems(filters);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (filters.category) params.set('category', filters.category);
    if (filters.problemType) params.set('type', filters.problemType);
    if (filters.sortBy !== 'newest') params.set('sort', filters.sortBy);
    if (filters.search) params.set('q', filters.search);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleFilterChange = (key: keyof ProblemFilters, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const clearFilters = () => {
    setFilters({
      sortBy: 'newest',
      search: ''
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'var(--success)';
      case 'intermediate': return 'var(--warning)';
      case 'advanced': return 'var(--danger)';
      default: return 'var(--text-secondary)';
    }
  };

  const getProblemTypeLabel = (type: string) => {
    switch (type) {
      case 'algorithm': return '🧮 Algorithm';
      case 'conceptual': return '💡 Conceptual';
      case 'debugging': return '🐛 Debugging';
      case 'optimization': return '⚡ Optimization';
      default: return type;
    }
  };

  const handleBookmarkClick = async (e: React.MouseEvent, problemId: string) => {
    e.preventDefault();
    if (isGuest) {
      openLogin();
      return;
    }
    await toggleBookmark(problemId);
  };

  return (
    <div className="problem-library">
      <div className="library-header">
        <h1>📚 Problem Library</h1>
        <Link to="/community/submit" className="submit-btn">
          ✏️ Submit Problem
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder="Search problems..."
            value={filters.search || ''}
            onChange={handleSearchChange}
          />
        </div>

        <div className="filter-group">
          <select
            value={filters.difficulty || ''}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="BST">BST</option>
            <option value="AVL">AVL</option>
            <option value="Graph">Graph</option>
            <option value="Floyd">Floyd</option>
            <option value="Huffman">Huffman</option>
            <option value="Sorting">Sorting</option>
            <option value="Traversal">Traversal</option>
          </select>

          <select
            value={filters.problemType || ''}
            onChange={(e) => handleFilterChange('problemType', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="algorithm">Algorithm</option>
            <option value="conceptual">Conceptual</option>
            <option value="debugging">Debugging</option>
            <option value="optimization">Optimization</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="mostAttempted">Most Attempted</option>
            <option value="leastSolved">Least Solved</option>
          </select>
        </div>

        {(filters.difficulty || filters.category || filters.problemType || filters.search) && (
          <button className="clear-filters" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="results-info">
        <span>{problems.length} problems found</span>
        <button className="refresh-btn" onClick={refresh}>
          🔄 Refresh
        </button>
      </div>

      {/* Problem List */}
      <div className="problems-list">
        {loading && problems.length === 0 ? (
          <div className="loading-state">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="problem-card-skeleton"></div>
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3>No problems found</h3>
            <p>Try adjusting your filters or search query</p>
            <Link to="/community/submit" className="submit-btn">
              Be the first to submit a problem!
            </Link>
          </div>
        ) : (
          <>
            {problems.map(problem => (
              <Link 
                key={problem.id}
                to={`/community/problem/${problem.id}`}
                className="problem-card"
              >
                <div className="problem-main">
                  <div className="problem-header">
                    <span 
                      className="difficulty-badge"
                      style={{ background: getDifficultyColor(problem.difficulty) }}
                    >
                      {problem.difficulty}
                    </span>
                    <span className="category-badge">{problem.category}</span>
                    <span className="type-badge">{getProblemTypeLabel(problem.problemType)}</span>
                  </div>
                  
                  <h3 className="problem-title">{problem.title}</h3>
                  
                  <p className="problem-description">
                    {problem.description.substring(0, 150)}
                    {problem.description.length > 150 ? '...' : ''}
                  </p>
                  
                  <div className="problem-tags">
                    {problem.tags.slice(0, 5).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                    {problem.tags.length > 5 && (
                      <span className="tag more">+{problem.tags.length - 5}</span>
                    )}
                  </div>
                </div>

                <div className="problem-meta">
                  <div className="problem-stats">
                    <span className="stat rating" title="Rating">
                      ⭐ {problem.ratingCount > 0 
                        ? (problem.totalRating / problem.ratingCount).toFixed(1) 
                        : '-'}
                    </span>
                    <span className="stat" title="Comments">
                      💬 {problem.commentCount}
                    </span>
                    <span className="stat" title="Views">
                      👁️ {problem.viewCount}
                    </span>
                    <span className="stat" title="Attempts">
                      🎯 {problem.attemptCount}
                    </span>
                  </div>
                  
                  <div className="problem-author">
                    <span>by {problem.authorName}</span>
                    <span className="date">
                      {new Date(problem.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    className={`bookmark-btn ${isBookmarked(problem.id) ? 'active' : ''}`}
                    onClick={(e) => handleBookmarkClick(e, problem.id)}
                    title={isBookmarked(problem.id) ? 'Remove bookmark' : 'Bookmark'}
                  >
                    {isBookmarked(problem.id) ? '🔖' : '📄'}
                  </button>
                </div>
              </Link>
            ))}

            {hasMore && (
              <button 
                className="load-more-btn"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </>
        )}
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

export default ProblemLibrary;
