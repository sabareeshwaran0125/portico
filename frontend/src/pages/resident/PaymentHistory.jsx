import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Download, Search } from 'lucide-react';
import SkeletonTable from '../../components/common/SkeletonTable';
import useDataList from '../../hooks/useDataList';
import '../admin/Admin.css';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const searchFilterFn = (payment, query, filterState) => {
    const matchesSearch = !query || payment.title.toLowerCase().includes(query) || payment.billingMonth.includes(query);
    const matchesMonth = filterState.searchMonth === '' || payment.billingMonth === filterState.searchMonth;
    return matchesSearch && matchesMonth;
  };

  const {
    searchQuery, setSearchQuery,
    filterState, setFilterState,
    paginatedData, currentPage, totalPages, nextPage, prevPage
  } = useDataList(payments, searchFilterFn, { searchMonth: '' }, 10);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      // Re-using the bills endpoint, but filtering only PAID bills on frontend for now.
      // In a real production app, we would have a dedicated /resident/payments endpoint.
      const res = await api.get('/resident/bills');
      setPayments(res.data.filter(b => b.status === 'PAID'));
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Payment History</h1>
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
          <input 
            type="month" 
            value={filterState.searchMonth}
            onChange={e => setFilterState('searchMonth', e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
          />
        </div>
      </div>

      <div className="card table-container">
        {loading ? (
          <SkeletonTable columns={5} rows={5} />
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Billing Month</th>
                  <th>Amount Paid</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map(p => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>{p.billingMonth}</td>
                    <td>₹{p.amount}</td>
                    <td><span className="badge badge-success">PAID</span></td>
                    <td>
                      <button className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => downloadReceipt(p.id)} title="Download Receipt">
                        <Download size={14} /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr><td colSpan="5" className="text-center empty-state" style={{ height: '100px' }}>No past payments found.</td></tr>
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination-controls">
                <button onClick={prevPage} disabled={currentPage === 1}>Prev</button>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Page {currentPage} of {totalPages}</span>
                <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
