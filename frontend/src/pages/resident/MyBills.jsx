import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Download, Search } from 'lucide-react';
import SkeletonTable from '../../components/common/SkeletonTable';
import Spinner from '../../components/common/Spinner';
import useDataList from '../../hooks/useDataList';
import '../admin/Admin.css';

export default function MyBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingBillId, setPayingBillId] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const searchFilterFn = (bill, query, filterState) => {
    const matchesSearch = !query || bill.title.toLowerCase().includes(query) || bill.billingMonth.includes(query);
    const matchesStatus = filterState.searchStatus === '' || bill.status === filterState.searchStatus;
    return matchesSearch && matchesStatus;
  };

  const {
    searchQuery, setSearchQuery,
    filterState, setFilterState,
    paginatedData, currentPage, totalPages, nextPage, prevPage
  } = useDataList(bills, searchFilterFn, { searchStatus: '' }, 10);

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
      // 1. Initiate Razorpay order (backend returns: orderId, amount, currency, keyId, billId)
      const orderRes = await api.post(`/resident/payments/initiate/${billId}`);
      const { orderId, amount, currency, keyId, billId: responseBillId } = orderRes.data;

      // 2. Load Razorpay script
      const res = await loadRazorpay();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setPayingBillId(null);
        return;
      }

      // 3. Handle Placeholder Mock Flow
      if (keyId === 'rzp_test_YOUR_KEY_HERE') {
        if (window.confirm('MOCK MODE: No Razorpay API keys configured. Would you like to simulate a successful payment?')) {
          // Simulate the Razorpay success callback
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

      // 4. Open Razorpay Checkout for Real Keys
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
            // 5. Verify payment
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
          name: 'Resident', // In a real app, populate from context
          email: 'resident@portico.com',
          contact: '9999999999'
        },
        theme: {
          color: '#B8935F'
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
      case 'PAID': return <span className="badge badge-success">PAID</span>;
      case 'PENDING': return <span className="badge badge-warning">PENDING</span>;
      case 'OVERDUE': return <span className="badge badge-danger">OVERDUE</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Maintenance Bills</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search title or month..." 
              value={searchQuery}
              style={{ padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.875rem', width: '220px' }}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            value={filterState.searchStatus}
            onChange={e => setFilterState('searchStatus', e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </div>

      <div className="card table-container">
        {loading ? (
          <SkeletonTable columns={6} rows={5} />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Month</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map(b => (
                <tr key={b.id}>
                  <td>{b.title}</td>
                  <td>{b.billingMonth}</td>
                  <td>₹{b.amount}</td>
                  <td>{b.dueDate}</td>
                  <td>{getStatusBadge(b.status)}</td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    {(b.status === 'PENDING' || b.status === 'OVERDUE') && (
                      <button className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handlePay(b.id)} disabled={payingBillId === b.id}>
                        {payingBillId === b.id ? <Spinner size="sm" /> : 'Pay Now'}
                      </button>
                    )}
                    {b.status === 'PAID' && (
                      <button className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => downloadReceipt(b.id)} title="Download Receipt">
                        <Download size={14} /> Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr><td colSpan="6" className="text-center empty-state" style={{ height: '100px' }}>No bills found.</td></tr>
              )}
            </tbody>
          </table>
        )}

        {!loading && totalPages > 1 && (
          <div className="pagination-controls">
            <button onClick={prevPage} disabled={currentPage === 1}>Prev</button>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Page {currentPage} of {totalPages}</span>
            <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
