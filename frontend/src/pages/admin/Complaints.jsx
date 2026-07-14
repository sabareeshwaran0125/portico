import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Search } from 'lucide-react';
import SkeletonTable from '../../components/common/SkeletonTable';
import Spinner from '../../components/common/Spinner';
import useDataList from '../../hooks/useDataList';
import './Admin.css';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const toast = useToast();

  const searchFilterFn = (c, query, filterState) => {
    const matchesSearch = !query || 
      c.title.toLowerCase().includes(query) || 
      c.category.toLowerCase().includes(query) || 
      c.status.toLowerCase().includes(query) ||
      (c.raisedByName && c.raisedByName.toLowerCase().includes(query));

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN': return <span className="badge badge-danger">OPEN</span>;
      case 'IN_PROGRESS': return <span className="badge badge-warning">IN PROGRESS</span>;
      case 'RESOLVED': return <span className="badge badge-success">RESOLVED</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Complaints Overview</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by title, resident..." 
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
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          <select 
            value={filterState.searchCategory}
            onChange={e => setFilterState('searchCategory', e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
          >
            <option value="">All Categories</option>
            <option value="PLUMBING">Plumbing</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="CARPENTRY">Carpentry</option>
            <option value="CLEANING">Cleaning</option>
            <option value="OTHER">Other</option>
          </select>
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
                  <th>Title</th>
                  <th>Category</th>
                  <th>Raised By</th>
                  <th>Attachment</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map(c => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.title}</strong>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.description}
                      </p>
                    </td>
                    <td>{c.category}</td>
                    <td>
                      <div>{c.raisedByName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.raisedByFlatDetails}</div>
                    </td>
                    <td>
                      {c.imageUrl ? (
                        <a href={`http://localhost:8080${c.imageUrl}`} target="_blank" rel="noreferrer" className="text-primary" style={{ textDecoration: 'underline', fontSize: '0.875rem' }}>View</a>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>-</span>
                      )}
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>{getStatusBadge(c.status)}</td>
                    <td style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select 
                        className="btn-outline" 
                        style={{ padding: '0.4rem', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface)', color: 'var(--text-main)' }}
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        disabled={updatingId === c.id}
                      >
                        <option value="OPEN">Mark Open</option>
                        <option value="IN_PROGRESS">Mark In Progress</option>
                        <option value="RESOLVED">Mark Resolved</option>
                      </select>
                      {updatingId === c.id && <Spinner size="sm" color="primary" />}
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr><td colSpan="7" className="text-center empty-state" style={{ height: '100px', textAlign: 'center' }}>No complaints found.</td></tr>
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
