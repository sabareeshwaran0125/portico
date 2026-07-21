import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/common/Spinner';
import useDataList from '../../hooks/useDataList';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const toast = useToast();

  const searchFilterFn = (c, query, filterState) => {
    const matchesSearch = !query || 
      c.title.toLowerCase().includes(query.toLowerCase()) || 
      c.category.toLowerCase().includes(query.toLowerCase()) || 
      c.status.toLowerCase().includes(query.toLowerCase()) ||
      (c.raisedByName && c.raisedByName.toLowerCase().includes(query.toLowerCase()));

    const matchesStatus = filterState.searchStatus === '' || c.status === filterState.searchStatus;
    const matchesCategory = filterState.searchCategory === '' || c.category === filterState.searchCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  };

  const {
    searchQuery, setSearchQuery,
    filterState, setFilterState,
    paginatedData, currentPage, totalPages, nextPage, prevPage
  } = useDataList(complaints, searchFilterFn, { searchStatus: '', searchCategory: '' }, 10);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.put(`/complaints/${id}/status?status=${newStatus}`);
      toast.success('Complaint status updated');
      fetchComplaints();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getPriorityInfo = (category) => {
    if (category === 'PLUMBING' || category === 'ELECTRICAL') return { level: 'High', color: 'bg-error-container text-on-error-container', dot: 'bg-error' };
    if (category === 'CARPENTRY') return { level: 'Medium', color: 'bg-secondary-container text-on-secondary-container', dot: 'bg-secondary' };
    return { level: 'Low', color: 'bg-surface-container-high text-on-surface-variant', dot: 'bg-outline' };
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-error-container text-error border-error-container';
      case 'IN_PROGRESS': return 'bg-tertiary-fixed text-on-tertiary-fixed-variant border-tertiary-fixed';
      case 'RESOLVED': return 'bg-tertiary/10 text-tertiary border-tertiary/20';
      default: return 'bg-surface-container-highest text-on-surface-variant border-surface-container-highest';
    }
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-[50vh] w-full">
              <Spinner size="lg" color="primary" />
          </div>
      );
  }

  const openComplaintsCount = complaints.filter(c => c.status === 'OPEN').length;
  const resolvedComplaintsCount = complaints.filter(c => c.status === 'RESOLVED').length;

  return (
    <div className="w-full space-y-6">
        {/* Header equivalent for context */}
        <div className="flex justify-between items-end mb-4">
            <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Complaints Management</h2>
                <p className="text-secondary font-body-md mt-1">Track and resolve resident issues efficiently.</p>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card group hover:-translate-y-1 transition-transform flex items-center justify-between">
                <div>
                    <p className="font-label-md text-label-md text-secondary uppercase tracking-wider mb-1">Open Complaints</p>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface">{openComplaintsCount}</h3>
                    <p className="font-label-sm text-label-sm text-primary mt-1">Needs immediate action</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 0" }}>pending_actions</span>
                </div>
            </div>
            
            <div className="card group hover:-translate-y-1 transition-transform flex items-center justify-between">
                <div>
                    <p className="font-label-md text-label-md text-secondary uppercase tracking-wider mb-1">Total Resolved</p>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface">{resolvedComplaintsCount}</h3>
                    <p className="font-label-sm text-label-sm text-tertiary mt-1">Great job!</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary shrink-0">
                    <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 0" }}>task_alt</span>
                </div>
            </div>
            
            <div className="card group hover:-translate-y-1 transition-transform flex items-center justify-between">
                <div>
                    <p className="font-label-md text-label-md text-secondary uppercase tracking-wider mb-1">Avg. Resolution Time</p>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface">12h</h3>
                    <p className="font-label-sm text-label-sm text-secondary opacity-70 mt-1">Within SLA</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shrink-0">
                    <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 0" }}>timer</span>
                </div>
            </div>
        </div>

        {/* Filters & Table Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-72 min-w-[200px]">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-50">search</span>
                    <input 
                        className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-body-sm text-body-sm shadow-sm" 
                        placeholder="Search title, resident..." 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select 
                    className="px-4 py-2 bg-surface-container-lowest border border-outline-variant/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-body-sm shadow-sm appearance-none min-w-[130px]"
                    value={filterState.searchStatus}
                    onChange={e => setFilterState('searchStatus', e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                </select>
                <select 
                    className="px-4 py-2 bg-surface-container-lowest border border-outline-variant/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-body-sm shadow-sm appearance-none min-w-[130px]"
                    value={filterState.searchCategory}
                    onChange={e => setFilterState('searchCategory', e.target.value)}
                >
                    <option value="">All Categories</option>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="CARPENTRY">Carpentry</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="OTHER">Other</option>
                </select>
            </div>
            <button className="btn btn-primary btn-md whitespace-nowrap">
                Generate Report
            </button>
        </div>

        {/* Complaints Table Card */}
        <div className="card !p-0 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
                <h4 className="font-headline-sm text-headline-sm">Recent Complaints</h4>
                <div className="flex gap-2">
                    <span className="badge bg-surface-container-high text-secondary">Total ({complaints.length})</span>
                </div>
            </div>
            <div className="overflow-x-auto flex-1">
                <table className="data-table min-w-[900px]">
                    <thead>
                        <tr>
                            <th>Resident Name</th>
                            <th>Unit #</th>
                            <th>Subject</th>
                            <th>Date Filed</th>
                            <th>Priority</th>
                            <th>Status / Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(c => {
                            const priorityInfo = getPriorityInfo(c.category);
                            return (
                                <tr key={c.id} className="group">
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-on-secondary-fixed text-[10px] shrink-0">
                                                {c.raisedByName ? c.raisedByName.substring(0,2).toUpperCase() : 'NA'}
                                            </div>
                                            <span className="font-body-md text-body-md font-medium text-on-surface">{c.raisedByName || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap">
                                        {c.raisedByFlatDetails || 'Unknown'}
                                    </td>
                                    <td>
                                        <div className="font-body-md text-body-md text-on-surface font-medium">{c.title}</div>
                                        <div className="font-body-sm text-body-sm text-secondary truncate max-w-[200px] mt-0.5">{c.description}</div>
                                        {c.imageUrl && (
                                            <a href={`http://localhost:8080${c.imageUrl}`} target="_blank" rel="noreferrer" className="text-primary hover:underline text-[12px] flex items-center mt-1">
                                                <span className="material-symbols-outlined text-[14px] mr-1">attachment</span> View File
                                            </a>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap">
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span className={`badge ${priorityInfo.color}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${priorityInfo.dot}`}></span>
                                            {priorityInfo.level}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <select 
                                                className={`appearance-none px-3 py-1.5 rounded-md font-label-sm text-[11px] uppercase border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 ${getStatusStyle(c.status)}`}
                                                value={c.status}
                                                onChange={(e) => handleStatusChange(c.id, e.target.value)}
                                                disabled={updatingId === c.id}
                                            >
                                                <option value="OPEN">Open</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="RESOLVED">Resolved</option>
                                            </select>
                                            {updatingId === c.id && <Spinner size="sm" color="primary" />}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan="6" className="py-10 text-center text-secondary font-body-md">
                                    No complaints found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-outline-variant/30 flex items-center justify-between flex-wrap gap-4">
                    <span className="font-label-sm text-label-sm text-secondary">
                        Showing {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, complaints.length)} of {complaints.length} results
                    </span>
                    <div className="flex items-center gap-2">
                        <button 
                            className="p-2 rounded hover:bg-surface-container-high text-secondary disabled:opacity-30 border border-outline-variant/30 transition-colors"
                            onClick={prevPage}
                            disabled={currentPage === 1}
                        >
                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        <button className="w-8 h-8 rounded bg-primary text-white font-label-md text-label-md hidden sm:block">{currentPage}</button>
                        <button 
                            className="p-2 rounded hover:bg-surface-container-high text-secondary disabled:opacity-30 border border-outline-variant/30 transition-colors"
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                        >
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Secondary Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card flex flex-col justify-center">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="font-headline-sm text-headline-sm">Staff Workload</h4>
                    <button className="text-primary font-label-lg text-label-lg flex items-center gap-1 hover:underline">
                        Manage Staff <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-surface-container-high flex items-center justify-center">
                            <span className="material-symbols-outlined text-secondary">engineering</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-1">
                                <span className="font-body-md text-body-md font-medium text-on-surface">Plumbing & Electrical</span>
                                <span className="font-label-sm text-label-sm text-secondary">Medium Load</span>
                            </div>
                            <div className="w-full bg-surface-container rounded-full h-2">
                                <div className="bg-tertiary h-2 rounded-full" style={{ width: '62%' }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-surface-container-high flex items-center justify-center">
                            <span className="material-symbols-outlined text-secondary">cleaning_services</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-1">
                                <span className="font-body-md text-body-md font-medium text-on-surface">Facilities & Cleaning</span>
                                <span className="font-label-sm text-label-sm text-secondary">High Load</span>
                            </div>
                            <div className="w-full bg-surface-container rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: '87%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-[#1B3358] p-6 rounded-xl shadow-lg text-white flex flex-col">
                <h4 className="font-headline-sm text-headline-sm text-white mb-4">Critical Alert</h4>
                <div className="p-4 bg-white/10 rounded-lg border border-white/20 mb-6 flex-1">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary-fixed">priority_high</span>
                        <div>
                            <p className="font-label-lg text-label-lg mb-1">Water Supply Maintenance</p>
                            <p className="font-body-sm text-[13px] text-surface-variant/80">Scheduled for tomorrow 10AM-2PM. 3 blocks will be affected.</p>
                        </div>
                    </div>
                </div>
                <button className="w-full py-3 bg-primary text-white rounded-lg font-label-lg text-label-lg hover:brightness-110 transition-all">
                    Broadcast Update
                </button>
            </div>
        </div>
    </div>
  );
}
