import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Password reset link sent to your email.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

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
            <h2 className="font-headline-md text-on-background mb-3">Reset your password</h2>
            <p className="font-body-md text-secondary leading-relaxed">
                Enter your email address and we'll send you a link to reset your password.
            </p>
        </div>
        
        {/* Form Section */}
        <form className="w-full space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <label className="font-label-lg text-on-surface-variant block" htmlFor="email">Email Address</label>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">mail</span>
                    <input 
                        className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-all outline-none text-on-surface placeholder:text-outline/60" 
                        id="email" 
                        name="email" 
                        type="email"
                        placeholder="name@example.com" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </div>
            <button 
                className={`w-full text-white font-label-lg py-4 rounded-lg shadow-sm transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group ${submitted ? 'bg-tertiary-container' : 'bg-primary-container hover:bg-primary'}`} 
                type="submit"
                disabled={loading || submitted}
            >
                <span>{loading ? 'Sending...' : (submitted ? 'Link Sent!' : 'Send Reset Link')}</span>
                {loading ? (
                    <span className="material-symbols-outlined text-xl animate-spin">autorenew</span>
                ) : (
                    <span className={`material-symbols-outlined text-xl transition-transform ${submitted ? '' : 'group-hover:translate-x-1'}`}>
                        {submitted ? 'check_circle' : 'arrow_forward'}
                    </span>
                )}
            </button>
        </form>
        
        {/* Navigation Links */}
        <div className="mt-8 flex flex-col items-center">
            <Link className="font-label-lg text-primary hover:text-on-primary-fixed-variant transition-colors flex items-center gap-1 group" to="/login">
                <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">arrow_back</span>
                Back to Sign In
            </Link>
        </div>
    </div>
  );
}
