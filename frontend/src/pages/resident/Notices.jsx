import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/common/Spinner';
import useDataList from '../../hooks/useDataList';

export default function ResidentNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readingId, setReadingId] = useState(null);
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState('All Notices');
  const [sortBy, setSortBy] = useState('Latest First');

  const deriveCategory = (notice) => {
      const text = (notice.title + ' ' + notice.content).toLowerCase();
      if (text.includes('emergency') || text.includes('urgent') || text.includes('shutdown') || text.includes('power')) {
          return 'Emergency';
      }
      if (text.includes('maintenance') || text.includes('repair') || text.includes('inspection') || text.includes('pool')) {
          return 'Maintenance';
      }
      if (text.includes('event') || text.includes('party') || text.includes('gala') || text.includes('mixer')) {
          return 'Events';
      }
      return 'General';
  };

  const searchFilterFn = (notice, query) => {
    const matchesSearch = !query || 
           notice.title.toLowerCase().includes(query.toLowerCase()) || 
           notice.content.toLowerCase().includes(query.toLowerCase());
    
    const cat = deriveCategory(notice);
    const matchesTab = activeTab === 'All Notices' || cat === activeTab;
    
    return matchesSearch && matchesTab;
  };

  const {
    searchQuery, setSearchQuery,
    paginatedData, currentPage, totalPages, nextPage, prevPage
  } = useDataList(notices, searchFilterFn, {}, 9); // Use 9 items for grid

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices');
      setNotices(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    setReadingId(id);
    try {
      await api.post(`/notices/${id}/read`);
      toast.success('Notice marked as read');
      fetchNotices();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to mark notice as read');
    } finally {
      setReadingId(null);
    }
  };

  const getCategoryStyles = (category) => {
      switch(category) {
          case 'Emergency':
              return {
                  borderClass: 'border-error',
                  badgeBg: 'bg-error-container',
                  badgeText: 'text-on-error-container'
              };
          case 'Events':
              return {
                  borderClass: 'border-tertiary-container',
                  badgeBg: 'bg-tertiary-container',
                  badgeText: 'text-white'
              };
          case 'Maintenance':
              return {
                  borderClass: 'border-secondary',
                  badgeBg: 'bg-secondary-container',
                  badgeText: 'text-on-secondary-container'
              };
          default: // General
              return {
                  borderClass: 'border-outline',
                  badgeBg: 'bg-surface-variant',
                  badgeText: 'text-on-surface-variant'
              };
      }
  };

  if (loading) {
      return (
          <div className="w-full">
              <div className="max-w-container-max mx-auto flex items-center justify-center min-h-[50vh]">
                  <Spinner size="lg" color="primary" />
              </div>
          </div>
      );
  }

  // Sort logic for paginatedData
  let sortedData = [...paginatedData];
  if (sortBy === 'Latest First') {
      sortedData.sort((a,b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id));
  } else if (sortBy === 'Expiry Date') {
      sortedData.sort((a,b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }

  return (
    <div className="w-full space-y-6">
        <div className="max-w-container-max mx-auto">
            
            {/* Header / Search integrated into layout typically, but providing local search here as fallback if needed */}
            <div className="mb-6 lg:hidden relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">search</span>
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-white border border-outline-variant/50 rounded-md w-full focus:ring-1 focus:ring-primary-container font-body-sm text-on-surface placeholder:text-secondary transition-all outline-none shadow-sm" 
                    placeholder="Search notices..." 
                />
            </div>

            {/* Filter Section */}
            <section className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {['All Notices', 'Emergency', 'Maintenance', 'General', 'Events'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-md font-label-md whitespace-nowrap transition-all ${activeTab === tab ? 'bg-[#1B3358] text-white shadow-sm' : 'bg-white border border-outline-variant/50 text-secondary hover:border-primary hover:text-primary'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 text-secondary">
                    <span className="font-label-sm whitespace-nowrap">Sort by:</span>
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent border-none font-label-md focus:ring-0 cursor-pointer pr-8 outline-none appearance-none bg-no-repeat bg-[right_center] bg-[length:1.25em_1.25em]"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                    >
                        <option value="Latest First">Latest First</option>
                        <option value="Expiry Date">Expiry Date</option>
                    </select>
                </div>
            </section>

            {/* Notices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {sortedData.map(notice => {
                    const category = deriveCategory(notice);
                    const styles = getCategoryStyles(category);
                    const isRead = notice.hasRead; // Assume backend might give hasRead flag, if not we rely on user action

                    return (
                        <div key={notice.id} className={`card p-6 flex flex-col border-l-4 ${styles.borderClass} hover:-translate-y-1 transition-all group`}>
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 ${styles.badgeBg} ${styles.badgeText} text-[10px] font-bold tracking-wider uppercase rounded`}>{category}</span>
                                <button 
                                    onClick={() => markAsRead(notice.id)}
                                    disabled={readingId === notice.id || isRead}
                                    className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-50"
                                    title="Mark as Read"
                                >
                                    {readingId === notice.id ? <Spinner size="sm" /> : isRead ? 'done_all' : 'check'}
                                </button>
                            </div>
                            
                            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">{notice.title}</h3>
                            <p className="font-body-sm text-secondary line-clamp-4 mb-6 whitespace-pre-wrap">{notice.content}</p>
                            
                            <div className="mt-auto space-y-2 border-t border-outline-variant/30 pt-4">
                                <div className="flex items-center justify-between font-label-sm text-secondary flex-wrap gap-2">
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> Posted: {new Date(notice.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    {notice.expiryDate && (
                                        <span className={`flex items-center gap-1 ${category === 'Emergency' ? 'text-error' : ''}`}>
                                            <span className="material-symbols-outlined text-[14px]">{category === 'Events' ? 'event_available' : 'timer_off'}</span> 
                                            {category === 'Events' ? 'Event on: ' : 'Expires: '} 
                                            {new Date(notice.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-secondary/70 pt-2">By: {notice.createdByName}</div>
                            </div>
                        </div>
                    );
                })}

                {/* Featured/Pinned Bento Style Notice */}
                {currentPage === 1 && (
                    <div className="md:col-span-1 xl:col-span-1 card bg-primary text-white p-6 flex flex-col relative overflow-hidden order-last">
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                                <path d="M0 100 L100 0 L100 100 Z" fill="white"></path>
                            </svg>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-[20px]">push_pin</span>
                                <span className="font-label-md tracking-widest uppercase">Pinned Notice</span>
                            </div>
                            <h3 className="font-headline-md text-headline-md text-white mb-4 leading-tight">Welcome to the New Resident Portal Experience</h3>
                            <p className="font-body-md text-primary-fixed mb-8">We've upgraded our communication tools to serve you better. Download the mobile app for real-time push notifications.</p>
                            <button className="mt-auto inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-md font-label-md hover:bg-surface-bright transition-all self-start shadow-sm active:scale-95">
                                Learn More
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {sortedData.length === 0 && (
                <div className="text-center py-20 card mt-6">
                    <span className="material-symbols-outlined text-[64px] text-secondary/30 mb-4">campaign</span>
                    <h3 className="font-headline-sm text-on-surface">No Notices Found</h3>
                    <p className="font-body-md text-secondary">There are currently no notices matching your criteria.</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between card p-4 flex-row">
                    <p className="font-label-sm text-secondary">
                        Showing {(currentPage - 1) * 9 + 1} to {Math.min(currentPage * 9, notices.length)} of {notices.length} notices
                    </p>
                    <div className="flex gap-2">
                        <button 
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md hover:bg-surface-container-lowest disabled:opacity-30 transition-colors border border-outline-variant/50 text-secondary"
                        >
                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        <div className="flex items-center gap-1 hidden sm:flex">
                            <button className="w-8 h-8 bg-[#1B3358] text-white rounded-md font-label-md">
                                {currentPage}
                            </button>
                        </div>
                        <button 
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-md hover:bg-surface-container-lowest disabled:opacity-30 transition-colors border border-outline-variant/50 text-secondary"
                        >
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
