import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';
import Spinner from '../../components/common/Spinner';
import useDataList from '../../hooks/useDataList';

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, isDeleting: false });
  
  const defaultExpiry = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().slice(0, 10);
  const [formData, setFormData] = useState({ title: '', content: '', expiryDate: defaultExpiry });
  const toast = useToast();

  const searchFilterFn = (notice, query) => {
    return !query || 
           notice.title.toLowerCase().includes(query.toLowerCase()) || 
           notice.content.toLowerCase().includes(query.toLowerCase());
  };

  const {
    searchQuery, setSearchQuery,
    paginatedData, currentPage, totalPages, nextPage, prevPage
  } = useDataList(notices, searchFilterFn, {}, 10);

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

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/notices', formData);
      toast.success('Notice published successfully');
      setFormData({ title: '', content: '', expiryDate: defaultExpiry });
      fetchNotices();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to publish notice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    setConfirmDelete(prev => ({ ...prev, isDeleting: true }));
    try {
      await api.delete(`/notices/${confirmDelete.id}`);
      toast.success('Notice deleted');
      setConfirmDelete({ isOpen: false, id: null, isDeleting: false });
      fetchNotices();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to delete notice');
      setConfirmDelete(prev => ({ ...prev, isDeleting: false }));
    }
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-[50vh] w-full">
              <Spinner size="lg" color="primary" />
          </div>
      );
  }

  const now = new Date();
  const activeNotices = notices.filter(n => new Date(n.expiryDate) >= now).length;
  const expiringSoon = notices.filter(n => {
      const expiry = new Date(n.expiryDate);
      const diffTime = Math.abs(expiry - now);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return expiry >= now && diffDays <= 3;
  }).length;

  return (
    <div className="w-full space-y-6">
        {/* Header Action Row */}
        <div className="flex justify-between items-end mb-4">
            <div>
                <h3 className="font-headline-lg text-headline-lg text-on-surface">Community Bulletin</h3>
                <p className="text-body-md text-secondary mt-1">Manage and schedule announcements for all residents.</p>
            </div>
            {/* Keeping button for mobile view where sidebar drops down */}
            <button 
                onClick={() => document.getElementById('publish-form').scrollIntoView({ behavior: 'smooth' })}
                className="lg:hidden btn btn-primary btn-md"
            >
                <span className="material-symbols-outlined">add</span>
                <span className="hidden sm:inline">Create Notice</span>
            </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card border-l-4 border-[#1B3358] !border-y-0 !border-r-0 !shadow-[0px_4px_12px_rgba(27,39,51,0.08)] flex justify-between items-start">
                <div>
                    <p className="text-secondary font-label-lg">Active Notices</p>
                    <h4 className="text-4xl font-headline-lg mt-2">{activeNotices}</h4>
                    <p className="text-success text-body-sm mt-1 text-green-600 flex items-center gap-1">
                        Currently visible
                    </p>
                </div>
                <div className="p-3 bg-secondary-container/20 rounded-lg text-secondary">
                    <span className="material-symbols-outlined text-[24px]">campaign</span>
                </div>
            </div>
            
            <div className="card border-l-4 border-[#E8734F] !border-y-0 !border-r-0 !shadow-[0px_4px_12px_rgba(27,39,51,0.08)] flex justify-between items-start">
                <div>
                    <p className="text-secondary font-label-lg">Expiring Soon</p>
                    <h4 className="text-4xl font-headline-lg mt-2">{expiringSoon}</h4>
                    <p className="text-error text-body-sm mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        Ending within 3 days
                    </p>
                </div>
                <div className="p-3 bg-primary-container/20 rounded-lg text-[#E8734F]">
                    <span className="material-symbols-outlined text-[24px]">timer_off</span>
                </div>
            </div>
            
            <div className="card border-l-4 border-outline !border-y-0 !border-r-0 !shadow-[0px_4px_12px_rgba(27,39,51,0.08)] flex justify-between items-start">
                <div>
                    <p className="text-secondary font-label-lg">Total Notices</p>
                    <h4 className="text-4xl font-headline-lg mt-2">{notices.length}</h4>
                    <p className="text-secondary text-body-sm mt-1">All time published</p>
                </div>
                <div className="p-3 bg-surface-container rounded-lg text-outline">
                    <span className="material-symbols-outlined text-[24px]">history</span>
                </div>
            </div>
        </div>

        {/* Main Split Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Notice Table Section (66%) */}
            <section className="flex-grow lg:w-2/3 space-y-4">
                <div className="card !p-0 overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-outline-variant/30 flex flex-wrap justify-between items-center gap-4">
                        <h5 className="font-headline-sm text-headline-sm">Published Announcements</h5>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-50 text-[18px]">search</span>
                            <input 
                                className="w-full pl-9 pr-4 py-1.5 bg-surface-container-lowest border border-outline-variant/40 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-body-sm text-body-sm shadow-sm" 
                                placeholder="Search notices..." 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="data-table min-w-[600px]">
                            <thead>
                                <tr>
                                    <th>Title & Content</th>
                                    <th>Dates</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map(notice => {
                                    const isExpired = new Date(notice.expiryDate) < new Date();
                                    return (
                                        <tr key={notice.id} className="group">
                                            <td>
                                                <div className="flex items-start gap-3">
                                                    <span className={`material-symbols-outlined text-[18px] mt-0.5 ${isExpired ? 'text-secondary' : 'text-primary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                                        push_pin
                                                    </span>
                                                    <div>
                                                        <p className="font-body-md font-semibold text-on-surface">{notice.title}</p>
                                                        <p className="text-body-sm text-secondary line-clamp-2 mt-1">{notice.content}</p>
                                                        <p className="text-[10px] text-secondary mt-1 uppercase tracking-wider">By {notice.createdByName}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap">
                                                <p className="text-body-sm text-on-surface">{new Date(notice.createdAt).toLocaleDateString()}</p>
                                                <p className="text-label-sm text-secondary mt-0.5">Ends: {new Date(notice.expiryDate).toLocaleDateString()}</p>
                                            </td>
                                            <td>
                                                {isExpired ? (
                                                    <span className="flex items-center gap-1.5 text-secondary font-label-md opacity-70 uppercase text-[11px]">
                                                        <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>Expired
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-green-600 font-label-md uppercase text-[11px]">
                                                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-right">
                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        className="p-1.5 hover:bg-surface-container-high rounded text-error transition-colors" 
                                                        title="Delete"
                                                        onClick={() => setConfirmDelete({ isOpen: true, id: notice.id, isDeleting: false })}
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {paginatedData.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="py-10 text-center text-secondary font-body-md">
                                            No notices found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-outline-variant/30 flex justify-between items-center flex-wrap gap-4">
                            <p className="text-label-md text-secondary">
                                Showing {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, notices.length)} of {notices.length} notices
                            </p>
                            <div className="flex gap-2">
                                <button 
                                    className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/30 text-secondary hover:bg-surface-container-highest transition-colors disabled:opacity-30"
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                >
                                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1B3358] text-white font-label-sm hidden sm:flex">
                                    {currentPage}
                                </button>
                                <button 
                                    className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/30 text-secondary hover:bg-surface-container-highest transition-colors disabled:opacity-30"
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages}
                                >
                                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            
            {/* Publish Form Sidebar (33%) */}
            <aside id="publish-form" className="lg:w-1/3 space-y-6">
                <div className="card !p-0 flex flex-col h-full">
                    <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
                        <h5 className="font-headline-sm text-headline-sm">Publish New Notice</h5>
                    </div>
                    <div className="p-6 flex-1">
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-label-md text-secondary uppercase tracking-wider mb-1.5">Title</label>
                                <input 
                                    type="text" 
                                    value={formData.title} 
                                    onChange={e => setFormData({...formData, title: e.target.value})} 
                                    required 
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="e.g. Water Supply Interruption"
                                />
                            </div>
                            <div>
                                <label className="block text-label-md text-secondary uppercase tracking-wider mb-1.5">Content</label>
                                <textarea 
                                    rows="5" 
                                    value={formData.content} 
                                    onChange={e => setFormData({...formData, content: e.target.value})} 
                                    required 
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                    placeholder="Enter the details of the notice here..."
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-label-md text-secondary uppercase tracking-wider mb-1.5">Expiry Date</label>
                                <input 
                                    type="date" 
                                    value={formData.expiryDate} 
                                    onChange={e => setFormData({...formData, expiryDate: e.target.value})} 
                                    required 
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div className="pt-4 mt-4 border-t border-outline-variant/30">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-full py-3 min-h-[48px] justify-center" 
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Spinner size="sm" color="white" /> : (
                                        <>
                                            <span className="material-symbols-outlined mr-2 text-[20px]">send</span> Publish Notice
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </aside>
        </div>

        <ConfirmModal 
            isOpen={confirmDelete.isOpen}
            onClose={() => setConfirmDelete({ isOpen: false, id: null, isDeleting: false })}
            onConfirm={handleDelete}
            title="Delete Notice"
            message="Are you sure you want to delete this notice? This action cannot be undone."
            confirmText={confirmDelete.isDeleting ? "Deleting..." : "Delete"}
            type="danger"
        />
    </div>
  );
}
