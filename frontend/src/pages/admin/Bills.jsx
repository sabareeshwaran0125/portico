import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/common/Spinner';
import useDataList from '../../hooks/useDataList';

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 10);
  
  const [formData, setFormData] = useState({ billingMonth: currentMonth, dueDate: nextMonth, ratePerSqFt: 2.5 });
  const toast = useToast();

  const searchFilterFn = (bill, query, filterState) => {
    const matchesSearch = !query || 
      bill.title.toLowerCase().includes(query.toLowerCase()) || 
      (bill.flatDetails && bill.flatDetails.toLowerCase().includes(query.toLowerCase()));
    
    const matchesMonth = filterState.searchMonth === '' || bill.billingMonth === filterState.searchMonth;
    const matchesStatus = filterState.searchStatus === '' || bill.status === filterState.searchStatus;

    return matchesSearch && matchesMonth && matchesStatus;
  };

  const {
    searchQuery, setSearchQuery,
    filterState, setFilterState,
    paginatedData, currentPage, totalPages, nextPage, prevPage
  } = useDataList(bills, searchFilterFn, { searchMonth: '', searchStatus: '' }, 10);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await api.get('/admin/bills');
      setBills(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(`/admin/bills/generate?billingMonth=${formData.billingMonth}&dueDate=${formData.dueDate}&ratePerSqFt=${formData.ratePerSqFt}`);
      toast.success('Monthly bills generated successfully');
      setIsModalOpen(false);
      fetchBills();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to generate bills');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID': 
        return <span className="badge badge-success">Paid</span>;
      case 'PENDING': 
        return <span className="badge badge-warning">Pending</span>;
      case 'OVERDUE': 
        return <span className="badge badge-error">Overdue</span>;
      default: 
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-[50vh] w-full">
              <Spinner size="lg" color="primary" />
          </div>
      );
  }

  // Calculate statistics
  const totalReceivables = bills.filter(b => b.status === 'PENDING' || b.status === 'OVERDUE').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalCollected = bills.filter(b => b.status === 'PAID').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalBilled = totalReceivables + totalCollected;
  const collectionRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : 0;
  const delinquentCount = bills.filter(b => b.status === 'OVERDUE').length;

  return (
    <div className="w-full space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-wrap justify-between items-end gap-4 mt-2">
            <div className="space-y-1">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">Billing Management</h2>
                <p className="text-secondary font-body-sm text-body-sm">Manage, generate, and track financial records for the property.</p>
            </div>
            <div className="flex gap-3">
                <button className="btn btn-secondary btn-md">
                    <span className="material-symbols-outlined mr-2">download</span>
                    <span className="hidden sm:inline">Export Report</span>
                </button>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary btn-md"
                >
                    <span className="material-symbols-outlined mr-2">add_circle</span>
                    <span className="hidden sm:inline">Generate New Bill</span>
                </button>
            </div>
        </div>

        {/* Overview Stats Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Receivables */}
            <div className="card justify-between">
                <div className="flex justify-between items-start">
                    <span className="text-secondary font-label-lg text-label-lg">Total Receivables</span>
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">payments</span>
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="font-headline-lg text-headline-lg text-on-surface">₹ {totalReceivables.toLocaleString()}</h3>
                    <p className="text-tertiary font-label-sm text-label-sm flex items-center mt-1">
                        <span className="material-symbols-outlined text-[16px] mr-1">info</span>
                        Pending collections
                    </p>
                </div>
            </div>
            
            {/* Collection Rate */}
            <div className="card justify-between">
                <div className="flex justify-between items-start">
                    <span className="text-secondary font-label-lg text-label-lg">Collection Rate</span>
                    <div className="w-10 h-10 bg-tertiary/10 rounded-lg flex items-center justify-center text-tertiary">
                        <span className="material-symbols-outlined">analytics</span>
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="font-headline-lg text-headline-lg text-on-surface">{collectionRate}%</h3>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-tertiary h-full transition-all duration-1000" style={{ width: `${collectionRate}%` }}></div>
                    </div>
                </div>
            </div>
            
            {/* Delinquent Accounts */}
            <div className="card justify-between">
                <div className="flex justify-between items-start">
                    <span className="text-secondary font-label-lg text-label-lg">Delinquent Accounts</span>
                    <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center text-error">
                        <span className="material-symbols-outlined">warning</span>
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="font-headline-lg text-headline-lg text-on-surface">{delinquentCount} Units</h3>
                    <p className="text-error font-label-sm text-label-sm flex items-center mt-1">
                        With overdue balances
                    </p>
                </div>
            </div>
        </section>

        {/* Filters & Table Section */}
        <section className="space-y-6">
            {/* Filters Header */}
            <div className="card !p-4 flex flex-row flex-wrap items-center gap-6">
                <div className="flex-grow min-w-[240px]">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
                        <input 
                            className="input-field !py-2 !pl-10" 
                            placeholder="Search by Title or Flat Details..." 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <label className="font-label-sm text-[10px] uppercase tracking-wider text-secondary">Bill Month</label>
                        <input 
                            type="month"
                            className="input-field !py-1.5 !px-3 w-auto"
                            value={filterState.searchMonth}
                            onChange={e => setFilterState('searchMonth', e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="font-label-sm text-[10px] uppercase tracking-wider text-secondary">Status</label>
                        <select 
                            className="input-field !py-1.5 !px-3 min-w-[120px]"
                            value={filterState.searchStatus}
                            onChange={e => setFilterState('searchStatus', e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="PAID">Paid</option>
                            <option value="PENDING">Pending</option>
                            <option value="OVERDUE">Overdue</option>
                        </select>
                    </div>
                </div>
            </div>
            
            {/* Table */}
            <div className="table-container">
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Unit / Title</th>
                                <th>Bill Month</th>
                                <th>Amount</th>
                                <th>Due Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((b, idx) => (
                                <tr key={b.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-[10px] shrink-0">
                                                {b.flatDetails ? b.flatDetails.substring(0,2) : 'B'}
                                            </div>
                                            <div>
                                                <div className="font-body-md text-body-md font-medium text-on-surface">{b.flatDetails}</div>
                                                <div className="font-label-sm text-[11px] text-secondary">{b.title}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-secondary">{b.billingMonth}</td>
                                    <td className="font-bold text-on-surface">₹ {Number(b.amount).toLocaleString()}</td>
                                    <td className="text-secondary">{new Date(b.dueDate).toLocaleDateString()}</td>
                                    <td>
                                        {getStatusBadge(b.status)}
                                    </td>
                                </tr>
                            ))}
                            {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-on-surface-variant">
                                        No bills found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between">
                        <p className="font-body-sm text-body-sm text-secondary">
                            Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, bills.length)} of {bills.length} bills
                        </p>
                        <div className="flex gap-2">
                            <button 
                                className="w-8 h-8 rounded border border-outline-variant/50 flex items-center justify-center hover:bg-white transition-colors text-secondary disabled:opacity-30"
                                onClick={prevPage}
                                disabled={currentPage === 1}
                            >
                                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                            </button>
                            <button className="w-8 h-8 rounded bg-primary-container text-on-primary flex items-center justify-center font-label-sm hidden sm:flex">
                                {currentPage}
                            </button>
                            <button 
                                className="w-8 h-8 rounded border border-outline-variant/50 flex items-center justify-center hover:bg-white transition-colors text-secondary disabled:opacity-30"
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

        {/* Generate Modal */}
        {isModalOpen && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h3 className="modal-title">Generate Maintenance</h3>
                        <button 
                            className="text-on-surface-variant hover:text-primary transition-colors"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <form onSubmit={handleGenerate}>
                        <div className="modal-body">
                            <div>
                                <label className="input-label">Billing Month (YYYY-MM)</label>
                                <input 
                                    type="month" 
                                    value={formData.billingMonth} 
                                    onChange={e => setFormData({...formData, billingMonth: e.target.value})} 
                                    required 
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="input-label">Due Date</label>
                                <input 
                                    type="date" 
                                    value={formData.dueDate} 
                                    onChange={e => setFormData({...formData, dueDate: e.target.value})} 
                                    required 
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="input-label">Rate Per Sq.Ft (₹)</label>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    value={formData.ratePerSqFt} 
                                    onChange={e => setFormData({...formData, ratePerSqFt: e.target.value})} 
                                    required 
                                    className="input-field"
                                />
                            </div>
                            <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/50">
                                <p className="text-secondary font-label-sm text-center">
                                    This will automatically generate bills for all active flats based on their registered square footage.
                                </p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-secondary btn-md" 
                                onClick={() => setIsModalOpen(false)} 
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary btn-md min-w-[140px]" 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Spinner size="sm" /> : 'Generate Bills'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}
