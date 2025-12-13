import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth, useAuthModals, LoginModal, SignupModal } from '../components/Auth';
import { useProblem, useRateProblem, useBookmark, useDeleteProblem, RATING_LABELS } from '../hooks/useProblems';
import { useComments, useAddComment, useVoteComment, useMarkBestAnswer, useDeleteComment } from '../hooks/useComments';
import { useReputation } from '../hooks/useReputation';
import { Comment } from '../types/community';
import './ProblemDetail.css';

const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { communityUser, isGuest, isAdmin, isModerator } = useAuth();
  const { problem, loading, error } = useProblem(id);
  const { comments, loading: commentsLoading, refresh: refreshComments } = useComments(id);
  const { rate, checkUserRating, userRating, loading: ratingLoading } = useRateProblem();
  const { vote: voteComment } = useVoteComment();
  const { markBestAnswer } = useMarkBestAnswer();
  const { addComment, loading: commentLoading, error: commentError } = useAddComment();
  const { deleteComment, loading: deleteLoading } = useDeleteComment();
  const { deleteProblem, loading: deleteProblemLoading } = useDeleteProblem();
  const { addReputation } = useReputation();
  const { isBookmarked, toggleBookmark } = useBookmark();
  const { loginOpen, signupOpen, openLogin, closeLogin, closeSignup, switchToSignup, switchToLogin } = useAuthModals();

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  // Check user's existing rating when problem loads
  useEffect(() => {
    if (id && communityUser) {
      checkUserRating(id);
    }
  }, [id, communityUser]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'var(--success)';
      case 'intermediate': return 'var(--warning)';
      case 'advanced': return 'var(--danger)';
      default: return 'var(--text-secondary)';
    }
  };

  const handleRateProblem = async (rating: number) => {
    if (isGuest) {
      openLogin();
      return;
    }
    if (problem) {
      const success = await rate(problem.id, rating);
      if (success && rating >= 4) {
        await addReputation('problem_upvoted', problem.id);
      }
    }
  };

  const getAverageRating = () => {
    if (!problem || problem.ratingCount === 0) return 0;
    return problem.totalRating / problem.ratingCount;
  };

  const getRatingLabel = (rating: number): string => {
    const rounded = Math.round(rating);
    return RATING_LABELS[rounded as keyof typeof RATING_LABELS] || 'Not rated';
  };

  const handleVoteComment = async (commentId: string, voteType: 'up' | 'down') => {
    console.log('handleVoteComment called:', { commentId, voteType, isGuest, userId: communityUser?.id });
    if (isGuest) {
      console.log('Vote blocked: user is guest');
      openLogin();
      return;
    }
    const success = await voteComment(commentId, voteType);
    console.log('Vote result:', success);
    if (success) {
      refreshComments();
    }
  };

  const handleAddComment = async () => {
    if (isGuest) {
      openLogin();
      return;
    }
    if (!newComment.trim() || !id) return;

    const commentId = await addComment(id, newComment.trim());
    if (commentId) {
      setNewComment('');
      refreshComments();
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (isGuest) {
      openLogin();
      return;
    }
    if (!replyContent.trim() || !id) return;

    const commentId = await addComment(id, replyContent.trim(), parentId);
    if (commentId) {
      setReplyContent('');
      setReplyingTo(null);
      refreshComments();
    }
  };

  const handleMarkBestAnswer = async (commentId: string) => {
    if (!problem || communityUser?.id !== problem.authorId) return;
    
    const success = await markBestAnswer(commentId, problem.id, problem.authorId);
    if (success) {
      await addReputation('answer_best', commentId);
      refreshComments();
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    console.log('handleDeleteComment called with:', commentId, 'problemId:', id, 'user:', communityUser?.id);
    
    if (!id || !communityUser) {
      console.log('Delete aborted: missing id or user');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this comment?')) {
      console.log('User confirmed delete');
      const success = await deleteComment(commentId, id);
      console.log('Delete result:', success);
      if (success) {
        refreshComments();
      }
    }
  };

  const handleDeleteProblem = async () => {
    if (!problem || !communityUser) return;
    
    const isOwner = communityUser.id === problem.authorId;
    const canDelete = isOwner || isAdmin || isModerator;
    
    if (!canDelete) {
      alert('You do not have permission to delete this problem.');
      return;
    }
    
    const confirmMessage = isOwner 
      ? 'Are you sure you want to delete this problem? This will also delete all comments.'
      : `Are you sure you want to delete this problem as ${isAdmin ? 'admin' : 'moderator'}? This will also delete all comments.`;
    
    if (window.confirm(confirmMessage)) {
      const success = await deleteProblem(problem.id);
      if (success) {
        navigate('/community');
      }
    }
  };

  const handleBookmark = async () => {
    if (isGuest) {
      openLogin();
      return;
    }
    if (problem) {
      await toggleBookmark(problem.id);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div 
      key={comment.id} 
      className={`comment ${isReply ? 'reply' : ''} ${comment.isBestAnswer ? 'best-answer' : ''}`}
    >
      {comment.isBestAnswer && (
        <div className="best-answer-badge">
          ✓ Best Answer
        </div>
      )}
      
      <div className="comment-header">
        <div className="comment-author">
          {comment.userAvatar ? (
            <img src={comment.userAvatar} alt="" className="author-avatar" />
          ) : (
            <div className="author-avatar-placeholder">
              {comment.userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="author-info">
            <span className="author-name">{comment.userName}</span>
            <span className="author-reputation">{comment.userReputation} pts</span>
          </div>
        </div>
        <span className="comment-date">
          {formatDate(comment.createdAt)}
          {comment.isEdited && ' (edited)'}
        </span>
      </div>

      <div className="comment-content">
        {comment.content}
      </div>

      {comment.codeBlock && (
        <pre className="comment-code">
          <code>{comment.codeBlock}</code>
        </pre>
      )}

      <div className="comment-actions">
        <div className="vote-buttons">
          <button 
            className="vote-btn"
            onClick={() => {
              console.log('Upvote clicked for comment:', comment.id);
              handleVoteComment(comment.id, 'up');
            }}
          >
            👍 {comment.upvotes}
          </button>
          <button 
            className="vote-btn"
            onClick={() => {
              console.log('Downvote clicked for comment:', comment.id);
              handleVoteComment(comment.id, 'down');
            }}
          >
            👎 {comment.downvotes}
          </button>
        </div>

        {!isReply && (
          <button 
            className="reply-btn"
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
          >
            💬 Reply
          </button>
        )}

        {problem && communityUser?.id === problem.authorId && !comment.isBestAnswer && !isReply && (
          <button 
            className="mark-best-btn"
            onClick={() => handleMarkBestAnswer(comment.id)}
          >
            ✓ Mark as Best
          </button>
        )}

        {/* Delete button - show for comment owner, admins, or moderators */}
        {(communityUser?.id === comment.userId || isAdmin || isModerator) && (
          <button 
            className="delete-btn"
            onClick={() => {
              console.log('Delete clicked for comment:', comment.id, 'userId:', comment.userId, 'current user:', communityUser?.id, 'isAdmin:', isAdmin);
              handleDeleteComment(comment.id);
            }}
            disabled={deleteLoading}
          >
            🗑️ Delete
          </button>
        )}
      </div>

      {/* Reply Input */}
      {replyingTo === comment.id && (
        <div className="reply-input">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply..."
            rows={3}
          />
          <div className="reply-actions">
            <button 
              className="btn-secondary"
              onClick={() => setReplyingTo(null)}
            >
              Cancel
            </button>
            <button 
              className="btn-primary"
              onClick={() => handleAddReply(comment.id)}
              disabled={commentLoading}
            >
              {commentLoading ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="problem-detail loading">
        <div className="loading-spinner"></div>
        <p>Loading problem...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="problem-detail error">
        <h2>Problem Not Found</h2>
        <p>{error || 'The problem you\'re looking for doesn\'t exist.'}</p>
        <Link to="/community/problems" className="btn-primary">
          Back to Problems
        </Link>
      </div>
    );
  }

  return (
    <div className="problem-detail">
      {/* Problem Header */}
      <div className="problem-header">
        <div className="problem-badges">
          <span 
            className="difficulty-badge"
            style={{ background: getDifficultyColor(problem.difficulty) }}
          >
            {problem.difficulty}
          </span>
          <span className="category-badge">{problem.category}</span>
          <span className="type-badge">{problem.problemType}</span>
        </div>

        <h1>{problem.title}</h1>

        <div className="problem-meta">
          <Link to={`/community/user/${problem.authorId}`} className="author-link">
            {problem.authorAvatar ? (
              <img src={problem.authorAvatar} alt="" className="author-avatar-small" />
            ) : (
              <div className="author-avatar-small-placeholder">
                {problem.authorName.charAt(0)}
              </div>
            )}
            <span>{problem.authorName}</span>
          </Link>
          <span className="meta-divider">•</span>
          <span>{formatDate(problem.createdAt)}</span>
          <span className="meta-divider">•</span>
          <span>{problem.viewCount} views</span>
        </div>
      </div>

      {/* Problem Actions */}
      <div className="problem-actions-bar">
        <div className="rating-section">
          <span className="rating-label">Rate this problem:</span>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`star-btn ${userRating && userRating >= star ? 'active' : ''} ${hoveredRating && hoveredRating >= star ? 'hovered' : ''}`}
                onClick={() => handleRateProblem(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(null)}
                disabled={ratingLoading}
                title={RATING_LABELS[star as keyof typeof RATING_LABELS]}
              >
                ★
              </button>
            ))}
          </div>
          <span className="rating-info">
            {problem.ratingCount > 0 ? (
              <>
                {getAverageRating().toFixed(1)} ({getRatingLabel(getAverageRating())}) · {problem.ratingCount} {problem.ratingCount === 1 ? 'rating' : 'ratings'}
              </>
            ) : (
              'No ratings yet'
            )}
          </span>
        </div>

        <div className="action-buttons">
          <button 
            className={`bookmark-btn ${isBookmarked(problem.id) ? 'active' : ''}`}
            onClick={handleBookmark}
          >
            {isBookmarked(problem.id) ? '🔖 Bookmarked' : '📄 Bookmark'}
          </button>
          <button className="share-btn" onClick={() => navigator.clipboard.writeText(window.location.href)}>
            🔗 Share
          </button>
          {(communityUser?.id === problem.authorId || isAdmin || isModerator) && (
            <button 
              className="delete-problem-btn" 
              onClick={handleDeleteProblem}
              disabled={deleteProblemLoading}
              title={isAdmin ? 'Delete as Admin' : isModerator ? 'Delete as Moderator' : 'Delete your problem'}
            >
              {deleteProblemLoading ? '⏳ Deleting...' : '🗑️ Delete Problem'}
            </button>
          )}
        </div>
      </div>

      {/* Problem Content */}
      <div className="problem-content">
        <section className="content-section">
          <h2>Description</h2>
          <div className="description-text">
            {problem.description}
          </div>
        </section>

        {problem.codeSnippet && (
          <section className="content-section">
            <h2>Code</h2>
            <pre className="code-block">
              <code className={`language-${problem.language}`}>
                {problem.codeSnippet}
              </code>
            </pre>
          </section>
        )}

        {problem.testCases && problem.testCases.length > 0 && (
          <section className="content-section">
            <h2>Test Cases</h2>
            {problem.testCases.map((tc, index) => (
              <div key={index} className="test-case-display">
                <div className="test-case-row">
                  <strong>Input:</strong>
                  <code>{tc.input}</code>
                </div>
                <div className="test-case-row">
                  <strong>Expected:</strong>
                  <code>{tc.expectedOutput}</code>
                </div>
                {tc.explanation && (
                  <div className="test-case-row">
                    <strong>Explanation:</strong>
                    <span>{tc.explanation}</span>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {problem.isMultipleChoice && problem.choices && (
          <section className="content-section">
            <h2>Options</h2>
            <div className="choices-display">
              {problem.choices.map((choice, index) => (
                <div 
                  key={index} 
                  className={`choice-option ${showSolution && choice === problem.correctAnswer ? 'correct' : ''}`}
                >
                  <span className="choice-letter">{String.fromCharCode(65 + index)}</span>
                  <span>{choice}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {problem.solution && (
          <section className="content-section solution-section">
            <div className="solution-header">
              <h2>Solution</h2>
              <button 
                className="toggle-solution-btn"
                onClick={() => setShowSolution(!showSolution)}
              >
                {showSolution ? '🙈 Hide Solution' : '👁️ Show Solution'}
              </button>
            </div>
            {showSolution && (
              <div className="solution-content">
                <pre className="code-block">
                  <code>{problem.solution}</code>
                </pre>
              </div>
            )}
          </section>
        )}

        <div className="problem-tags">
          {problem.tags.map(tag => (
            <Link 
              key={tag} 
              to={`/community/problems?tags=${tag}`}
              className="tag"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <h2>💬 Discussion ({comments.length})</h2>

        {/* Add Comment */}
        <div className="add-comment">
          {isGuest ? (
            <div className="auth-prompt">
              <p>Sign in to join the discussion</p>
              <button className="btn-primary" onClick={openLogin}>
                Sign In
              </button>
            </div>
          ) : (
            <>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts, ask questions, or provide insights..."
                rows={4}
              />
              {commentError && (
                <div className="comment-error">{commentError}</div>
              )}
              <button 
                className="btn-primary"
                onClick={handleAddComment}
                disabled={commentLoading || !newComment.trim()}
              >
                {commentLoading ? 'Posting...' : 'Post Comment'}
              </button>
            </>
          )}
        </div>

        {/* Comments List */}
        <div className="comments-list">
          {commentsLoading ? (
            <div className="loading-comments">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="no-comments">
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map(comment => renderComment(comment))
          )}
        </div>
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

export default ProblemDetail;
