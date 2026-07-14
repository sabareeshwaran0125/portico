import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import './Header.css';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className="dashboard-header">
      <div className="header-spacer">
        <button className="btn btn-outline btn-neutral mobile-menu-btn" onClick={onMenuClick} style={{ padding: '0.5rem', display: 'none' }}>
          <Menu size={20} />
        </button>
      </div>
      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <NotificationDropdown />
        <div className="header-profile" onClick={handleProfileClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="id-card-badge">
            <div className="avatar">
              <img src="/images/default-avatar.png" alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-outline btn-neutral logout-btn" title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
