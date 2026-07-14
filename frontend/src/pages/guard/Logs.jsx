import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { UserPlus, LogOut, Search } from 'lucide-react';
import SkeletonTable from '../../components/common/SkeletonTable';
import Spinner from '../../components/common/Spinner';
import useDataList from '../../hooks/useDataList';
import '../admin/Admin.css';

export default function VisitorLogs() {
  const [logs, setLogs] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null); // to track log entry/exit loading
  
  const [formData, setFormData] = useState({ name: '', phone: '', flatId: '', purpose: '' });
  const toast = useToast();

  const searchFilterFn = (v, query, filterState) => {
    const matchesSearch = !query || 
      v.name.toLowerCase().includes(query) || 
      v.phone.includes(query) ||
      (v.flatDetails && v.flatDetails.toLowerCase().includes(query));

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
        api.get('/guard/flats')  // Uses the guard-scoped flats endpoint
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
      // Backend expects VisitorDto with flatId and expectedArrival as ISO LocalDateTime
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
      <div className="page-header bg-gate" style={{
        padding: '3rem 2rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        marginBottom: '2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 className="page-title">Visitor Logs</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.7)' }} />
            <input 
              type="text" 
              placeholder="Search name or phone..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.2)', fontSize: '0.875rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', width: '220px' }}
            />
          </div>
          <select 
            value={filterState.searchStatus}
            onChange={e => setFilterState('searchStatus', e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.2)', fontSize: '0.875rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
          >
            <option value="" style={{ color: 'black' }}>All Statuses</option>
            <option value="APPROVED" style={{ color: 'black' }}>Approved</option>
            <option value="PENDING" style={{ color: 'black' }}>Pending</option>
            <option value="REJECTED" style={{ color: 'black' }}>Rejected</option>
          </select>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <UserPlus size={18} /> Log Walk-in
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
                  <th>Flat To Visit</th>
                  <th>Entry Time</th>
                  <th>Exit Time</th>
                  <th>Approval</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map(v => (
                  <tr key={v.id}>
                    <td><strong>{v.name}</strong><p style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{v.purpose}</p></td>
                    <td>{v.phone}</td>
                    <td>{v.flatDetails}</td>
                    <td>{v.entryTime ? new Date(v.entryTime).toLocaleString() : '-'}</td>
                    <td>{v.exitTime ? new Date(v.exitTime).toLocaleString() : '-'}</td>
                    <td>{getStatusBadge(v.approvalStatus)}</td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      {v.approvalStatus === 'APPROVED' && !v.entryTime && (
                        <button className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleEntry(v.id)} disabled={actionId === v.id}>
                          {actionId === v.id ? <Spinner size="sm" /> : 'Log Entry'}
                        </button>
                      )}
                      {v.entryTime && !v.exitTime && (
                        <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }} onClick={() => handleExit(v.id)} disabled={actionId === v.id}>
                          {actionId === v.id ? <Spinner size="sm" /> : <><LogOut size={14} /> Exit</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr><td colSpan="7" className="text-center empty-state" style={{ height: '100px', textAlign: 'center' }}>No visitor logs found.</td></tr>
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
              <h2>Log Walk-in Visitor</h2>
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleWalkIn}>
              <div className="input-group">
                <label>Visitor Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Flat</label>
                <select value={formData.flatId} onChange={e => setFormData({...formData, flatId: e.target.value})} required>
                  {flats.map(f => <option key={f.id} value={f.id}>{f.block}-{f.flatNumber}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Purpose</label>
                <input type="text" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} placeholder="e.g. Delivery, Guest" required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner size="sm" /> : 'Log Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
