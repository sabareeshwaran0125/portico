import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Users, Building, FileText, CheckSquare, Bell } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { isAdmin, isResident, isGuard } = useAuth();

  const getNavLinks = () => {
    if (isAdmin) {
      return [
        { path: '/admin', label: 'Dashboard', icon: Home },
        { path: '/admin/flats', label: 'Flats', icon: Building },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/bills', label: 'Bills', icon: FileText },
        { path: '/admin/complaints', label: 'Complaints', icon: CheckSquare },
        { path: '/admin/notices', label: 'Notices', icon: Bell },
      ];
    }
    if (isResident) {
      return [
        { path: '/resident', label: 'Dashboard', icon: Home },
        { path: '/resident/bills', label: 'My Bills', icon: FileText },
        { path: '/resident/payments', label: 'Payment History', icon: CheckSquare },
        { path: '/resident/visitors', label: 'Visitors', icon: Users },
        { path: '/resident/complaints', label: 'Complaints', icon: CheckSquare },
        { path: '/resident/notices', label: 'Notices', icon: Bell },
      ];
    }
    if (isGuard) {
      return [
        { path: '/guard', label: 'Dashboard', icon: Home },
        { path: '/guard/logs', label: 'Visitor Logs', icon: Users },
      ];
    }
    return [];
  };

  const links = getNavLinks();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img src="/images/logo.png" alt="Portico Logo" style={{width: '32px', height: '32px', objectFit: 'contain', borderRadius: '4px'}} />
        <h2>Portico</h2>
      </div>
      <nav className="sidebar-nav">
        {links.map((link, index) => (
          <NavLink 
            key={link.path} 
            to={link.path} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end={link.path === '/admin' || link.path === '/resident' || link.path === '/guard'}
            onClick={() => setIsOpen && setIsOpen(false)}
          >
            <div className="nav-tile">{String(index + 1).padStart(2, '0')}</div>
            <span className="nav-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
