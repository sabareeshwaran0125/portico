import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { UserPlus, Search, Trash2 } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import SkeletonTable from '../../components/common/SkeletonTable';
import Spinner from '../../components/common/Spinner';
import useDataList from '../../hooks/useDataList';
import './Admin.css';

export default function Users() {
  const [residents, setResidents] = useState([]);
  const [guards, setGuards] = useState([]);
  const [pending, setPending] = useState([]);
  const [activeTab, setActiveTab] = useState('RESIDENT');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, isDeleting: false });
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'RESIDENT', shift: '' });
  const toast = useToast();

  const searchFilterFn = (user, query) => {
    return user.firstName.toLowerCase().includes(query) || 
           user.lastName.toLowerCase().includes(query) || 
           user.email.toLowerCase().includes(query);
  };

  const usersToShow = activeTab === 'RESIDENT' ? residents : activeTab === 'GUARD' ? guards : pending;

  const {
    searchQuery, setSearchQuery,
    paginatedData, currentPage, totalPages, nextPage, prevPage
  } = useDataList(usersToShow, searchFilterFn, {}, 10);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [resRes, resGuard, resPending] = await Promise.all([
        api.get('/admin/residents'),
        api.get('/admin/guards'),
        api.get('/admin/users/pending')
      ]);
      setResidents(resRes.data);
      setGuards(resGuard.data);
      setPending(resPending.data);
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/admin/onboard', formData);
      toast.success(`${formData.role} onboarded successfully`);
      setIsModalOpen(false);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'RESIDENT', shift: '' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to onboard user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setConfirmDelete(prev => ({ ...prev, isDeleting: true }));
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted successfully');
      setConfirmDelete({ isOpen: false, id: null, isDeleting: false });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to delete user');
      setConfirmDelete(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/users/${id}/approve`);
      toast.success('User approved successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to approve user');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search name or email..." 
              value={searchQuery}
              style={{ padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.875rem', width: '240px' }}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <UserPlus size={18} /> Onboard User
          </button>
        </div>
      </div>

      <div className="mb-1" style={{ display: 'flex', gap: '1rem' }}>
        <button className={`btn ${activeTab === 'RESIDENT' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('RESIDENT')}>Residents</button>
        <button className={`btn ${activeTab === 'GUARD' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('GUARD')}>Security Guards</button>
        <button className={`btn ${activeTab === 'PENDING' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('PENDING')}>
          Pending Approvals
          {pending.length > 0 && (
            <span style={{ marginLeft: '0.5rem', background: 'var(--danger)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '10px', fontSize: '0.75rem' }}>
              {pending.length}
            </span>
          )}
        </button>
      </div>

      <div className="card table-container">
        {loading ? (
          <SkeletonTable columns={5} rows={5} />
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map(u => (
                  <tr key={u.id}>
                    <td>{u.firstName} {u.lastName}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td><span className="badge badge-success">{u.role}</span></td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      {activeTab === 'PENDING' && (
                        <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleApprove(u.id)}>
                          Approve
                        </button>
                      )}
                      <button className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} onClick={() => setConfirmDelete({ isOpen: true, id: u.id, isDeleting: false })}>
                        <Trash2 size={16} color="var(--danger)" />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr><td colSpan="5" className="text-center empty-state" style={{ height: '100px', textAlign: 'center' }}>No users found.</td></tr>
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
              <h2>Onboard New {formData.role}</h2>
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleOnboard}>
              <div className="input-group">
                <label>Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="RESIDENT">Resident</option>
                  <option value="GUARD">Security Guard</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              
              {formData.role === 'GUARD' && (
                <div className="input-group">
                  <label>Assigned Gate / Shift</label>
                  <input type="text" value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value})} placeholder="e.g., Morning Shift - Main Gate" required />
                </div>
              )}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>First Name</label>
                  <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Last Name</label>
                  <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
                </div>
              </div>
              <div className="input-group">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Phone</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner size="sm" /> : 'Onboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null, isDeleting: false })}
        onConfirm={() => handleDelete(confirmDelete.id)}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText={confirmDelete.isDeleting ? "Deleting..." : "Delete"}
        type="danger"
      />
    </div>
  );
}
