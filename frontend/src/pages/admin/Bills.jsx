import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FilePlus, Search } from 'lucide-react';
import SkeletonTable from '../../components/common/SkeletonTable';
import Spinner from '../../components/common/Spinner';
import useDataList from '../../hooks/useDataList';
import './Admin.css';

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
      bill.title.toLowerCase().includes(query) || 
      (bill.flatDetails && bill.flatDetails.toLowerCase().includes(query));
    
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
      case 'PAID': return <span className="badge badge-success">PAID</span>;
      case 'PENDING': return <span className="badge badge-warning">PENDING</span>;
      case 'OVERDUE': return <span className="badge badge-danger">OVERDUE</span>;
      default: return <span className="badge">{status}</span>;
    }
  };



  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Billing Management</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search title or flat..." 
              value={searchQuery}
              style={{ padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.875rem', width: '200px' }}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <input 
            type="month" 
            value={filterState.searchMonth}
            onChange={e => setFilterState('searchMonth', e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
          />
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
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <FilePlus size={18} /> Generate Monthly Bills
          </button>
        </div>
      </div>

      <div className="card table-container">
        {loading ? (
          <SkeletonTable columns={6} rows={5} />
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Flat</th>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map(b => (
                  <tr key={b.id}>
                    <td>{b.title}</td>
                    <td><strong>{b.flatDetails}</strong></td>
                    <td>{b.billingMonth}</td>
                    <td>₹{b.amount}</td>
                    <td>{b.dueDate}</td>
                    <td>{getStatusBadge(b.status)}</td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr><td colSpan="6" className="text-center empty-state" style={{ height: '100px', textAlign: 'center' }}>No bills found matching your criteria.</td></tr>
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Generate Monthly Maintenance</h2>
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleGenerate}>
              <div className="input-group">
                <label>Billing Month (YYYY-MM)</label>
                <input type="month" value={formData.billingMonth} onChange={e => setFormData({...formData, billingMonth: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Due Date</label>
                <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Rate Per Sq.Ft (₹)</label>
                <input type="number" step="0.1" value={formData.ratePerSqFt} onChange={e => setFormData({...formData, ratePerSqFt: e.target.value})} required />
              </div>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
                This will generate bills for all assigned flats based on their sq.ft size.
              </p>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
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
