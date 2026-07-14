import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Globe } from 'lucide-react';
import Spinner from '../components/common/Spinner';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const userData = await login(email, password);
      toast.success(`Welcome back, ${userData.name}!`);
      
      const path = `/${userData.role.toLowerCase()}`;
      navigate(path);
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container bg-login">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <img src="/images/logo.png" alt="Portico Logo" style={{width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'var(--radius-sm)'}} />
          </div>
          <h1>Portico</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading} style={{ marginTop: 0 }}>
            {loading ? <Spinner size="sm" /> : 'Sign In'}
          </button>
        </form>

        <div className="login-footer-links" style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            <Link to="/forgot-password" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Forgot your password?</Link>
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>
            New here? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Create an account</Link>
          </p>
        </div>
        
        <div className="login-demo-info">
          <p><strong>Demo Credentials:</strong></p>
          <ul>
            <li>Admin: admin@portico.com / admin123</li>
            <li>Resident: resident@portico.com / resident123</li>
            <li>Guard: guard@portico.com / guard123</li>
          </ul>
        </div>
      </div>
      <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#FFFFFF', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
        &copy; 2026 Portico. All rights reserved.
      </div>
    </div>
  );
}
