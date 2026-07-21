import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import SkeletonTable from '../../components/common/SkeletonTable';
import Spinner from '../../components/common/Spinner';
import useDataList from '../../hooks/useDataList';

export default function ResidentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ title: '', description: '', category: 'PLUMBING' });
  const [file, setFile] = useState(null);
  const toast = useToast();

  const searchFilterFn = (c, query, filterState) => {
    const matchesSearch = !query || 
      c.title.toLowerCase().includes(query.toLowerCase()) || 
      c.description.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase());
      
    const matchesStatus = filterState.searchStatus === 'All' || c.status === filterState.searchStatus;
    const matchesCategory = filterState.searchCategory === 'All' || c.category === filterState.searchCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  };

  const {
    searchQuery, setSearchQuery,
    filterState, setFilterState,
    paginatedData, currentPage, totalPages, nextPage, prevPage
  } = useDataList(complaints, searchFilterFn, { searchStatus: 'All', searchCategory: 'All' }, 10);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleRaise = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('complaint', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
      if (file) {
        data.append('file', file);
      }

      await api.post('/complaints', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Complaint raised successfully');
      setIsModalOpen(false);
      setFormData({ title: '', description: '', category: 'PLUMBING' });
      setFile(null);
      fetchComplaints();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to raise complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN': 
          return <span className="badge bg-error-container text-on-error-container">Open</span>;
      case 'IN_PROGRESS': 
          return <span className="badge bg-secondary-container text-on-secondary-container">In Progress</span>;
      case 'RESOLVED': 
          return <span className="badge bg-tertiary-container/20 text-tertiary">Resolved</span>;
      default: 
          return <span className="badge bg-surface-container text-on-surface-variant">{status}</span>;
    }
  };

  const getCategoryIcon = (category) => {
      switch (category) {
          case 'PLUMBING': return 'plumbing';
          case 'ELECTRICAL': return 'electrical_services';
          case 'SECURITY': return 'security';
          case 'COMMON_AREA': return 'home_repair_service';
          default: return 'handyman';
      }
  };

  // Stats
  const openIssues = complaints.filter(c => c.status === 'OPEN').length;
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolved = complaints.filter(c => c.status === 'RESOLVED').length;

  if (loading) {
      return (
          <div className="w-full">
              <SkeletonTable columns={6} rows={5} />
          </div>
      );
  }

  return (
  return (
    <div className="w-full space-y-6">
        {/* Page Header Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <nav className="flex items-center gap-2 text-secondary mb-2">
                    <span className="font-label-md">Resident Portal</span>
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>chevron_right</span>
                    <span className="font-label-md text-primary">Maintenance</span>
                </nav>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Maintenance &amp; Complaints</h2>
                <p className="font-body-md text-body-md text-secondary max-w-2xl">
                    Manage your property issues efficiently. Report new complaints, track progress of ongoing repairs, and review your maintenance history in one place.
                </p>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary btn-md"
            >
                <span className="material-symbols-outlined mr-2">add_circle</span>
                Raise New Complaint
            </button>
        </section>

        {/* Status Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card border-l-4 border-error relative overflow-hidden group">
                <div className="absolute right-[-10px] bottom-[-10px] text-error/5 group-hover:text-error/10 transition-colors">
                    <span className="material-symbols-outlined text-[80px]">assignment_late</span>
                </div>
                <p className="font-label-md text-secondary mb-2">Open Issues</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface">{String(openIssues).padStart(2, '0')}</h3>
                    {openIssues > 0 && (
                        <span className="text-error font-label-sm bg-error-container/20 px-2 py-0.5 rounded flex items-center gap-1">
                            Urgent
                        </span>
                    )}
                </div>
            </div>
            
            <div className="card border-l-4 border-secondary relative overflow-hidden group">
                <div className="absolute right-[-10px] bottom-[-10px] text-secondary/5 group-hover:text-secondary/10 transition-colors">
                    <span className="material-symbols-outlined text-[80px]">sync</span>
                </div>
                <p className="font-label-md text-secondary mb-2">In Progress</p>
                <h3 className="text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface">{String(inProgress).padStart(2, '0')}</h3>
            </div>
            
            <div className="card border-l-4 border-tertiary relative overflow-hidden group">
                <div className="absolute right-[-10px] bottom-[-10px] text-tertiary/5 group-hover:text-tertiary/10 transition-colors">
                    <span className="material-symbols-outlined text-[80px]">task_alt</span>
                </div>
                <p className="font-label-md text-secondary mb-2">Resolved (Total)</p>
                <h3 className="text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface">{String(resolved).padStart(2, '0')}</h3>
            </div>
        </section>

        {/* Data Table Card */}
        <div className="card !p-0 overflow-hidden flex flex-col">
            {/* Filters */}
            <div className="p-4 border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-bright">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Recent Complaints</h3>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary/60 text-[18px]">search</span>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search issues..." 
                            className="w-full sm:w-64 bg-surface-container-lowest border border-outline-variant/50 rounded-md pl-9 pr-3 py-2 text-label-md focus:ring-1 focus:ring-primary focus:border-primary outline-none shadow-sm"
                        />
                    </div>
                    <select 
                        value={filterState.searchStatus}
                        onChange={(e) => setFilterState('searchStatus', e.target.value)}
                        className="bg-surface-container-lowest border border-outline-variant/50 rounded-md px-3 py-2 text-label-md focus:ring-1 focus:ring-primary focus:border-primary outline-none shadow-sm"
                    >
                        <option value="All">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>
                    <select 
                        value={filterState.searchCategory}
                        onChange={(e) => setFilterState('searchCategory', e.target.value)}
                        className="bg-surface-container-lowest border border-outline-variant/50 rounded-md px-3 py-2 text-label-md focus:ring-1 focus:ring-primary focus:border-primary outline-none hidden sm:block shadow-sm"
                    >
                        <option value="All">All Categories</option>
                        <option value="PLUMBING">Plumbing</option>
                        <option value="ELECTRICAL">Electrical</option>
                        <option value="SECURITY">Security</option>
                        <option value="COMMON_AREA">Common Area</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1">
                <table className="data-table min-w-[800px]">
                    <thead>
                        <tr>
                            <th>Complaint ID</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Date Filed</th>
                            <th className="text-center">Status</th>
                            <th className="text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(c => (
                            <tr key={c.id} className="group">
                                <td className="font-semibold text-primary">#PRT-{new Date(c.createdAt).getFullYear()}-{String(c.id).padStart(3, '0')}</td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg opacity-40">{getCategoryIcon(c.category)}</span>
                                        {c.category}
                                    </div>
                                </td>
                                <td>
                                    <p className="font-semibold text-on-surface truncate max-w-[200px] lg:max-w-xs">{c.title}</p>
                                    <p className="truncate max-w-[200px] lg:max-w-xs text-xs text-secondary">{c.description}</p>
                                </td>
                                <td>{new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                <td className="text-center">
                                    {getStatusBadge(c.status)}
                                </td>
                                <td className="text-right">
                                    {c.imageUrl ? (
                                        <a href={`http://localhost:8080${c.imageUrl}`} target="_blank" rel="noreferrer" className="text-primary hover:underline font-label-sm whitespace-nowrap flex items-center justify-end gap-1">
                                            <span className="material-symbols-outlined text-[16px]">image</span> View Image
                                        </a>
                                    ) : (
                                        <span className="text-secondary font-label-sm">No Image</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-10 text-secondary">
                                    No complaints found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination/Footer */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-outline-variant/30 flex items-center justify-between">
                    <p className="font-label-sm text-secondary">
                        Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, complaints.length)} of {complaints.length} results
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

        {/* Bottom Asymmetric Callouts */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
            <div className="lg:col-span-8 card flex gap-8 items-center border-t-2 border-primary-container">
                <div className="hidden sm:flex w-32 h-32 flex-shrink-0 bg-surface-container rounded-lg items-center justify-center text-primary-container/20 overflow-hidden relative">
                    {/* Abstract placeholder instead of image */}
                    <span className="material-symbols-outlined text-[80px] absolute transform -rotate-12">handyman</span>
                </div>
                <div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface mb-2">Annual Maintenance Package</h4>
                    <p className="font-body-sm text-body-sm text-secondary mb-4">Your Gold Subscription includes priority servicing and free monthly electrical checkups. Ensure your home is in peak condition.</p>
                    <div className="flex gap-4">
                        <button className="font-label-lg text-primary flex items-center gap-2 group">
                            View Benefits 
                            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="lg:col-span-4 card bg-[#1B3358] text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="font-headline-sm text-headline-sm mb-4">Emergency Contact</h4>
                    <p className="font-body-sm text-body-sm text-white/70 mb-6">Immediate pipe burst or total power failure? Call our 24/7 technical hotline.</p>
                    <div className="flex flex-col gap-3">
                        <a href="tel:18005550911" className="bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg flex items-center gap-3 transition-colors">
                            <span className="material-symbols-outlined text-primary-container">call</span>
                            <span className="font-label-lg">1800-555-0911</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>

        {/* Raise Complaint Modal */}
        {isModalOpen && (
            <div className="modal-overlay">
                <div className="modal-content w-full max-w-lg">
                    <div className="modal-header">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">Raise a Complaint</h3>
                        <button 
                            className="text-secondary hover:text-on-surface transition-colors"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <form onSubmit={handleRaise}>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block font-label-md text-secondary mb-1">Title</label>
                                <input 
                                    type="text" 
                                    value={formData.title} 
                                    onChange={e => setFormData({...formData, title: e.target.value})} 
                                    required 
                                    className="w-full border border-outline-variant/50 rounded-md p-3 text-body-md focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
                                    placeholder="Brief title of the issue"
                                />
                            </div>
                            <div>
                                <label className="block font-label-md text-secondary mb-1">Category</label>
                                <select 
                                    value={formData.category} 
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                    className="w-full border border-outline-variant/50 rounded-md p-3 text-body-md outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none bg-surface-container-lowest shadow-sm"
                                >
                                    <option value="PLUMBING">Plumbing</option>
                                    <option value="ELECTRICAL">Electrical</option>
                                    <option value="SECURITY">Security</option>
                                    <option value="COMMON_AREA">Common Area</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-label-md text-secondary mb-1">Description</label>
                                <textarea 
                                    rows="4" 
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                    required 
                                    className="w-full border border-outline-variant/50 rounded-md p-3 text-body-md focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none shadow-sm"
                                    placeholder="Provide detailed information..."
                                />
                            </div>
                            <div>
                                <label className="block font-label-md text-secondary mb-1">Attachment (Image)</label>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={e => setFile(e.target.files[0])} 
                                    className="w-full border border-outline-variant/50 rounded-md p-2 text-body-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-label-sm file:bg-surface-container-low file:text-secondary hover:file:bg-surface-container-highest cursor-pointer shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-outline" 
                                onClick={() => setIsModalOpen(false)} 
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Spinner size="sm" /> : 'Submit Issue'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}
