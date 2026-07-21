import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';

export default function Header({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className="h-16 flex justify-between md:justify-end items-center px-4 md:px-8 bg-surface-bright sticky top-0 z-30 border-b border-outline-variant/30 shadow-sm shrink-0">
      {/* Mobile Menu Button */}
      <button className="md:hidden text-secondary hover:text-primary transition-colors p-2 rounded-lg hover:bg-surface-container" onClick={onMenuClick}>
        <span className="material-symbols-outlined">menu</span>
      </button>

      <div className="flex items-center gap-4 md:gap-6">
        <NotificationDropdown />
        
        <div className="flex items-center gap-3 border-l border-outline-variant/30 pl-4 md:pl-6 cursor-pointer group" onClick={handleProfileClick}>
          <div className="text-right hidden sm:block">
            <p className="font-label-lg text-label-lg text-on-surface group-hover:text-primary transition-colors">{user?.name || 'User'}</p>
            <p className="font-label-sm text-label-sm text-secondary tracking-widest uppercase">{user?.role || 'Role'}</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-primary-container p-0.5 group-hover:border-primary transition-colors">
            <img 
              className="w-full h-full object-cover rounded-full" 
              alt="Avatar" 
              src="/images/default-avatar.png"
              onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + (user?.name || 'U') }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
