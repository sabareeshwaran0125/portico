import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { User, Lock } from 'lucide-react';
import './admin/Admin.css'; // Reuse common dashboard styles

export default function Profile() {
  const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setProfile({
        firstName: res.data.firstName || '',
        lastName: res.data.lastName || '',
        phone: res.data.phone || '',
        email: res.data.email || ''
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/users/me', profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/users/me/password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password updated successfully');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
      </div>

      <div className="dashboard-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', alignItems: 'start' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(184, 147, 95, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Personal Information</h2>
          </div>
          
          <form onSubmit={handleProfileSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input type="email" value={profile.email} disabled style={{ backgroundColor: 'rgba(0,0,0,0.05)' }} />
            </div>
            <div className="input-group">
              <label>First Name</label>
              <input type="text" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} required />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input type="text" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} required />
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingProfile} style={{ marginTop: '1rem' }}>
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Change Password</h2>
          </div>
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="input-group">
              <label>Current Password</label>
              <input type="password" value={passwordData.oldPassword} onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})} required />
            </div>
            <div className="input-group">
              <label>New Password (min 6 chars)</label>
              <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} minLength={6} required />
            </div>
            <div className="input-group">
              <label>Confirm New Password</label>
              <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} minLength={6} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingPassword} style={{ marginTop: '1rem' }}>
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
