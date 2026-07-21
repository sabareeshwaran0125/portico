import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/common/Spinner';

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

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-[50vh] w-full">
              <Spinner size="lg" color="primary" />
          </div>
      );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end mb-8">
            <div>
                <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
                    <span className="font-label-md text-label-md">Portal</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="font-label-md text-label-md text-primary">Resident Profile</span>
                </nav>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">My Profile</h2>
            </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
            
            <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* Personal Identity */}
                <section className="bg-white p-6 md:p-8 rounded-xl shadow-[0px_4px_12px_rgba(27,39,51,0.08)] border border-outline-variant/30">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="relative group mx-auto md:mx-0">
                            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-surface-container border border-outline-variant/50 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[64px] text-secondary opacity-50" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                            </div>
                            <button className="absolute -bottom-3 -right-3 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-primary border border-outline-variant/30 hover:scale-105 transition-transform">
                                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                            </button>
                        </div>
                        <div className="flex-1 w-full">
                            <div className="border-b border-outline-variant/30 pb-4 mb-6">
                                <h3 className="font-headline-sm text-headline-sm mb-1 text-on-surface">Personal Identity</h3>
                                <p className="text-body-sm text-on-surface-variant">Update your contact information and identity details.</p>
                            </div>
                            <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block font-label-md text-[10px] text-secondary mb-1.5 uppercase tracking-widest">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={profile.email} 
                                        disabled 
                                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-3 text-body-md text-on-surface-variant cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block font-label-md text-[10px] text-secondary mb-1.5 uppercase tracking-widest">First Name</label>
                                    <input 
                                        type="text" 
                                        value={profile.firstName} 
                                        onChange={e => setProfile({...profile, firstName: e.target.value})} 
                                        required 
                                        className="w-full bg-white border border-outline-variant/50 rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block font-label-md text-[10px] text-secondary mb-1.5 uppercase tracking-widest">Last Name</label>
                                    <input 
                                        type="text" 
                                        value={profile.lastName} 
                                        onChange={e => setProfile({...profile, lastName: e.target.value})} 
                                        required 
                                        className="w-full bg-white border border-outline-variant/50 rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block font-label-md text-[10px] text-secondary mb-1.5 uppercase tracking-widest">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        value={profile.phone} 
                                        onChange={e => setProfile({...profile, phone: e.target.value})} 
                                        required 
                                        className="w-full bg-white border border-outline-variant/50 rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2 flex justify-end mt-2">
                                    <button 
                                        type="submit" 
                                        className="px-6 py-2.5 bg-primary-container text-white rounded-lg font-label-lg text-label-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-md flex items-center justify-center min-w-[140px]" 
                                        disabled={savingProfile}
                                    >
                                        {savingProfile ? <Spinner size="sm" color="white" /> : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>

                {/* Change Password */}
                <section className="bg-white p-6 md:p-8 rounded-xl shadow-[0px_4px_12px_rgba(27,39,51,0.08)] border border-outline-variant/30">
                    <div className="flex items-center gap-3 mb-6 border-b border-outline-variant/30 pb-4">
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                        <div>
                            <h3 className="font-headline-sm text-headline-sm">Security</h3>
                            <p className="text-body-sm text-on-surface-variant">Update your password to keep your account secure.</p>
                        </div>
                    </div>
                    <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-lg">
                        <div>
                            <label className="block font-label-md text-[10px] text-secondary mb-1.5 uppercase tracking-widest">Current Password</label>
                            <input 
                                type="password" 
                                value={passwordData.oldPassword} 
                                onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})} 
                                required 
                                className="w-full bg-white border border-outline-variant/50 rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block font-label-md text-[10px] text-secondary mb-1.5 uppercase tracking-widest">New Password (min 6 chars)</label>
                            <input 
                                type="password" 
                                value={passwordData.newPassword} 
                                onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} 
                                minLength={6} 
                                required 
                                className="w-full bg-white border border-outline-variant/50 rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block font-label-md text-[10px] text-secondary mb-1.5 uppercase tracking-widest">Confirm New Password</label>
                            <input 
                                type="password" 
                                value={passwordData.confirmPassword} 
                                onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                                minLength={6} 
                                required 
                                className="w-full bg-white border border-outline-variant/50 rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <div className="flex justify-start pt-2">
                            <button 
                                type="submit" 
                                className="px-6 py-2.5 bg-secondary text-white rounded-lg font-label-lg text-label-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-md flex items-center justify-center min-w-[160px]" 
                                disabled={savingPassword}
                            >
                                {savingPassword ? <Spinner size="sm" color="white" /> : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </section>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-6">
                {/* Emergency Contacts */}
                <section className="bg-[#1B3358] p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="material-symbols-outlined text-error-container" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
                        <h3 className="font-headline-sm text-headline-sm">Support & Emergency</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <p className="font-label-md text-white/60 uppercase text-[10px] tracking-widest mb-1">Facility Manager</p>
                            <p className="font-label-lg text-white mb-1">Society Desk (24x7)</p>
                            <p className="text-body-sm font-semibold text-secondary-fixed-dim">+91 20 2345 6789</p>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <p className="font-label-md text-white/60 uppercase text-[10px] tracking-widest mb-1">Security Gate</p>
                            <p className="font-label-lg text-white mb-1">Main Entrance</p>
                            <p className="text-body-sm font-semibold text-secondary-fixed-dim">+91 20 2345 6790</p>
                        </div>
                    </div>
                </section>
                
                {/* Security Status */}
                <div className="bg-surface-container-low p-6 rounded-xl flex items-center gap-6 border border-outline-variant/30">
                    <div className="p-4 bg-white rounded-full shadow-sm text-green-600">
                        <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield_lock</span>
                    </div>
                    <div>
                        <h4 className="font-label-lg text-label-lg text-on-surface">Security Clear</h4>
                        <p className="font-headline-md text-headline-md text-secondary">Verified</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
