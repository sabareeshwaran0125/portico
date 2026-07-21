import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      navigate('/login');
    }
  }, [token, navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);

    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      toast.success('Password reset successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="relative z-10 w-full max-w-md bg-white rounded-xl p-8 md:p-10 flex flex-col items-center shadow-[0_4px_24px_rgba(27,39,51,0.15)]">
      {/* Branding Section */}
      <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#1B3358] rounded-xl flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-300">
              <span className="material-symbols-outlined text-primary-container text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>apartment</span>
          </div>
          <h1 className="font-display-lg text-[#1B3358] tracking-tight">Portico</h1>
      </div>
      
      {/* Heading & Instructions */}
      <div className="text-center mb-8">
          <h2 className="font-headline-md text-on-background mb-3">Create New Password</h2>
          <p className="font-body-md text-secondary leading-relaxed">
              Please enter your new password below
          </p>
      </div>

      {success ? (
        <div className="flex flex-col items-center text-center py-4">
          <div className="text-[var(--status-paid)] mb-4">
            <CheckCircle size={48} />
          </div>
          <h3 className="font-headline-sm text-on-surface mb-2">Password Updated</h3>
          <p className="font-body-md text-secondary mb-8">
            Your password has been changed successfully.
          </p>
          <Link to="/login" className="bg-primary-container hover:bg-primary text-white font-label-lg py-3 px-6 rounded-lg transition-all transform active:scale-[0.98] inline-flex items-center gap-2">
            Sign In
          </Link>
        </div>
      ) : (
        <form className="w-full space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="font-label-lg text-on-surface-variant block" htmlFor="password">New Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input
                className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-all outline-none text-on-surface placeholder:text-outline/60"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-label-lg text-on-surface-variant block" htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input
                className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-all outline-none text-on-surface placeholder:text-outline/60"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary-container hover:bg-primary text-white font-label-lg py-4 rounded-lg shadow-sm transition-all transform active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          
          <div className="mt-8 flex flex-col items-center">
            <Link to="/login" className="font-label-lg text-primary hover:text-on-primary-fixed-variant transition-colors flex items-center gap-1 group">
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
