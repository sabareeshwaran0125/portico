import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2, Search } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import SkeletonTable from '../../components/common/SkeletonTable';
import Spinner from '../../components/common/Spinner';
import useDataList from '../../hooks/useDataList';
import './Admin.css';

export default function Flats() {
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, isDeleting: false });
  const [formData, setFormData] = useState({ block: '', flatNumber: '', sizeSqft: '', flatType: '2BHK' });
  const toast = useToast();

  const searchFilterFn = (flat, query, filterState) => {
    const matchesSearch = flat.block.toLowerCase().includes(query) || flat.flatNumber.toLowerCase().includes(query);
    const matchesType = filterState.flatType === 'ALL' || flat.flatType === filterState.flatType;
    return matchesSearch && matchesType;
  };

  const {
    searchQuery, setSearchQuery,
    filterState, setFilterState,
    paginatedData, currentPage, totalPages, nextPage, prevPage
  } = useDataList(flats, searchFilterFn, { flatType: 'ALL' }, 10);

  useEffect(() => {
    fetchFlats();
  }, []);

  const fetchFlats = async () => {
    try {
      const res = await api.get('/admin/flats');
      setFlats(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to load flats');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/admin/flats', formData);
      toast.success('Flat created successfully');
      setIsModalOpen(false);
      setFormData({ block: '', flatNumber: '', sizeSqft: '', flatType: '2BHK' });
      fetchFlats();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to create flat');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    setConfirmDelete(prev => ({ ...prev, isDeleting: true }));
    try {
      await api.delete(`/admin/flats/${confirmDelete.id}`);
      toast.success('Flat deleted');
      setConfirmDelete({ isOpen: false, id: null, isDeleting: false });
      fetchFlats();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to delete flat');
      setConfirmDelete(prev => ({ ...prev, isDeleting: false }));
    }
  };

  return (
    <div className="page-container bg-blueprint" style={{
      minHeight: '100vh'
    }}>
      <div className="page-header">
        <h1 className="page-title">Flat Management</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search block or flat no..." 
              value={searchQuery}
              style={{ padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.875rem', width: '240px' }}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            value={filterState.flatType} 
            onChange={e => setFilterState('flatType', e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
          >
            <option value="ALL">All Types</option>
            <option value="1BHK">1BHK</option>
            <option value="2BHK">2BHK</option>
            <option value="3BHK">3BHK</option>
            <option value="4BHK">4BHK</option>
            <option value="PENTHOUSE">Penthouse</option>
          </select>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add Flat
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
                  <th>Block</th>
                  <th>Flat No.</th>
                  <th>Size (Sqft)</th>
                  <th>Type</th>
                  <th>Resident</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map(flat => (
                  <tr key={flat.id}>
                    <td>{flat.block}</td>
                    <td><strong>{flat.flatNumber}</strong></td>
                    <td>{flat.sizeSqft}</td>
                    <td><span className="badge badge-primary">{flat.flatType}</span></td>
                    <td>
                      {flat.residentName ? flat.residentName : <span className="text-muted">Unoccupied</span>}
                    </td>
                    <td>
                      <button className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} onClick={() => setConfirmDelete({ isOpen: true, id: flat.id, isDeleting: false })}>
                        <Trash2 size={16} color="var(--danger)" />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr><td colSpan="6" className="text-center empty-state" style={{ height: '100px', textAlign: 'center' }}>No flats found.</td></tr>
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

      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        title="Delete Flat"
        message="Are you sure you want to delete this flat? This action cannot be undone."
        confirmText={confirmDelete.isDeleting ? "Deleting..." : "Delete"}
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null, isDeleting: false })}
      />

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Flat</h2>
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="input-group">
                <label>Block (e.g., A, B, C)</label>
                <input type="text" value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Flat Number (e.g., 101)</label>
                <input type="text" value={formData.flatNumber} onChange={e => setFormData({...formData, flatNumber: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Size (Sqft)</label>
                <input type="number" value={formData.sizeSqft} onChange={e => setFormData({...formData, sizeSqft: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Flat Type</label>
                <select value={formData.flatType} onChange={e => setFormData({...formData, flatType: e.target.value})}>
                  <option value="1BHK">1BHK</option>
                  <option value="2BHK">2BHK</option>
                  <option value="3BHK">3BHK</option>
                  <option value="4BHK">4BHK</option>
                  <option value="PENTHOUSE">Penthouse</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner size="sm" /> : 'Create Flat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}