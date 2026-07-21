import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';
import SkeletonTable from '../../components/common/SkeletonTable';
import Spinner from '../../components/common/Spinner';
import useDataList from '../../hooks/useDataList';

export default function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmReject, setConfirmReject] = useState({ isOpen: false, id: null, isRejecting: false });
  const [confirmApprove, setConfirmApprove] = useState({ isOpen: false, id: null, isApproving: false });
  
  const [formData, setFormData] = useState({ name: '', phone: '', flatId: '', expectedArrival: '', purpose: 'Social Guest' });
  const toast = useToast();

  const searchFilterFn = (visitor, query, filterState) => {
    const matchesSearch = !query || 
      visitor.name.toLowerCase().includes(query.toLowerCase()) || 
      visitor.phone.includes(query) ||
      visitor.purpose.toLowerCase().includes(query.toLowerCase());
      
    const matchesStatus = filterState.searchStatus === 'All' || visitor.approvalStatus === filterState.searchStatus;

    return matchesSearch && matchesStatus;
  };

  const {
    searchQuery, setSearchQuery,
    filterState, setFilterState,
    paginatedData, currentPage, totalPages, nextPage, prevPage
  } = useDataList(visitors, searchFilterFn, { searchStatus: 'All' }, 10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [visRes, flatRes] = await Promise.all([
        api.get('/resident/visitors'),
        api.get('/resident/flats')
      ]);
      setVisitors(visRes.data.sort((a,b) => new Date(b.expectedArrival) - new Date(a.expectedArrival)));
      setFlats(flatRes.data);
      if (flatRes.data.length > 0) {
        setFormData(prev => ({ ...prev, flatId: flatRes.data[0].id }));
      }
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to load visitors or flats');
    } finally {
      setLoading(false);
    }
  };

  const handlePreApprove = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        expectedArrival: formData.expectedArrival + ':00' 
      };
      await api.post('/resident/visitors/pre-approve', payload);
      toast.success('Visitor pre-approved successfully');
      setIsModalOpen(false);
      setFormData(prev => ({ ...prev, name: '', phone: '', expectedArrival: '', purpose: 'Social Guest' }));
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to pre-approve visitor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproval = async (id, status) => {
    if (status === 'REJECTED') {
      setConfirmReject(prev => ({ ...prev, isRejecting: true }));
    } else if (status === 'APPROVED') {
      setConfirmApprove(prev => ({ ...prev, isApproving: true }));
    }
    try {
      await api.put(`/resident/visitors/${id}/approval?status=${status}`);
      toast.success(`Visitor ${status.toLowerCase()} successfully`);
      if (status === 'REJECTED') {
        setConfirmReject({ isOpen: false, id: null, isRejecting: false });
      } else if (status === 'APPROVED') {
        setConfirmApprove({ isOpen: false, id: null, isApproving: false });
      }
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || `Failed to ${status.toLowerCase()} visitor`);
      if (status === 'REJECTED') {
        setConfirmReject(prev => ({ ...prev, isRejecting: false }));
      } else if (status === 'APPROVED') {
        setConfirmApprove(prev => ({ ...prev, isApproving: false }));
      }
    }
  };

  const getStatusBadge = (visitor) => {
    if (visitor.approvalStatus === 'APPROVED') {
        if (visitor.outTime) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-surface-container-highest text-on-surface-variant">
                    <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></span>
                    Checked Out
                </span>
            );
        }
        if (visitor.entryTime && !visitor.outTime) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-secondary-container/20 text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    Checked In
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-tertiary-container/20 text-tertiary">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                Expected
            </span>
        );
    }
    
    if (visitor.approvalStatus === 'PENDING') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-amber-100 text-amber-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                Pending Approval
            </span>
        );
    }

    if (visitor.approvalStatus === 'REJECTED') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-error-container text-error">
                <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                Rejected
            </span>
        );
    }
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-surface-container-highest text-on-surface-variant">{visitor.approvalStatus}</span>;
  };

  const getPurposeIcon = (purpose) => {
      const p = purpose ? purpose.toLowerCase() : '';
      if (p.includes('delivery') || p.includes('amazon') || p.includes('flipkart') || p.includes('swiggy') || p.includes('zomato')) {
          return { icon: 'local_shipping', bg: 'bg-surface-container-highest', text: 'text-on-surface-variant' };
      }
      if (p.includes('service') || p.includes('maintenance') || p.includes('repair') || p.includes('plumber') || p.includes('electrician')) {
          return { icon: 'build', bg: 'bg-surface-container-highest', text: 'text-on-surface-variant' };
      }
      return { icon: 'person', bg: 'bg-surface-container-highest', text: 'text-on-surface-variant' };
  };

  // Stats computation
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const upcomingToday = visitors.filter(v => v.approvalStatus === 'APPROVED' && v.entryTime === null && new Date(v.expectedArrival) >= today && new Date(v.expectedArrival) < tomorrow).length;
  const currentlyIn = visitors.filter(v => v.entryTime !== null && v.outTime === null).length;
  
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const totalThisMonth = visitors.filter(v => new Date(v.expectedArrival) >= currentMonthStart).length;
  const pendingApprovals = visitors.filter(v => v.approvalStatus === 'PENDING').length;

  // Split upcoming (APPROVED, expected in future, not yet entered)
  const now = new Date();
  const upcomingVisitors = visitors.filter(v => v.approvalStatus === 'APPROVED' && v.entryTime === null && new Date(v.expectedArrival) >= now)
                                   .sort((a,b) => new Date(a.expectedArrival) - new Date(b.expectedArrival))
                                   .slice(0, 3); // Get top 3 upcoming

  if (loading) {
      return (
          <div className="w-full">
              <SkeletonTable columns={6} rows={5} />
          </div>
      );
  }

  return (
    <div className="space-y-8 w-full">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
                    <span className="font-label-md text-label-md">Resident Portal</span>
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>chevron_right</span>
                    <span className="font-label-md text-label-md text-primary">Visitor Management</span>
                </nav>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Visitor Management</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage and track all guest access to your residence.</p>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary-container text-white px-6 py-3 rounded font-label-lg text-label-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-sm active:scale-95"
            >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>person_add</span>
                Pre-approve Guest
            </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="card flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-fixed rounded-full flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">event_upcoming</span>
                </div>
                <div>
                    <p className="font-label-md text-secondary">Upcoming Today</p>
                    <p className="font-headline-sm text-headline-sm text-on-surface">{String(upcomingToday).padStart(2, '0')}</p>
                </div>
            </div>
            
            <div className="card flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary-fixed rounded-full flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">login</span>
                </div>
                <div>
                    <p className="font-label-md text-secondary">Currently In</p>
                    <p className="font-headline-sm text-headline-sm text-on-surface">{String(currentlyIn).padStart(2, '0')}</p>
                </div>
            </div>
            
            <div className="card flex items-center gap-4">
                <div className="w-12 h-12 bg-tertiary-fixed rounded-full flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined">history</span>
                </div>
                <div>
                    <p className="font-label-md text-secondary">Total This Month</p>
                    <p className="font-headline-sm text-headline-sm text-on-surface">{String(totalThisMonth).padStart(2, '0')}</p>
                </div>
            </div>
            
            <div className="card flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">pending_actions</span>
                </div>
                <div>
                    <p className="font-label-md text-secondary">Pending Approvals</p>
                    <p className="font-headline-sm text-headline-sm text-amber-600">{String(pendingApprovals).padStart(2, '0')}</p>
                </div>
            </div>
        </div>

        {/* Section 1: Upcoming Visitors */}
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Upcoming Visitors</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingVisitors.map(visitor => {
                    const expectedDate = new Date(visitor.expectedArrival);
                    const isToday = expectedDate >= today && expectedDate < tomorrow;
                    const dateStr = isToday ? 'Today, ' + expectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : expectedDate.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
                    const timeStr = expectedDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' IST';
                    const diffMs = expectedDate - now;
                    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                    let timeBadge = '';
                    if (isToday) {
                        timeBadge = diffHrs <= 2 ? 'In ' + diffHrs + ' Hours' : 'Today';
                    } else {
                        timeBadge = expectedDate.toLocaleDateString();
                    }

                    const purposeInfo = getPurposeIcon(visitor.purpose);

                    return (
                        <div key={visitor.id} className="card !p-0 overflow-hidden hover:border-primary/30 transition-colors group flex flex-col">
                            <div className="p-6 flex-grow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${purposeInfo.bg} ${purposeInfo.text}`}>
                                            <span className="material-symbols-outlined text-[24px]">{purposeInfo.icon}</span>
                                        </div>
                                        <div>
                                            <p className="font-label-lg text-label-lg text-on-surface">{visitor.name}</p>
                                            <p className="font-label-sm text-label-sm text-secondary">{visitor.purpose || 'Guest'}</p>
                                        </div>
                                    </div>
                                    <span className="bg-primary-fixed text-on-primary-fixed px-2 py-1 rounded text-label-sm font-label-sm whitespace-nowrap">{timeBadge}</span>
                                </div>
                                
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-secondary">
                                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                        <span className="font-body-sm text-body-sm">{dateStr}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-secondary">
                                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                                        <span className="font-body-sm text-body-sm">Expected: {timeStr}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-secondary">
                                        <span className="material-symbols-outlined text-[18px]">call</span>
                                        <span className="font-body-sm text-body-sm">{visitor.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                {/* Add New Guest Card Placeholder */}
                <div 
                    onClick={() => setIsModalOpen(true)}
                    className="card !bg-surface-container-lowest border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-surface-container-low transition-all min-h-[250px] shadow-none"
                >
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[24px]">add</span>
                    </div>
                    <p className="font-label-lg text-label-lg text-on-surface">Add New Guest</p>
                    <p className="font-label-sm text-label-sm text-secondary mt-1">Pre-approve visitors for faster entry</p>
                </div>
            </div>
        </div>

        {/* Section 2: Visitor History */}
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Visitor History</h3>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search name or purpose..." 
                            className="w-full sm:w-64 border border-outline-variant rounded-lg pl-9 pr-3 py-2 text-label-md focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        />
                    </div>
                    <select 
                        value={filterState.searchStatus}
                        onChange={(e) => setFilterState('searchStatus', e.target.value)}
                        className="border border-outline-variant rounded-lg px-3 py-2 text-label-md focus:ring-1 focus:ring-primary focus:border-primary outline-none appearance-none"
                    >
                        <option value="All">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>
            
            <div className="card !p-0 overflow-x-auto flex flex-col">
                <table className="data-table min-w-[800px]">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Date</th>
                            <th>Arrival Time</th>
                            <th>Departure Time</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(v => {
                            const pIcon = getPurposeIcon(v.purpose);
                            return (
                                <tr key={v.id} className="group">
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] ${pIcon.bg} ${pIcon.text}`}>
                                                <span className="material-symbols-outlined text-[16px]">{pIcon.icon}</span>
                                            </div>
                                            <div>
                                                <span className="block font-body-md text-body-md text-on-surface font-semibold">{v.name}</span>
                                                <span className="block text-[11px] text-secondary">{v.purpose}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {new Date(v.expectedArrival).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td>
                                        {v.entryTime ? new Date(v.entryTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' IST' : '--'}
                                    </td>
                                    <td>
                                        {v.outTime ? new Date(v.outTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' IST' : '--'}
                                    </td>
                                    <td>
                                        {getStatusBadge(v)}
                                    </td>
                                    <td>
                                        {v.approvalStatus === 'PENDING' ? (
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    className="w-8 h-8 flex items-center justify-center rounded-full text-green-600 hover:bg-green-50 transition-colors"
                                                    onClick={() => setConfirmApprove({ isOpen: true, id: v.id, isApproving: false })}
                                                    title="Approve"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                                </button>
                                                <button 
                                                    className="w-8 h-8 flex items-center justify-center rounded-full text-error hover:bg-error-container/50 transition-colors"
                                                    onClick={() => setConfirmReject({ isOpen: true, id: v.id, isRejecting: false })}
                                                    title="Reject"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">cancel</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-secondary">-</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-10 text-secondary">
                                    No visitor records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-outline-variant/30 flex items-center justify-between">
                        <p className="font-label-sm text-secondary">
                            Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, visitors.length)} of {visitors.length} visitors
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="w-8 h-8 flex items-center justify-center border border-outline-variant/50 rounded-md text-secondary hover:bg-surface-container-highest transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center bg-[#1B3358] text-white rounded-md font-label-md">
                                {currentPage}
                            </button>
                            <button 
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className="w-8 h-8 flex items-center justify-center border border-outline-variant/50 rounded-md text-secondary hover:bg-surface-container-highest transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Contextual Help Card */}
        <div className="card bg-[#1B3358] text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" width="100%">
                    <path d="M0 100 L100 0 V100 Z" fill="currentColor"></path>
                    <path d="M0 0 L100 100 H0 Z" fill="currentColor"></path>
                </svg>
            </div>
            <div className="relative z-10 max-w-2xl text-center md:text-left">
                <h4 className="font-headline-md text-headline-md mb-2 text-white">Automate Guest Parking</h4>
                <p className="font-body-md text-body-md text-white/80">Guests approved via Portico get automatic license plate recognition for seamless entry. No more waiting at the gate.</p>
            </div>
            <div className="relative z-10">
                <button className="bg-white text-[#1B3358] px-6 py-3 rounded-md font-label-lg hover:bg-opacity-90 transition-all flex items-center gap-2 whitespace-nowrap shadow-sm active:scale-95">
                    Configure Garage Access
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>
        </div>

        {/* Pre-approve Guest Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(27,39,51,0.08)] w-full max-w-lg overflow-hidden transform transition-all animate-[fade-in_0.2s_ease-out,zoom-in_0.2s_ease-out]">
                    <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">Pre-approve Guest</h3>
                        <button 
                            className="text-on-surface-variant hover:text-primary transition-colors"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <form onSubmit={handlePreApprove}>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block font-label-lg text-label-lg mb-2 text-on-surface-variant">Select Your Flat</label>
                                <select 
                                    value={formData.flatId} 
                                    onChange={e => setFormData({...formData, flatId: e.target.value})} 
                                    required
                                    className="w-full border border-outline-variant rounded-lg p-3 text-body-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-surface-container-low"
                                >
                                    {flats.map(f => <option key={f.id} value={f.id}>{f.block}-{f.flatNumber}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block font-label-lg text-label-lg mb-2 text-on-surface-variant">Full Name</label>
                                <input 
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    required
                                    className="w-full border border-outline-variant rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                                />
                            </div>
                            <div>
                                <label className="block font-label-lg text-label-lg mb-2 text-on-surface-variant">Phone Number</label>
                                <input 
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                    required
                                    className="w-full border border-outline-variant rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                                />
                            </div>
                            <div>
                                <label className="block font-label-lg text-label-lg mb-2 text-on-surface-variant">Expected Arrival</label>
                                <input 
                                    type="datetime-local"
                                    value={formData.expectedArrival}
                                    onChange={e => setFormData({...formData, expectedArrival: e.target.value})}
                                    required
                                    className="w-full border border-outline-variant rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                                />
                            </div>
                            <div>
                                <label className="block font-label-lg text-label-lg mb-2 text-on-surface-variant">Visitor Category</label>
                                <select 
                                    value={formData.purpose}
                                    onChange={e => setFormData({...formData, purpose: e.target.value})}
                                    required
                                    className="w-full border border-outline-variant rounded-lg p-3 text-body-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-surface-container-low"
                                >
                                    <option value="Social Guest">Social Guest</option>
                                    <option value="Service/Maintenance">Service/Maintenance</option>
                                    <option value="Delivery">Delivery</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 bg-surface-container-low flex justify-end gap-3 border-t border-outline-variant/30">
                            <button 
                                type="button"
                                className="px-6 py-2 rounded-lg border border-outline-variant text-on-surface font-label-lg text-label-lg hover:bg-surface-variant transition-colors"
                                onClick={() => setIsModalOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="px-6 py-2 rounded-lg bg-primary-container text-white font-label-lg text-label-lg hover:opacity-90 transition-all flex items-center gap-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Spinner size="sm" /> : 'Send Approval'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        <ConfirmModal 
            isOpen={confirmApprove.isOpen}
            onClose={() => setConfirmApprove({ isOpen: false, id: null, isApproving: false })}
            onConfirm={() => handleApproval(confirmApprove.id, 'APPROVED')}
            title="Approve Visitor"
            message="Are you sure you want to approve this visitor? They will be allowed entry."
            confirmText={confirmApprove.isApproving ? "Approving..." : "Approve"}
            type="primary"
        />

        <ConfirmModal 
            isOpen={confirmReject.isOpen}
            onClose={() => setConfirmReject({ isOpen: false, id: null, isRejecting: false })}
            onConfirm={() => handleApproval(confirmReject.id, 'REJECTED')}
            title="Reject Visitor"
            message="Are you sure you want to reject this visitor? They will not be allowed entry."
            confirmText={confirmReject.isRejecting ? "Rejecting..." : "Reject"}
            type="danger"
        />
    </div>
  );
}
