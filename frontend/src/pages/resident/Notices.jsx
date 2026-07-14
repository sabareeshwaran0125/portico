import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Check, Search } from 'lucide-react';
import useDataList from '../../hooks/useDataList';
import Spinner from '../../components/common/Spinner';
import '../admin/Admin.css';

export default function ResidentNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readingId, setReadingId] = useState(null);
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

  const markAsRead = async (id) => {
    setReadingId(id);
    try {
      await api.post(`/notices/${id}/read`);
      // Update local state by removing it or visually marking it as read
      // Since backend doesn't explicitly return read/unread list mapping well in this API, we just refresh
      fetchNotices();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to mark notice as read');
    } finally {
      setReadingId(null);
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
              <div key={notice.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{notice.title}</h3>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      <span>Published by: {notice.createdByName}</span>
                      <span>Expires: {notice.expiryDate}</span>
                    </div>
                  </div>
                  <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => markAsRead(notice.id)} disabled={readingId === notice.id}>
                    {readingId === notice.id ? <Spinner size="sm" /> : <><Check size={16} /> Mark as Read</>}
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
    </div>
  );
}
