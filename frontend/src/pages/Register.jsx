import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/common/Spinner';
import bgImage from '../assets/bg-8k.png';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    block: '',
    flat: ''
  });
  const [loading, setLoading] = useState(false);
  const [availableFlats, setAvailableFlats] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [flatNumbers, setFlatNumbers] = useState([]);
  const [fetchingFlats, setFetchingFlats] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'block') {
        newData.flat = ''; // reset flat number when block changes
      }
      return newData;
    });
  };

  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const res = await api.get('/auth/flats/unoccupied');
        const flats = res.data;
        setAvailableFlats(flats);
        const uniqueBlocks = [...new Set(flats.map(f => f.block))];
        setBlocks(uniqueBlocks.sort());
      } catch (err) {
        console.error('Failed to fetch unoccupied flats', err);
      } finally {
        setFetchingFlats(false);
      }
    };
    fetchFlats();
  }, []);

  useEffect(() => {
    if (formData.block) {
      const filtered = availableFlats
        .filter(f => f.block === formData.block)
        .map(f => f.flatNumber)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      setFlatNumbers(filtered);
    } else {
      setFlatNumbers([]);
    }
  }, [formData.block, availableFlats]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      // Assuming existing backend splits firstName and lastName, we'll just split by space here.
      const nameParts = formData.name.split(' ');
      const payload = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        flatBlock: formData.block,
        flatNumber: formData.flat
      };
      const res = await api.post('/auth/register', payload);
      toast.success(res.data.message || 'Registration successful. Please wait for admin approval.');
      navigate('/login');
    } catch (error) {
      let errorMessage = error.response?.data?.message || 'Registration failed';
      if (error.response?.data?.errors) {
        const validationErrors = Object.values(error.response.data.errors).join(', ');
        errorMessage = `${errorMessage}: ${validationErrors}`;
      }
      toast.error(errorMessage);
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

      {/* Register Container */}
      <div className="min-h-screen w-full flex items-center justify-center p-4 relative z-10 py-12">
        
        <div className="w-full max-w-2xl bg-surface-container-lowest shadow-[0_4px_24px_rgba(27,39,51,0.15)] p-10 md:p-14 rounded-xl flex flex-col items-center">
          
          {/* Branding Header */}
        <div className="mb-10 text-center">
            <span className="text-primary font-bold tracking-widest font-label-md uppercase mb-2 block">Portico Management</span>
            <h1 className="font-display-lg text-display-lg text-on-surface mb-2">Create your account</h1>
            <p className="text-secondary font-body-md max-w-md">Join the Prestige Heights community and manage your residence experience seamlessly.</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="w-full grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6">
            
            {/* Full Name - Full Width */}
            <div className="md:col-span-2">
                <label htmlFor="name" className="block font-label-lg text-on-surface-variant mb-1.5 ml-1">Full Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your legal name" required className="w-full px-4 py-3 bg-surface-bright border border-outline-variant/50 rounded-lg text-body-md transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>

            {/* Email */}
            <div className="md:col-span-1">
                <label htmlFor="email" className="block font-label-lg text-on-surface-variant mb-1.5 ml-1">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required className="w-full px-4 py-3 bg-surface-bright border border-outline-variant/50 rounded-lg text-body-md transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>

            {/* Phone */}
            <div className="md:col-span-1">
                <label htmlFor="phone" className="block font-label-lg text-on-surface-variant mb-1.5 ml-1">Phone</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" required className="w-full px-4 py-3 bg-surface-bright border border-outline-variant/50 rounded-lg text-body-md transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>

            {/* Block Dropdown */}
            <div className="md:col-span-1">
                <label htmlFor="block" className="block font-label-lg text-on-surface-variant mb-1.5 ml-1">Block</label>
                <div className="relative">
                    <select id="block" name="block" value={formData.block} onChange={handleChange} required className="w-full appearance-none px-4 py-3 bg-surface-bright border border-outline-variant/50 rounded-lg text-body-md transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                        <option value="" disabled>Select Block</option>
                        {blocks.map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-secondary">
                        <span className="material-symbols-outlined">expand_more</span>
                    </div>
                </div>
            </div>

            {/* Flat Number Dropdown */}
            <div className="md:col-span-1">
                <label htmlFor="flat" className="block font-label-lg text-on-surface-variant mb-1.5 ml-1">Flat Number</label>
                <div className="relative">
                    <select id="flat" name="flat" value={formData.flat} onChange={handleChange} required disabled={!formData.block} className="w-full appearance-none px-4 py-3 bg-surface-bright border border-outline-variant/50 rounded-lg text-body-md transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50">
                        <option value="" disabled>Select Flat</option>
                        {flatNumbers.map(f => (
                            <option key={f} value={f}>{f}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-secondary">
                        <span className="material-symbols-outlined">expand_more</span>
                    </div>
                </div>
            </div>

            {/* Password*/}
            <div className="md:col-span-1">
                <label htmlFor="password" className="block font-label-lg text-on-surface-variant mb-1.5 ml-1">Password</label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required className="w-full px-4 py-3 bg-surface-bright border border-outline-variant/50 rounded-lg text-body-md transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>

            {/* Confirm Password */}
            <div className="md:col-span-1">
                <label htmlFor="confirmPassword" className="block font-label-lg text-on-surface-variant mb-1.5 ml-1">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required className="w-full px-4 py-3 bg-surface-bright border border-outline-variant/50 rounded-lg text-body-md transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>

            {/* Terms & Register*/}
            <div className="md:col-span-2 pt-4">
                {!fetchingFlats && availableFlats.length === 0 ? (
                    <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm text-center border border-error/20">
                    No flats currently available. Contact the society admin.
                    </div>
                ) : (
                    <button type="submit" disabled={loading || fetchingFlats} className="w-full bg-primary-container text-on-primary font-label-lg py-4 px-8 rounded-lg shadow-sm hover:brightness-110 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                        <span>{loading ? 'Registering...' : 'Register'}</span>
                        {!loading && <span className="material-symbols-outlined text-[20px]">person_add</span>}
                    </button>
                )}
                
                <div className="mt-8 text-center">
                    <p className="text-secondary font-body-sm">
                        Already have an account? 
                        <Link to="/login" className="text-primary font-bold hover:underline ml-1">Sign in</Link>
                    </p>
                </div>
            </div>

        </form>
      </div>
    </div>
    </>
  );
}
