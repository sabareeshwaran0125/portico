import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { UserCheck, CheckCircle, XCircle, Search } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import SkeletonTable from '../../components/common/SkeletonTable';
import Spinner from '../../components/common/Spinner';
import useDataList from '../../hooks/useDataList';
import '../admin/Admin.css';

export default function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmReject, setConfirmReject] = useState({ isOpen: false, id: null, isRejecting: false });
  
  const [formData, setFormData] = useState({ name: '', phone: '', flatId: '', expectedArrival: '', purpose: '' });
  const toast = useToast();

  const searchFilterFn = (visitor, query, filterState) => {
    const matchesSearch = !query || 
      visitor.name.toLowerCase().includes(query) || 
      visitor.phone.includes(query) ||
      visitor.purpose.toLowerCase().includes(query);
      
    const matchesStatus = filterState.searchStatus === '' || visitor.approvalStatus === filterState.searchStatus;

    return matchesSearch && matchesStatus;
  };

  const {
    searchQuery, setSearchQuery,
    filterState, setFilterState,
    paginatedData, currentPage, totalPages, nextPage, prevPage
  } = useDataList(visitors, searchFilterFn, { searchStatus: '' }, 10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [visRes, flatRes] = await Promise.all([
        api.get('/resident/visitors'),
        api.get('/resident/flats')
      ]);
      setVisitors(visRes.data);
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
        // Backend expects LocalDateTime string usually format: YYYY-MM-DDTHH:MM:SS
        expectedArrival: formData.expectedArrival + ':00' 
      };
      await api.post('/resident/visitors/pre-approve', payload);
      toast.success('Visitor pre-approved successfully');
      setIsModalOpen(false);
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
    }
    try {
      await api.put(`/resident/visitors/${id}/approval?status=${status}`);
      toast.success(`Visitor ${status.toLowerCase()} successfully`);
      if (status === 'REJECTED') {
        setConfirmReject({ isOpen: false, id: null, isRejecting: false });
      }
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || `Failed to ${status.toLowerCase()} visitor`);
      if (status === 'REJECTED') {
        setConfirmReject(prev => ({ ...prev, isRejecting: false }));
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED': return <span className="badge badge-success">APPROVED</span>;
      case 'PENDING': return <span className="badge badge-warning">PENDING</span>;
      case 'REJECTED': return <span className="badge badge-danger">REJECTED</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Visitor History</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search name or purpose..." 
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
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <UserCheck size={18} /> Pre-approve Visitor
          </button>
        </div>
      </div>

      <div className="card table-container">
        {loading ? (
          <SkeletonTable columns={7} rows={5} />
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Visitor Name</th>
                  <th>Phone</th>
                  <th>Expected Arrival</th>
                  <th>Entry Time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map(v => (
                  <tr key={v.id}>
                    <td><strong>{v.name}</strong></td>
                    <td>{v.phone}</td>
                    <td>{new Date(v.expectedArrival).toLocaleString()}</td>
                    <td>{v.entryTime ? new Date(v.entryTime).toLocaleString() : '-'}</td>
                    <td>{v.purpose}</td>
                    <td>{getStatusBadge(v.approvalStatus)}</td>
                    <td>
                      {v.approvalStatus === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--status-paid)', borderColor: 'var(--status-paid)', fontSize: '0.8rem' }} onClick={() => handleApproval(v.id, 'APPROVED')}>
                            <CheckCircle size={14} />
                          </button>
                          <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)', fontSize: '0.8rem' }} onClick={() => setConfirmReject({ isOpen: true, id: v.id, isRejecting: false })}>
                            <XCircle size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr><td colSpan="7" className="text-center empty-state" style={{ height: '100px', textAlign: 'center' }}>No visitor history found.</td></tr>
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
              <h2>Pre-approve Visitor</h2>
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handlePreApprove}>
              <div className="input-group">
                <label>Select Your Flat</label>
                <select value={formData.flatId} onChange={e => setFormData({...formData, flatId: e.target.value})} required>
                  {flats.map(f => <option key={f.id} value={f.id}>{f.block}-{f.flatNumber}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Visitor Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Visitor Phone</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Expected Arrival Time</label>
                <input type="datetime-local" value={formData.expectedArrival} onChange={e => setFormData({...formData, expectedArrival: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Purpose of Visit</label>
                <input type="text" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} placeholder="e.g., Delivery, Guest, Service" required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner size="sm" /> : 'Pre-approve'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
