import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import SkeletonTable from '../../components/common/SkeletonTable';
import Spinner from '../../components/common/Spinner';
import useDataList from '../../hooks/useDataList';

export default function MyBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingBillId, setPayingBillId] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const searchFilterFn = (bill, query, filterState) => {
    const matchesSearch = !query || bill.title.toLowerCase().includes(query.toLowerCase()) || bill.billingMonth.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = filterState.searchStatus === '' || filterState.searchStatus === 'All' || bill.status === filterState.searchStatus.toUpperCase();
    return matchesSearch && matchesStatus;
  };

  const {
    searchQuery, setSearchQuery,
    filterState, setFilterState,
    paginatedData, currentPage, totalPages, nextPage, prevPage
  } = useDataList(bills, searchFilterFn, { searchStatus: 'All' }, 10);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await api.get('/resident/bills');
      setBills(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async (billId) => {
    setPayingBillId(billId);
    try {
      const orderRes = await api.post(`/resident/payments/initiate/${billId}`);
      const { orderId, amount, currency, keyId, billId: responseBillId } = orderRes.data;

      const res = await loadRazorpay();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setPayingBillId(null);
        return;
      }

      if (keyId === 'rzp_test_YOUR_KEY_HERE') {
        if (window.confirm('MOCK MODE: No Razorpay API keys configured. Would you like to simulate a successful payment?')) {
          const mockResponse = {
            razorpay_order_id: orderId,
            razorpay_payment_id: 'pay_mock_' + Math.floor(Math.random() * 1000000),
            razorpay_signature: 'sig_mock_simulated'
          };
          
          try {
            const verifyRes = await api.post('/resident/payments/verify', {
              billId: responseBillId || billId,
              razorpayOrderId: mockResponse.razorpay_order_id,
              razorpayPaymentId: mockResponse.razorpay_payment_id,
              razorpaySignature: mockResponse.razorpay_signature
            });
            toast.success(verifyRes.data.message || 'Mock Payment successful!');
            navigate(`/resident/payment-success/${responseBillId || billId}`);
          } catch (error) {
            toast.error(error.response?.data?.error || 'Mock Payment verification failed');
          }
        }
        setPayingBillId(null);
        return;
      }

      const options = {
        key: keyId,
        amount: amount * 100,
        currency: currency || 'INR',
        name: 'Portico',
        description: 'Maintenance Bill Payment',
        image: '/images/logo.png',
        order_id: orderId,
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/resident/payments/verify', {
              billId: responseBillId || billId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            toast.success(verifyRes.data.message || 'Payment successful!');
            navigate(`/resident/payment-success/${responseBillId || billId}`);
          } catch (error) {
            toast.error(error.response?.data?.error || 'Payment verification failed');
          }
        },
        prefill: {
          name: 'Resident',
          email: 'resident@portico.com',
          contact: '9999999999'
        },
        theme: {
          color: '#a13f1f'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response){
        toast.error('Payment failed or cancelled.');
        setPayingBillId(null);
      });
      paymentObject.open();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Payment process failed');
      setPayingBillId(null);
    }
  };

  const downloadReceipt = async (billId) => {
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID': return <span className="badge bg-[#2E8B79] text-white">Paid</span>;
      case 'PENDING': return <span className="badge bg-[#E0A94A] text-white">Pending</span>;
      case 'OVERDUE': return <span className="badge bg-[#D1495B] text-white">Overdue</span>;
      default: return <span className="badge bg-secondary text-white">{status}</span>;
    }
  };

  const totalOutstanding = bills.filter(b => b.status !== 'PAID').reduce((sum, b) => sum + b.amount, 0);
  const paidBills = bills.filter(b => b.status === 'PAID').sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
  const lastPayment = paidBills.length > 0 ? paidBills[0] : null;
  const upcomingBills = bills.filter(b => b.status === 'PENDING').sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const upcomingBill = upcomingBills.length > 0 ? upcomingBills[0] : null;

  if (loading) {
      return (
          <div className="flex flex-col gap-6 w-full">
              <SkeletonTable columns={6} rows={5} />
          </div>
      );
  }

  return (
    <div className="w-full space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">My Maintenance Bills</h2>
                <p className="font-body-md text-body-md text-secondary">View and manage your service charges and facility maintenance payments.</p>
            </div>
            <div className="flex gap-3">
                <button className="btn btn-primary btn-md">
                    <span className="material-symbols-outlined mr-2" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>account_balance_wallet</span>
                    Add Payment Method
                </button>
            </div>
        </div>

        {/* Stats/Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card flex flex-col justify-center">
                <p className="font-label-md text-secondary mb-1">Total Outstanding</p>
                <p className="font-display-lg text-headline-lg text-primary">₹{totalOutstanding.toFixed(2)}</p>
                <div className="mt-4 flex items-center gap-2 text-error">
                    {totalOutstanding > 0 ? (
                        <>
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            <span className="font-label-sm">Payment required</span>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
                            <span className="font-label-sm text-tertiary">All caught up</span>
                        </>
                    )}
                </div>
            </div>
            
            <div className="card flex flex-col justify-center">
                <p className="font-label-md text-secondary mb-1">Last Payment</p>
                <p className="font-display-lg text-headline-lg text-on-surface">₹{lastPayment ? lastPayment.amount.toFixed(2) : '0.00'}</p>
                <div className="mt-4 flex items-center gap-2 text-tertiary">
                    {lastPayment ? (
                        <>
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            <span className="font-label-sm">Processed {lastPayment.dueDate}</span>
                        </>
                    ) : (
                        <span className="font-label-sm text-secondary">No previous payments</span>
                    )}
                </div>
            </div>
            
            <div className="card flex flex-col justify-center">
                <p className="font-label-md text-secondary mb-1">Upcoming Bill</p>
                <p className="font-display-lg text-headline-lg text-on-surface">₹{upcomingBill ? upcomingBill.amount.toFixed(2) : '0.00'}</p>
                <div className="mt-4 flex items-center gap-2 text-secondary">
                    {upcomingBill ? (
                        <>
                            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                            <span className="font-label-sm">Due {upcomingBill.dueDate}</span>
                        </>
                    ) : (
                        <span className="font-label-sm">No upcoming bills</span>
                    )}
                </div>
            </div>
        </div>

        {/* Data Table Card with Filters */}
        <div className="card !p-0 overflow-hidden flex flex-col">
            {/* Filters & Search */}
            <div className="p-4 border-b border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-bright">
                <div className="relative w-full md:w-96">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary/60">search</span>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-md focus:ring-1 focus:ring-primary focus:border-primary outline-none font-body-sm shadow-sm" 
                        placeholder="Search bills by ID or month..." 
                    />
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select 
                        value={filterState.searchStatus}
                        onChange={e => setFilterState('searchStatus', e.target.value)}
                        className="bg-surface-container-lowest border border-outline-variant/50 rounded-md px-3 py-2 font-label-md text-secondary outline-none w-full md:w-auto shadow-sm"
                    >
                        <option value="All">Status: All</option>
                        <option value="PAID">Paid</option>
                        <option value="PENDING">Pending</option>
                        <option value="OVERDUE">Overdue</option>
                    </select>
                    <button className="p-2 border border-outline-variant/50 rounded-md text-secondary hover:bg-surface-container-lowest transition-colors shadow-sm bg-surface-container-lowest">
                        <span className="material-symbols-outlined">filter_list</span>
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto flex-1">
                <table className="data-table min-w-[800px]">
                    <thead>
                        <tr>
                            <th>TITLE</th>
                            <th>MONTH</th>
                            <th className="text-right">AMOUNT</th>
                            <th>DUE DATE</th>
                            <th>STATUS</th>
                            <th className="text-right">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(b => (
                            <tr key={b.id} className="group">
                                <td>
                                    <p className="font-label-lg text-on-surface">{b.title}</p>
                                    <p className="font-label-sm text-secondary">ID: {b.id}</p>
                                </td>
                                <td>{b.billingMonth}</td>
                                <td className="text-right font-bold">₹{b.amount}</td>
                                <td>{b.dueDate}</td>
                                <td>
                                    {getStatusBadge(b.status)}
                                </td>
                                <td className="text-right">
                                    {(b.status === 'PENDING' || b.status === 'OVERDUE') && (
                                        <button 
                                            className="btn btn-primary px-4 py-1.5 min-h-0 text-[13px]"
                                            onClick={() => handlePay(b.id)}
                                            disabled={payingBillId === b.id}
                                        >
                                            {payingBillId === b.id ? <Spinner size="sm" /> : 'Pay Now'}
                                        </button>
                                    )}
                                    {b.status === 'PAID' && (
                                        <button 
                                            className="btn btn-outline px-4 py-1.5 min-h-0 text-[13px]"
                                            onClick={() => downloadReceipt(b.id)}
                                        >
                                            Download Receipt
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-secondary">
                                    No bills found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-outline-variant/30 flex items-center justify-between">
                    <p className="font-label-sm text-secondary">
                        Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, bills.length)} of {bills.length} results
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

        {/* Helpful Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card border border-outline-variant/30 flex gap-4 bg-transparent shadow-none">
                <div className="w-12 h-12 flex-shrink-0 bg-secondary-container rounded-lg flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">help_center</span>
                </div>
                <div>
                    <h4 className="font-headline-sm text-on-surface mb-2">Need help with your bill?</h4>
                    <p className="font-body-sm text-secondary">If you notice any discrepancies in your maintenance amount or want to dispute a charge, please contact our financial department directly.</p>
                    <a className="inline-block mt-3 text-primary font-label-lg hover:underline underline-offset-4" href="#">Contact Finance Dept</a>
                </div>
            </div>
            
            <div className="card border border-outline-variant/30 flex gap-4 bg-transparent shadow-none">
                <div className="w-12 h-12 flex-shrink-0 bg-tertiary-container/20 rounded-lg flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined">auto_graph</span>
                </div>
                <div>
                    <h4 className="font-headline-sm text-on-surface mb-2">Automatic Payments</h4>
                    <p className="font-body-sm text-secondary">Enable auto-pay to never miss a due date. Your bills will be settled automatically on the 20th of every month using your primary card.</p>
                    <a className="inline-block mt-3 text-primary font-label-lg hover:underline underline-offset-4" href="#">Enable Auto-pay</a>
                </div>
            </div>
        </div>
    </div>
  );
}
