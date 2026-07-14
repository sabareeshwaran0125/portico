import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Globe } from 'lucide-react';
import Spinner from '../components/common/Spinner';
import './Login.css';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    flatBlock: '',
    flatNumber: ''
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
      if (name === 'flatBlock') {
        newData.flatNumber = ''; // reset flat number when block changes
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
    if (formData.flatBlock) {
      const filtered = availableFlats
        .filter(f => f.block === formData.flatBlock)
        .map(f => f.flatNumber)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      setFlatNumbers(filtered);
    } else {
      setFlatNumbers([]);
    }
  }, [formData.flatBlock, availableFlats]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
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
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-container" style={{ width: '64px', height: '64px', margin: '0 auto 1.5rem' }}>
            <img src="/images/logo.png" alt="Portico Logo" style={{width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'var(--radius-sm)'}} />
          </div>
          <h1 className="login-title">Portico</h1>
          <p className="login-subtitle">Create your resident account</p>
        </div>

        <form onSubmit={handleRegister} className="login-form">
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          
          <div className="input-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Flat Block</label>
              <select name="flatBlock" value={formData.flatBlock} onChange={handleChange} required>
                <option value="">Select Block</option>
                {blocks.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Flat Number</label>
              <select name="flatNumber" value={formData.flatNumber} onChange={handleChange} required disabled={!formData.flatBlock}>
                <option value="">Select Flat</option>
                {flatNumbers.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" />
          </div>

          {!fetchingFlats && availableFlats.length === 0 ? (
            <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--danger-light, #fef2f2)', color: 'var(--danger, #dc2626)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', textAlign: 'center', border: '1px solid #fca5a5' }}>
              No flats currently available. Contact the society admin.
            </div>
          ) : (
            <button type="submit" className="btn btn-primary login-btn" disabled={loading || fetchingFlats}>
              {loading ? <Spinner size="sm" /> : 'Register'}
            </button>
          )}
        </form>

        <div className="login-footer-links" style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
