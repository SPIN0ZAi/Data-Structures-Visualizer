import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useUser } from '../context/UserContext'
import { useAuth } from './Auth/AuthProvider'
import ProfilePicture from './ProfilePicture/ProfilePicture'

interface LayoutProps {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, isSetup } = useUser();
  const { currentUser, communityUser, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu when route changes
  const handleNavClick = () => {
    setMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <div className="app-layout">
      {/* Fixed Top-Right Corner - Profile & Theme (Pinterest style) */}
      <div className="top-right-bar">
        <button 
          className="theme-toggle-corner"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        
        <div className="profile-dropdown-container" ref={dropdownRef}>
          <button 
            className="profile-trigger"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            aria-label="Open profile menu"
          >
            {currentUser ? (
              <>
                <ProfilePicture 
                  src={communityUser?.avatarUrl}
                  name={communityUser?.displayName || currentUser.displayName || 'User'}
                  size="sm"
                />
                {isAdmin && <span className="admin-crown">👑</span>}
              </>
            ) : (
              <span className="guest-avatar">👤</span>
            )}
          </button>
          
          {profileDropdownOpen && (
            <div className="profile-dropdown">
              {currentUser && communityUser ? (
                <>
                  <div className="dropdown-header">
                    <ProfilePicture 
                      src={communityUser.avatarUrl}
                      name={communityUser.displayName}
                      size="md"
                    />
                    <div className="dropdown-user-info">
                      <span className="dropdown-name">{communityUser.displayName}</span>
                      <span className="dropdown-rep">⭐ {communityUser.reputation} reputation</span>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <NavLink 
                    to={`/community/user/${communityUser.id}`} 
                    className="dropdown-link"
                    onClick={handleNavClick}
                  >
                    <span>👤</span> View Profile
                  </NavLink>
                  <NavLink 
                    to="/community/settings" 
                    className="dropdown-link"
                    onClick={handleNavClick}
                  >
                    <span>⚙️</span> Settings
                  </NavLink>
                  {isAdmin && (
                    <NavLink 
                      to="/community/admin" 
                      className="dropdown-link admin"
                      onClick={handleNavClick}
                    >
                      <span>🛡️</span> Admin Panel
                    </NavLink>
                  )}
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-link logout" onClick={handleLogout}>
                    <span>🚪</span> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div className="dropdown-guest">
                    <p>Sign in to track progress</p>
                  </div>
                  <NavLink 
                    to="/community" 
                    className="dropdown-signin"
                    onClick={handleNavClick}
                  >
                    🔑 Sign In with Google
                  </NavLink>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Header - Only shows on mobile */}
      <header className="mobile-header">
        <button 
          className="menu-toggle"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
        <NavLink to="/" className="mobile-brand" onClick={handleNavClick}>
          🌳 DS Visualizer
        </NavLink>
        <div className="mobile-header-spacer"></div>
      </header>

      {/* Side Drawer Menu */}
      <div 
        className={`drawer-overlay ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
      ></div>
      
      <aside className={`side-drawer ${menuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-brand">
            <span className="drawer-logo">🌳</span>
            <div className="drawer-brand-text">
              <span className="drawer-title">DS Visualizer</span>
              <span className="drawer-subtitle">Learn Algorithms</span>
            </div>
          </div>
          <button 
            className="drawer-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {currentUser ? (
          <NavLink to={`/community/user/${communityUser?.id || currentUser.uid}`} className="drawer-profile-card" onClick={handleNavClick}>
            <ProfilePicture 
              src={communityUser?.avatarUrl}
              name={communityUser?.displayName || currentUser.displayName || 'User'}
              size="lg"
            />
            <div className="drawer-profile-info">
              <span className="drawer-username">{communityUser?.displayName || currentUser.displayName || 'User'}</span>
              <span className="drawer-level">
                {communityUser?.reputation || 0} reputation
                {isAdmin && <span className="admin-badge">Admin</span>}
              </span>
            </div>
          </NavLink>
        ) : isSetup && (
          <NavLink to="/community" className="drawer-profile-card" onClick={handleNavClick}>
            <span className="drawer-avatar">{user.profile.avatar}</span>
            <div className="drawer-profile-info">
              <span className="drawer-username">{user.profile.name}</span>
              <span className="drawer-level">Guest • Sign in to save</span>
            </div>
          </NavLink>
        )}

        <nav className="drawer-nav">
          <div className="drawer-section">
            <span className="drawer-section-title">Visualizers</span>
            <NavLink to="/trees" className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="drawer-icon">🌳</span>
              <span>Trees / BST / AVL</span>
            </NavLink>
            <NavLink to="/graphs" className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="drawer-icon">🕸️</span>
              <span>DFS / BFS</span>
            </NavLink>
            <NavLink to="/floyd" className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="drawer-icon">🛤️</span>
              <span>Floyd-Warshall</span>
            </NavLink>
            <NavLink to="/huffman" className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="drawer-icon">🗜️</span>
              <span>Huffman</span>
            </NavLink>
            <NavLink to="/sorting" className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="drawer-icon">📊</span>
              <span>Sorting</span>
            </NavLink>
            <NavLink to="/pathfinding" className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="drawer-icon">🗺️</span>
              <span>Pathfinding</span>
            </NavLink>
            <NavLink to="/gnde" className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="drawer-icon">🏗️</span>
              <span>Graph Construction</span>
            </NavLink>
          </div>

          <div className="drawer-section">
            <span className="drawer-section-title">Practice</span>
            <NavLink to="/problems" className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="drawer-icon">💻</span>
              <span>Problems</span>
            </NavLink>
            <NavLink to="/codelab" className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="drawer-icon">🧪</span>
              <span>Code Lab</span>
            </NavLink>
          </div>

          <div className="drawer-section">
            <span className="drawer-section-title">Community</span>
            <NavLink to="/community" className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="drawer-icon">🏠</span>
              <span>Community Hub</span>
            </NavLink>
            <NavLink to="/community/problems" className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="drawer-icon">📚</span>
              <span>Problem Library</span>
            </NavLink>
            <NavLink to="/community/submit" className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="drawer-icon">✏️</span>
              <span>Submit Problem</span>
            </NavLink>
            <NavLink to="/community/leaderboard" className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="drawer-icon">🏆</span>
              <span>Leaderboard</span>
            </NavLink>
          </div>

          <div className="drawer-section">
            <span className="drawer-section-title">Account</span>
            {currentUser ? (
              <>
                <NavLink to={`/community/user/${communityUser?.id || currentUser.uid}`} className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                  <span className="drawer-icon">👤</span>
                  <span>My Profile</span>
                </NavLink>
                <NavLink to="/community/settings" className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                  <span className="drawer-icon">⚙️</span>
                  <span>Settings</span>
                </NavLink>
                {isAdmin && (
                  <NavLink to="/community/admin" className={({ isActive }) => `drawer-link admin-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                    <span className="drawer-icon">🛡️</span>
                    <span>Admin Panel</span>
                  </NavLink>
                )}
                <button className="drawer-link drawer-signout-btn" onClick={handleLogout}>
                  <span className="drawer-icon">🚪</span>
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <NavLink to="/community" className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <span className="drawer-icon">🔑</span>
                <span>Sign In</span>
              </NavLink>
            )}
          </div>
        </nav>

        <div className="drawer-footer">
          <button className="theme-toggle-drawer" onClick={toggleTheme}>
            <span className="drawer-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      {/* Desktop Navbar - Only shows on desktop */}
      <nav className="navbar desktop-only">
        <div className="container navbar-content">
          <NavLink to="/" className="navbar-brand" onClick={handleNavClick}>
            🌳 DS Visualizer
          </NavLink>

          <div className="navbar-nav">
            <NavLink
              to="/trees"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              🌳 Trees / BST / AVL
            </NavLink>
            <NavLink
              to="/graphs"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              🕸️ DFS / BFS
            </NavLink>
            <NavLink
              to="/floyd"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              🛤️ Floyd-Warshall
            </NavLink>
            <NavLink
              to="/huffman"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              🗜️ Huffman
            </NavLink>
            <NavLink
              to="/sorting"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              📊 Sorting
            </NavLink>
            <NavLink
              to="/pathfinding"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              🗺️ Pathfinding
            </NavLink>
            <NavLink
              to="/gnde"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              🏗️ Graph Construction
            </NavLink>
            <NavLink
              to="/problems"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              💻 Problems
            </NavLink>
            <NavLink
              to="/codelab"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              🧪 Code Lab
            </NavLink>
            <NavLink
              to="/community"
              className={({ isActive }) => `nav-link community-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              👥 Community
            </NavLink>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-signature">
            <span>Created by </span>
            <strong>SB</strong>
            <span> • </span>
            <a 
              href="https://github.com/SPIN0ZAi" 
              target="_blank" 
              rel="noopener noreferrer"
              className="github-link"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              SPIN0ZAi
            </a>
          </div>
          <div className="footer-info">
            Data Structures & Algorithms Educational Platform
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
