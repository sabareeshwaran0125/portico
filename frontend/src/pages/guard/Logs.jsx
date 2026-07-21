import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/common/Spinner';
import useDataList from '../../hooks/useDataList';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null); 
  
  const [formData, setFormData] = useState({ name: '', phone: '', flatId: '', purpose: '' });
  const toast = useToast();

  const searchFilterFn = (v, query, filterState) => {
    const matchesSearch = !query || 
      v.name.toLowerCase().includes(query.toLowerCase()) || 
      v.phone.includes(query) ||
      (v.flatDetails && v.flatDetails.toLowerCase().includes(query.toLowerCase()));

    const matchesStatus = filterState.searchStatus === '' || v.approvalStatus === filterState.searchStatus;

    return matchesSearch && matchesStatus;
  };

  const {
    searchQuery, setSearchQuery,
    filterState, setFilterState,
    paginatedData, currentPage, totalPages, nextPage, prevPage
  } = useDataList(logs, searchFilterFn, { searchStatus: '' }, 10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [logsRes, flatRes] = await Promise.all([
        api.get('/guard/visitors'),
        api.get('/guard/flats') 
      ]);
      setLogs(logsRes.data);
      setFlats(flatRes.data);
      if (flatRes.data.length > 0) {
        setFormData(prev => ({ ...prev, flatId: flatRes.data[0].id }));
      }
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to load visitor logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleWalkIn = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData, expectedArrival: new Date().toISOString().replace('Z', '') };
      await api.post('/guard/visitors/walk-in', payload);
      toast.success('Walk-in visitor logged');
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', flatId: flats[0]?.id || '', purpose: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to log walk-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExit = async (id) => {
    setActionId(id);
    try {
      await api.post(`/guard/visitors/${id}/exit`);
      toast.success('Visitor exit logged');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to log exit');
    } finally {
      setActionId(null);
    }
  };

  const handleEntry = async (id) => {
    setActionId(id);
    try {
      await api.post(`/guard/visitors/${id}/entry`);
      toast.success('Visitor entry logged');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to log entry');
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-[50vh] w-full">
              <Spinner size="lg" color="primary" />
          </div>
      );
  }

  const currentlyIn = logs.filter(v => v.entryTime && !v.exitTime).length;
  const pendingApprovals = logs.filter(v => v.approvalStatus === 'PENDING').length;

  return (
    <div className="w-full space-y-8 flex-1 flex flex-col">
        {/* Header equivalent for context */}
        <div className="flex justify-between items-end mb-2">
            <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Visitor Logs</h2>
                <p className="text-secondary font-body-md mt-1">Manage entries, exits, and verify visitor passes.</p>
            </div>
            {/* Shift Status Indicator */}
            <div className="hidden md:flex items-center bg-tertiary-container/10 border border-tertiary-container/20 px-4 py-2 rounded-full">
                <span className="w-2.5 h-2.5 bg-tertiary rounded-full animate-pulse mr-2"></span>
                <span className="text-body-sm font-semibold text-tertiary">Active Shift: Main Gate</span>
            </div>
        </div>

        {/* Hero Stats & Quick Actions */}
        <div className="grid grid-cols-12 gap-6">
            {/* Quick Entry Button Card */}
            <div 
                className="col-span-12 lg:col-span-4 card bg-primary-container text-white flex flex-col justify-between group cursor-pointer hover:bg-primary transition-all duration-300"
                onClick={() => setIsModalOpen(true)}
            >
                <div>
                    <div className="flex justify-between items-start">
                        <h2 className="font-headline-sm text-headline-sm">Log New Entry</h2>
                        <span className="material-symbols-outlined text-4xl opacity-50">person_add</span>
                    </div>
                    <p className="text-white/80 text-body-sm mt-2 max-w-[200px]">Register a new guest, delivery, or service provider manually.</p>
                </div>
                <div className="mt-6 flex items-center gap-2 font-bold group-hover:gap-4 transition-all">
                    <span>START ENTRY</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                </div>
            </div>
            
            {/* Stats Cards */}
            <div className="col-span-12 md:col-span-6 lg:col-span-4 card flex flex-col justify-between">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-secondary text-label-lg uppercase tracking-wider">Currently In</p>
                        <h3 className="font-display-lg text-[40px] leading-tight font-bold mt-1 text-primary">{currentlyIn}</h3>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-lg text-primary">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                    </div>
                </div>
                <div className="mt-4 flex items-center text-body-sm text-tertiary">
                    <span className="material-symbols-outlined text-sm mr-1">monitoring</span>
                    <span>Active visitors on premises</span>
                </div>
            </div>
            
            <div className="col-span-12 md:col-span-6 lg:col-span-4 card flex flex-col justify-between">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-secondary text-label-lg uppercase tracking-wider">Pending Approvals</p>
                        <h3 className="font-display-lg text-[40px] leading-tight font-bold mt-1 text-secondary">{pendingApprovals}</h3>
                    </div>
                    <div className="bg-secondary/10 p-3 rounded-lg text-secondary">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
                    </div>
                </div>
                <div className="mt-4 flex items-center text-body-sm text-secondary">
                    <span className="text-primary font-semibold">Awaiting resident confirmation</span>
                </div>
            </div>
        </div>

        {/* Table & Scanner Section */}
        <div className="grid grid-cols-12 gap-6 flex-1">
            {/* Main Log Table */}
            <div className="col-span-12 xl:col-span-9 card !p-0 overflow-hidden flex flex-col h-full min-h-[500px]">
                <div className="p-4 border-b border-outline-variant/30 flex flex-wrap justify-between items-center gap-4 bg-surface-bright">
                    <h2 className="font-headline-sm text-headline-sm">Visitor Log Records</h2>
                    <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64 min-w-[200px]">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary/60 text-[18px]">search</span>
                            <input 
                                className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-body-sm text-label-md shadow-sm" 
                                placeholder="Search visitor or unit..." 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select 
                            className="px-4 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-label-md shadow-sm appearance-none min-w-[130px]"
                            value={filterState.searchStatus}
                            onChange={e => setFilterState('searchStatus', e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="APPROVED">Approved</option>
                            <option value="PENDING">Pending</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto flex-1">
                    <table className="data-table min-w-[800px]">
                        <thead>
                            <tr>
                                <th>Visitor</th>
                                <th>Purpose</th>
                                <th>Unit #</th>
                                <th>Timing</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map(v => (
                                <tr key={v.id} className="group">
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-sm shrink-0">
                                                {v.name ? v.name.substring(0,2).toUpperCase() : 'VS'}
                                            </div>
                                            <div>
                                                <div className="text-body-md font-semibold text-on-surface">{v.name}</div>
                                                <div className="text-[12px] text-secondary mt-0.5">{v.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {v.approvalStatus === 'APPROVED' ? (
                                            <span className="badge bg-tertiary-fixed text-on-tertiary-fixed-variant">
                                                <span className="material-symbols-outlined text-[14px]">check_circle</span> APPROVED
                                            </span>
                                        ) : v.approvalStatus === 'REJECTED' ? (
                                            <span className="badge bg-error-container text-on-error-container">
                                                <span className="material-symbols-outlined text-[14px]">cancel</span> REJECTED
                                            </span>
                                        ) : (
                                            <span className="badge bg-secondary-container text-on-secondary-container">
                                                <span className="material-symbols-outlined text-[14px]">hourglass_empty</span> PENDING
                                            </span>
                                        )}
                                        <div className="text-[12px] text-secondary mt-1">{v.purpose}</div>
                                    </td>
                                    <td className="font-body-md text-on-surface font-medium whitespace-nowrap">
                                        {v.flatDetails}
                                    </td>
                                    <td className="whitespace-nowrap">
                                        <div className="text-body-sm text-on-surface flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px] text-secondary">login</span>
                                            {v.entryTime ? new Date(v.entryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Pending Entry'}
                                        </div>
                                        <div className="text-body-sm text-secondary flex items-center gap-1 mt-1">
                                            <span className="material-symbols-outlined text-[14px] text-secondary">logout</span>
                                            {v.exitTime ? new Date(v.exitTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Not Exited'}
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {v.approvalStatus === 'APPROVED' && !v.entryTime && (
                                                <button 
                                                    className="btn btn-primary btn-sm min-w-[100px]"
                                                    onClick={() => handleEntry(v.id)} 
                                                    disabled={actionId === v.id}
                                                >
                                                    {actionId === v.id ? <Spinner size="sm" color="white" /> : 'Log Entry'}
                                                </button>
                                            )}
                                            {v.entryTime && !v.exitTime && (
                                                <button 
                                                    className="btn btn-outline btn-sm min-w-[100px]"
                                                    onClick={() => handleExit(v.id)} 
                                                    disabled={actionId === v.id}
                                                >
                                                    {actionId === v.id ? <Spinner size="sm" /> : 'Check Out'}
                                                </button>
                                            )}
                                            {(!v.entryTime && v.approvalStatus !== 'APPROVED') && (
                                                 <span className="text-label-md text-secondary opacity-70">Awaiting Auth</span>
                                            )}
                                            {(v.entryTime && v.exitTime) && (
                                                 <span className="text-label-md text-tertiary flex items-center justify-end gap-1"><span className="material-symbols-outlined text-[16px]">done_all</span> Completed</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-secondary">
                                        No visitors found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-outline-variant/30 flex justify-between items-center flex-wrap gap-4">
                        <p className="text-label-md text-secondary">
                            Showing {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, logs.length)} of {logs.length} records
                        </p>
                        <div className="flex gap-2">
                            <button 
                                className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/50 text-secondary hover:bg-surface-container-highest disabled:opacity-30 transition-colors"
                                onClick={prevPage}
                                disabled={currentPage === 1}
                            >
                                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1B3358] text-white font-label-sm hidden sm:flex">
                                {currentPage}
                            </button>
                            <button 
                                className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant/50 text-secondary hover:bg-surface-container-highest disabled:opacity-30 transition-colors"
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                            >
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Quick Scan Area */}
            <div className="col-span-12 xl:col-span-3 space-y-6">
                {/* Scanner Component */}
                <div className="card flex flex-col items-center text-center">
                    <div className="w-full aspect-square bg-black rounded-lg mb-6 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary/80 animate-[scan_2s_ease-in-out_infinite] z-10" style={{ boxShadow: '0 0 8px 2px rgba(161, 63, 31, 0.8)' }}></div>
                        <img 
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" 
                            alt="QR Scanner Simulation" 
                            src="https://images.unsplash.com/photo-1629814696209-4f4faf2ab874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        />
                        <span className="material-symbols-outlined absolute text-6xl text-white/60 drop-shadow-md">qr_code_scanner</span>
                    </div>
                    <h4 className="font-headline-sm text-headline-sm mb-2 text-on-surface">Quick Scan</h4>
                    <p className="text-body-sm text-secondary mb-6 leading-relaxed">Hold visitor's digital pass or QR code in front of the gate camera to auto-process entry.</p>
                    <button 
                        className="btn btn-secondary w-full flex items-center justify-center gap-2"
                        onClick={() => toast.success("Camera activated. Waiting for QR Code...")}
                    >
                        <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                        SCAN QR CODE
                    </button>
                </div>
                
                {/* Security Notes / Broadcast */}
                <div className="bg-error-container/20 rounded-xl p-5 border border-error/20">
                    <div className="flex items-center gap-2 text-error mb-3">
                        <span className="material-symbols-outlined text-[20px]">warning</span>
                        <span className="text-label-lg font-bold tracking-wider">SECURITY ALERT</span>
                    </div>
                    <p className="text-body-sm text-on-error-container leading-relaxed">
                        Follow standard protocols for unidentified vehicles. Delivery personnel must deposit ID at the gate.
                    </p>
                </div>
            </div>
        </div>

        {/* Log Walk-in Modal */}
        {isModalOpen && (
            <div className="modal-overlay">
                <div className="modal-content w-full max-w-md">
                    <div className="modal-header">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">Log Walk-in Visitor</h3>
                        <button 
                            className="text-secondary hover:text-on-surface transition-colors"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <form onSubmit={handleWalkIn}>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block font-label-md text-secondary mb-1">Visitor Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    required 
                                    className="w-full border border-outline-variant/50 rounded-md p-3 text-body-md focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
                                    placeholder="Full Name"
                                />
                            </div>
                            <div>
                                <label className="block font-label-md text-secondary mb-1">Phone Number</label>
                                <input 
                                    type="tel" 
                                    value={formData.phone} 
                                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                                    required 
                                    className="w-full border border-outline-variant/50 rounded-md p-3 text-body-md focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
                                    placeholder="+91"
                                />
                            </div>
                            <div>
                                <label className="block font-label-md text-secondary mb-1">Flat To Visit</label>
                                <select 
                                    value={formData.flatId} 
                                    onChange={e => setFormData({...formData, flatId: e.target.value})} 
                                    required
                                    className="w-full border border-outline-variant/50 rounded-md p-3 text-body-md focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all appearance-none bg-surface-container-lowest shadow-sm"
                                >
                                    {flats.map(f => <option key={f.id} value={f.id}>{f.block} - {f.flatNumber}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block font-label-md text-secondary mb-1">Purpose</label>
                                <input 
                                    type="text" 
                                    value={formData.purpose} 
                                    onChange={e => setFormData({...formData, purpose: e.target.value})} 
                                    placeholder="e.g. Delivery, Maintenance, Guest" 
                                    required 
                                    className="w-full border border-outline-variant/50 rounded-md p-3 text-body-md focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
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
                                className="btn btn-primary min-w-[140px]" 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Spinner size="sm" /> : 'Log Entry'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        
        <style dangerouslySetInnerHTML={{__html: `
            @keyframes scan {
                0%, 100% { top: 0%; opacity: 0; }
                10%, 90% { opacity: 1; }
                50% { top: 100%; }
            }
        `}} />
    </div>
  );
}
