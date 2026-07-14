import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Search } from 'lucide-react';
import SkeletonTable from '../../components/common/SkeletonTable';
import Spinner from '../../components/common/Spinner';
import useDataList from '../../hooks/useDataList';
import '../admin/Admin.css';

export default function ResidentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ title: '', description: '', category: 'PLUMBING' });
  const [file, setFile] = useState(null);
  const toast = useToast();

  const searchFilterFn = (c, query, filterState) => {
    const matchesSearch = !query || 
      c.title.toLowerCase().includes(query) || 
      c.description.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query);
      
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

  const handleRaise = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('complaint', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
      if (file) {
        data.append('file', file);
      }

      await api.post('/complaints', data, {
        headers: { 'Content-Type': 'multipart/form-data' } // Optional, axios sets it automatically
      });
      toast.success('Complaint raised successfully');
      setIsModalOpen(false);
      setFormData({ title: '', description: '', category: 'PLUMBING' });
      setFile(null);
      fetchComplaints();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to raise complaint');
    } finally {
      setIsSubmitting(false);
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
        <h1 className="page-title">My Complaints</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search title, desc..." 
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
            <option value="SECURITY">Security</option>
            <option value="COMMON_AREA">Common Area</option>
            <option value="OTHER">Other</option>
          </select>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Raise Complaint
          </button>
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
                  <th>Category</th>
                  <th>Attachment</th>
                  <th>Date Raised</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map(c => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.title}</strong>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{c.description}</p>
                    </td>
                    <td>{c.category}</td>
                    <td>
                      {c.imageUrl ? (
                        <a href={`http://localhost:8080${c.imageUrl}`} target="_blank" rel="noreferrer" className="text-primary" style={{ textDecoration: 'underline', fontSize: '0.875rem' }}>View Image</a>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>None</span>
                      )}
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>{getStatusBadge(c.status)}</td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr><td colSpan="5" className="text-center empty-state" style={{ height: '100px' }}>No complaints found.</td></tr>
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
              <h2>Raise a Complaint</h2>
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleRaise}>
              <div className="input-group">
                <label>Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="PLUMBING">Plumbing</option>
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="SECURITY">Security</option>
                  <option value="COMMON_AREA">Common Area</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Attachment (Image)</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner size="sm" /> : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
