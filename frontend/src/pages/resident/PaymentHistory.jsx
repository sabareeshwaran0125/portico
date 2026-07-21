import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import SkeletonTable from '../../components/common/SkeletonTable';
import useDataList from '../../hooks/useDataList';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [upcomingAmount, setUpcomingAmount] = useState(0);
  const [nextDue, setNextDue] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const searchFilterFn = (payment, query, filterState) => {
    const matchesSearch = !query || payment.title.toLowerCase().includes(query.toLowerCase()) || payment.billingMonth.toLowerCase().includes(query.toLowerCase());
    const matchesMonth = filterState.searchMonth === '' || filterState.searchMonth === 'All Months' || payment.billingMonth.toLowerCase().includes(filterState.searchMonth.toLowerCase());
    return matchesSearch && matchesMonth;
  };

  const {
    searchQuery, setSearchQuery,
    filterState, setFilterState,
    paginatedData, currentPage, totalPages, nextPage, prevPage
  } = useDataList(payments, searchFilterFn, { searchMonth: 'All Months' }, 10);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/resident/bills');
      const paidBills = res.data.filter(b => b.status === 'PAID');
      const pendingBills = res.data.filter(b => b.status === 'PENDING' || b.status === 'OVERDUE');
      
      setPayments(paidBills.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate)));
      
      const totalPending = pendingBills.reduce((sum, b) => sum + b.amount, 0);
      setUpcomingAmount(totalPending);
      
      if (pendingBills.length > 0) {
        setNextDue(pendingBills.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0]);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (billId, buttonElement) => {
    // Micro-interaction for download button animation
    if (buttonElement) {
        const icon = buttonElement.querySelector('.material-symbols-outlined');
        if (icon) {
            icon.innerText = 'check';
            buttonElement.classList.add('text-green-600');
            setTimeout(() => {
                icon.innerText = 'download';
                buttonElement.classList.remove('text-green-600');
            }, 2000);
        }
    }

    try {
      const res = await api.get(`/resident/payments/receipt/${billId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt_Bill_${billId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  const totalPaidThisYear = payments.reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="w-full">
        <SkeletonTable columns={5} rows={5} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="w-full">
        {/* Bento-style Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            <div className="col-span-1 md:col-span-8 card flex justify-between items-center overflow-hidden relative">
                <div className="z-10">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Total Paid</h3>
                    <p className="text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary">₹{totalPaidThisYear.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    <p className="font-label-md text-secondary mt-2 flex items-center">
                        <span className="material-symbols-outlined text-green-600 mr-1 text-sm">trending_up</span>
                        Thank you for keeping your dues clear.
                    </p>
                </div>
                <div className="absolute -right-4 top-0 h-full w-1/3 opacity-10">
                    <span className="material-symbols-outlined text-[180px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>receipt</span>
                </div>
            </div>
            
            <div className="col-span-1 md:col-span-4 card bg-[#1B3358] text-white relative overflow-hidden">
                <h3 className="font-label-lg text-secondary-fixed-dim mb-6 uppercase tracking-widest">Upcoming Dues</h3>
                <div className="flex flex-col space-y-1">
                    <p className="font-headline-md text-headline-md">{nextDue ? nextDue.title : 'No Pending Dues'}</p>
                    <p className="text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary-container">₹{upcomingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
                <p className="font-label-md text-secondary-fixed-dim mt-4">
                    {nextDue ? `Due by ${nextDue.dueDate}` : 'You are all caught up!'}
                </p>
            </div>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
                <h4 className="font-headline-sm text-headline-sm text-on-surface">Recent Transactions</h4>
                <div className="h-6 w-px bg-outline-variant hidden md:block"></div>
                <div className="hidden md:flex bg-surface-container rounded-lg p-1">
                    <button className="px-4 py-1.5 rounded-md bg-white shadow-sm text-label-md text-primary">All Bills</button>
                    <button className="px-4 py-1.5 rounded-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors">Maintenance</button>
                    <button className="px-4 py-1.5 rounded-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors">Utility</button>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
                <div className="relative flex items-center bg-surface-container-low px-4 py-2 rounded-lg sm:rounded-full border border-outline-variant focus-within:border-primary-container transition-all w-full sm:w-auto">
                    <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-body-sm w-full sm:w-48 outline-none" 
                        placeholder="Search transactions..." 
                    />
                </div>
                
                <select 
                    value={filterState.searchMonth}
                    onChange={(e) => setFilterState('searchMonth', e.target.value)}
                    className="bg-surface-container-lowest border border-outline-variant rounded-lg font-label-md text-on-surface px-4 py-2 focus:ring-primary focus:border-primary outline-none w-full sm:w-auto appearance-none"
                >
                    <option value="All Months">All Months</option>
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                </select>
            </div>
        </div>

        {/* Table Section */}
        <div className="card !p-0 overflow-x-auto">
            <table className="data-table min-w-[800px]">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Transaction ID</th>
                        <th>Bill Type</th>
                        <th>Amount (₹)</th>
                        <th>Status</th>
                        <th className="text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map(p => (
                        <tr key={p.id} className="group">
                            <td>
                                <p className="font-body-md font-semibold text-on-surface">{new Date(p.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                <p className="text-[11px] text-secondary">{p.billingMonth}</p>
                            </td>
                            <td className="font-body-sm text-secondary font-mono uppercase">
                                TXN_PR_{p.id}{Math.floor(Math.random() * 1000)}
                            </td>
                            <td>
                                <span className="flex items-center text-body-md text-on-surface">
                                    <span className="w-2 h-2 rounded-full bg-[#1B3358] mr-3"></span>
                                    {p.title}
                                </span>
                            </td>
                            <td className="font-body-md font-bold text-on-surface">₹ {p.amount.toFixed(2)}</td>
                            <td>
                                <span className="badge bg-green-100 text-green-800">
                                    <span className="material-symbols-outlined text-xs mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                    Paid
                                </span>
                            </td>
                            <td className="text-right">
                                <button 
                                    className="p-2 rounded-full text-primary hover:bg-primary/5 transition-all" 
                                    title="Download Receipt"
                                    onClick={(e) => downloadReceipt(p.id, e.currentTarget)}
                                >
                                    <span className="material-symbols-outlined">download</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {paginatedData.length === 0 && (
                        <tr>
                            <td colSpan="6" className="text-center py-10 text-secondary">
                                No past payments found matching your criteria.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-outline-variant/30 flex items-center justify-between">
                    <p className="font-label-sm text-secondary">
                        Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, payments.length)} of {payments.length} transactions
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
    </div>
  );
}
