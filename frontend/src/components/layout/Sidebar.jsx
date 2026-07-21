import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { isAdmin, isResident, isGuard, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (isAdmin) {
      return [
        { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
        { path: '/admin/flats', label: 'Flats', icon: 'apartment' },
        { path: '/admin/users', label: 'Users', icon: 'group' },
        { path: '/admin/bills', label: 'Bills', icon: 'receipt_long' },
        { path: '/admin/complaints', label: 'Complaints', icon: 'report_problem' },
        { path: '/admin/notices', label: 'Notices', icon: 'campaign' },
      ];
    }
    if (isResident) {
      return [
        { path: '/resident', label: 'Dashboard', icon: 'dashboard' },
        { path: '/resident/bills', label: 'My Bills', icon: 'receipt_long' },
        { path: '/resident/payments', label: 'Payment History', icon: 'history' },
        { path: '/resident/visitors', label: 'Visitors', icon: 'security' },
        { path: '/resident/complaints', label: 'Complaints', icon: 'report_problem' },
        { path: '/resident/notices', label: 'Notices', icon: 'campaign' },
        { path: '/profile', label: 'Profile', icon: 'account_circle' },
      ];
    }
    if (isGuard) {
      return [
        { path: '/guard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/guard/logs', label: 'Visitor Logs', icon: 'how_to_reg' },
      ];
    }
    return [];
  };

  const links = getNavLinks();

  return (
    <aside className={`fixed md:static inset-y-0 left-0 w-72 bg-[#1B3358] flex flex-col py-6 z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex-shrink-0 shadow-lg md:shadow-none`}>
      {/* Logo Section */}
      <div className="mb-8 px-6 flex items-center justify-between">
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-on-primary">Portico Management</h1>
          <p className="font-label-md text-label-md text-white/60 tracking-wider mt-1">PRESTIGE HEIGHTS</p>
        </div>
        {/* Mobile close button */}
        <button className="md:hidden text-white/70 hover:text-white p-2 rounded hover:bg-white/10 transition-colors" onClick={() => setIsOpen(false)}>
            <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {links.map((link, index) => (
          <NavLink 
            key={link.path} 
            to={link.path}
            end={link.path === '/admin' || link.path === '/resident' || link.path === '/guard'}
            onClick={() => setIsOpen && setIsOpen(false)}
            className={({ isActive }) => 
              isActive 
                ? "relative flex items-center gap-3 px-4 py-3 bg-white/10 text-primary-fixed rounded-lg transition-all group"
                : "flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all group"
            }
          >
            {({ isActive }) => (
              <>
                <span className={`font-mono text-[10px] ${isActive ? 'text-primary-fixed' : 'opacity-40 group-hover:opacity-60'}`}>{String(index + 1).padStart(2, '0')}</span>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400" }}>{link.icon}</span>
                <span className="font-label-lg font-semibold">{link.label}</span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-fixed rounded-r-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="mt-auto pt-4 px-5 border-t border-white/10">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all">
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="font-label-lg font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
}
