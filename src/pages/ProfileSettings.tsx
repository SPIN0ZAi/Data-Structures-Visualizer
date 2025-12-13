import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/Auth/AuthProvider';
import ImageUpload from '../components/ImageUpload/ImageUpload';
import ProfilePicture from '../components/ProfilePicture/ProfilePicture';
import './ProfileSettings.css';

const ProfileSettings: React.FC = () => {
  const { 
    currentUser, 
    communityUser, 
    updateCommunityUser, 
    updateProfilePicture, 
    removeProfilePicture,
    syncAvatarToContent,
    isGuest,
    isCreator,
    isModerator
  } = useAuth();
  
  const [displayName, setDisplayName] = useState(communityUser?.displayName || '');
  const [bio, setBio] = useState(communityUser?.bio || '');
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (isGuest || !currentUser || !communityUser) {
    return (
      <div className="profile-settings">
        <div className="auth-required">
          <span className="auth-icon">🔐</span>
          <h2>Sign in Required</h2>
          <p>Please sign in to access your profile settings.</p>
          <Link to="/community" className="btn-primary">
            Go to Community
          </Link>
        </div>
      </div>
    );
  }

  const handleProfilePictureUpload = async (file: File) => {
    try {
      setMessage(null);
      await updateProfilePicture(file);
      setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload profile picture. Please try again.' });
    }
  };

  const handleProfilePictureRemove = async () => {
    try {
      setMessage(null);
      await removeProfilePicture();
      setMessage({ type: 'success', text: 'Profile picture removed.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove profile picture. Please try again.' });
    }
  };

  const handleSyncAvatar = async () => {
    try {
      setSyncing(true);
      setMessage(null);
      const result = await syncAvatarToContent();
      setMessage({ 
        type: 'success', 
        text: `Avatar synced to ${result.comments} comments and ${result.problems} problems!` 
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to sync avatar. Please try again.' });
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateCommunityUser({
        displayName: displayName.trim(),
        bio: bio.trim()
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-settings">
      <div className="settings-header">
        <h1>Profile Settings</h1>
        <p>Manage your profile information</p>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          <span className="message-icon">{message.type === 'success' ? '✓' : '⚠️'}</span>
          {message.text}
        </div>
      )}

      <div className="settings-grid">
        {/* Profile Picture Section */}
        <div className="settings-section">
          <h2>Profile Picture</h2>
          <p className="section-description">
            Upload a photo to personalize your profile. If you don't upload one, 
            we'll use your initials.
          </p>
          
          <div className="picture-preview">
            <ProfilePicture
              src={communityUser.avatarUrl}
              name={communityUser.displayName}
              size="xl"
            />
            <div className="preview-info">
              <span className="preview-name">{communityUser.displayName}</span>
              <span className="preview-email">{communityUser.email}</span>
            </div>
          </div>

          <ImageUpload
            currentImage={communityUser.avatarUrl}
            userName={communityUser.displayName}
            onUpload={handleProfilePictureUpload}
            onRemove={handleProfilePictureRemove}
            maxSizeKB={5120}
            maxDimension={4096}
          />

          <button 
            type="button" 
            className="btn-sync-avatar"
            onClick={handleSyncAvatar}
            disabled={syncing}
          >
            {syncing ? '🔄 Syncing...' : '🔄 Sync Avatar to All Posts'}
          </button>
          <p className="sync-hint">
            Use this to update your avatar in all your existing comments and problems.
          </p>
        </div>

        {/* Profile Info Section */}
        <div className="settings-section">
          <h2>Profile Information</h2>
          <p className="section-description">
            Update your display name and bio.
          </p>

          <form onSubmit={handleSaveProfile} className="settings-form">
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                maxLength={50}
                required
              />
              <span className="char-count">{displayName.length}/50</span>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others a bit about yourself..."
                maxLength={300}
                rows={4}
              />
              <span className="char-count">{bio.length}/300</span>
            </div>

            <button 
              type="submit" 
              className="btn-save"
              disabled={saving || !displayName.trim()}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Account Info Section */}
        <div className="settings-section account-info">
          <h2>Account Information</h2>
          
          <div className="info-row">
            <span className="info-label">Email</span>
            <span className="info-value">{communityUser.email}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Username</span>
            <span className="info-value">@{communityUser.username}</span>
          </div>

          <div className="info-row">
            <span className="info-label">Role</span>
            <span className={`info-value role-badge ${isCreator ? 'creator' : isModerator ? 'moderator' : 'user'}`}>
              {isCreator ? '👑 Creator' : isModerator ? '🛡️ Moderator' : '👤 User'}
            </span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Reputation</span>
            <span className="info-value reputation">
              ⭐ {communityUser.reputation} points
            </span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Badges</span>
            <span className="info-value">
              {communityUser.badges?.length || 0} earned
            </span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Member Since</span>
            <span className="info-value">
              {communityUser.createdAt instanceof Date 
                ? communityUser.createdAt.toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <Link to={`/community/user/${communityUser.id}`} className="btn-view-profile">
          View Public Profile →
        </Link>
      </div>
    </div>
  );
};

export default ProfileSettings;
