import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Mail, ArrowLeft } from 'lucide-react';
import './Login.css'; // Reusing Login styles for layout

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
      toast.success('If an account exists, a reset link has been sent');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Reset Password</h2>
          <p>Enter your email to receive a password reset link</p>
        </div>

        {success ? (
          <div className="success-state" style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ color: 'var(--success)', marginBottom: '1rem' }}>
              <Mail size={48} style={{ margin: '0 auto' }} />
            </div>
            <h3 style={{ marginBottom: '1rem' }}>Check your email</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              We've sent password reset instructions to {email}
            </p>
            <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
            
            <div className="login-footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
