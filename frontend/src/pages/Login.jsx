import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/common/Spinner';
import bgImage from '../assets/bg-8k.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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
    <>
      {/* Full-bleed Fixed Background */}
      <div style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
        backgroundImage: `url(${bgImage})`,
        zIndex: -1
      }}>
        {/* Subtle dark overlay for readability */}
        <div style={{ width: '100%', height: '100%', background: 'rgba(0,0,0,0.30)' }}></div>
      </div>

      {/* Login Container */}
      <div className="min-h-screen w-full flex items-center justify-center p-4 relative z-10">
        
        <div className="w-full max-w-[440px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden flex flex-col items-center py-10 px-8 md:px-12 transition-all duration-500 ease-out transform translate-y-0 opacity-100">
          
          {/* Brand Identity */}
        <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-[#1B3358] rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <span className="material-symbols-outlined text-primary-container text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>apartment</span>
            </div>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-1">Portico</h1>
            <p className="font-body-md text-secondary text-center">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form className="w-full space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-1.5">
                <label htmlFor="email" className="font-label-lg text-on-surface-variant ml-1">Email address</label>
                <div className="relative">
                    <input 
                        type="email" 
                        id="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="manager@portico.com" 
                        className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-lg font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        required
                    />
                </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                    <label htmlFor="password" className="font-label-lg text-on-surface-variant">Password</label>
                    <Link to="/forgot-password" className="font-label-md text-primary hover:underline">Forgot?</Link>
                </div>
                <div className="relative">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        id="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-lg font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-secondary p-1">
                        <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center px-1">
                <input type="checkbox" id="remember" className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" />
                <label htmlFor="remember" className="ml-2 font-label-md text-secondary cursor-pointer">Stay signed in for 30 days</label>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="w-full bg-primary-container hover:bg-primary text-white font-label-lg py-3.5 rounded-lg transition-all duration-200 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? <Spinner size="sm" /> : (
                  <>
                    Sign In
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </>
                )}
            </button>
        </form>

        {/* Bottom Links */}
        <div className="mt-8 pt-6 border-t border-outline-variant/30 w-full text-center">
            <p className="font-body-sm text-secondary">
                New here? <Link to="/register" className="font-label-lg text-primary hover:underline ml-1">Create an account</Link>
            </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="mt-8 w-full p-4 bg-surface-container-low/50 rounded-lg border border-dashed border-outline-variant/50">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-sm">info</span>
                  <p className="font-label-md text-secondary uppercase tracking-wider">Demo Credentials</p>
                </div>
                <div className="flex flex-col gap-1 text-secondary/80 font-body-sm pl-6">
                    <p><span className="font-medium">Admin:</span> admin@portico.com / admin123</p>
                    <p><span className="font-medium">Resident:</span> resident@portico.com / resident123</p>
                    <p><span className="font-medium">Guard:</span> guard@portico.com / guard123</p>
                </div>
            </div>
             </div>
      </div>
    </div>
    </>
  );
}
