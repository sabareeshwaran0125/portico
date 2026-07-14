import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Bell, Trash2, Search } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import Spinner from '../../components/common/Spinner';
import useDataList from '../../hooks/useDataList';
import './Admin.css';

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, isDeleting: false });
  
  const defaultExpiry = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().slice(0, 10);
  const [formData, setFormData] = useState({ title: '', content: '', expiryDate: defaultExpiry });
  const toast = useToast();

  const searchFilterFn = (notice, query) => {
    return !query || 
           notice.title.toLowerCase().includes(query) || 
           notice.content.toLowerCase().includes(query);
  };

  const {
    searchQuery, setSearchQuery,
    paginatedData, currentPage, totalPages, nextPage, prevPage
  } = useDataList(notices, searchFilterFn, {}, 10);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices');
      setNotices(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/notices', formData);
      toast.success('Notice published successfully');
      setIsModalOpen(false);
      setFormData({ title: '', content: '', expiryDate: defaultExpiry });
      fetchNotices();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to publish notice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    setConfirmDelete(prev => ({ ...prev, isDeleting: true }));
    try {
      await api.delete(`/notices/${confirmDelete.id}`);
      toast.success('Notice deleted');
      setConfirmDelete({ isOpen: false, id: null, isDeleting: false });
      fetchNotices();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to delete notice');
      setConfirmDelete(prev => ({ ...prev, isDeleting: false }));
    }
  };

  return (
    <div className="page-container bg-noticeboard" style={{
      minHeight: '100vh'
    }}>
      <div className="page-header">
        <h1 className="page-title">Notice Board</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search notices..." 
              value={searchQuery}
              style={{ padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.875rem', width: '240px' }}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Bell size={18} /> Publish Notice
          </button>
        </div>
      </div>

      <div className="dashboard-stats" style={{ gridTemplateColumns: '1fr' }}>
        {loading ? (
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-line"></div>)}
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="card empty-state" style={{ height: '200px' }}>No notices found.</div>
        ) : (
          <>
            {paginatedData.map(notice => (
              <div key={notice.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{notice.title}</h3>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      <span>Published by: {notice.createdByName}</span>
                      <span>Expires: {notice.expiryDate}</span>
                    </div>
                  </div>
                  <button className="btn btn-outline" style={{ padding: '0.5rem', border: 'none' }} onClick={() => setConfirmDelete({ isOpen: true, id: notice.id, isDeleting: false })}>
                    <Trash2 size={18} color="var(--danger)" />
                  </button>
                </div>
                <p style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>{notice.content}</p>
              </div>
            ))}
            {totalPages > 1 && (
              <div className="pagination-controls" style={{ justifyContent: 'center', marginTop: '1rem' }}>
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
              <h2>Publish Notice</h2>
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="input-group">
                <label>Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Content</label>
                <textarea rows="4" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Expiry Date</label>
                <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner size="sm" /> : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null, isDeleting: false })}
        onConfirm={handleDelete}
        title="Delete Notice"
        message="Are you sure you want to delete this notice? This action cannot be undone."
        confirmText={confirmDelete.isDeleting ? "Deleting..." : "Delete"}
        type="danger"
      />
    </div>
  );
}
