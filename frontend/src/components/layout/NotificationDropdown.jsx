import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="text-secondary hover:text-primary transition-colors relative" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-lg border border-outline-variant/20 z-50 overflow-hidden">
          <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-bright">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Notifications</h3>
            {unreadCount > 0 && (
              <button className="text-primary font-label-sm hover:underline" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-secondary font-body-sm">
                No notifications.
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/10">
                {notifications.map(notif => (
                  <div key={notif.id} className={`p-4 transition-colors ${notif.read ? 'bg-white' : 'bg-surface-container-low'}`}>
                    <div className="flex justify-between gap-2">
                        <p className={`font-body-sm ${notif.read ? 'text-secondary' : 'text-on-surface font-medium'}`}>{notif.message}</p>
                        {!notif.read && (
                            <button className="text-primary hover:text-primary-container shrink-0" onClick={() => markAsRead(notif.id)} title="Mark as read">
                                <span className="material-symbols-outlined text-sm">check</span>
                            </button>
                        )}
                    </div>
                    <span className="text-[10px] text-secondary/70 mt-1 block">
                        {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
