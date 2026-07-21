import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';
import Spinner from '../../components/common/Spinner';
import useDataList from '../../hooks/useDataList';

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
    return !query || 
           user.firstName.toLowerCase().includes(query.toLowerCase()) || 
           user.lastName.toLowerCase().includes(query.toLowerCase()) || 
           user.email.toLowerCase().includes(query.toLowerCase());
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

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-[50vh] w-full">
              <Spinner size="lg" color="primary" />
          </div>
      );
  }

  const getRoleBadge = (role) => {
      switch(role) {
          case 'ADMIN': return <span className="badge badge-error">Admin</span>;
          case 'GUARD': return <span className="badge bg-secondary-container/40 text-secondary">Guard</span>;
          default: return <span className="badge badge-success">Resident</span>;
      }
  };

  const getStatusBadge = (user) => {
      if (activeTab === 'PENDING') return <span className="badge badge-neutral">Pending</span>;
      return <span className="badge badge-success">Active</span>;
  };

  return (
    <div className="w-full space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-end">
            <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">Users &amp; Staff Management</h2>
                <p className="text-secondary font-body-md">Oversee personnel records, manage duty rosters, and track performance logs.</p>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary btn-md"
            >
                <span className="material-symbols-outlined">person_add</span>
                <span className="hidden sm:inline">Add New User/Staff</span>
            </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
            {/* Overview Bento */}
            <div className="col-span-12 lg:col-span-3">
                <div className="card h-full">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-secondary-container/30 flex items-center justify-center text-on-secondary-container">
                            <span className="material-symbols-outlined">badge</span>
                        </div>
                    </div>
                    <p className="text-secondary font-label-md">Total Residents</p>
                    <h3 className="text-display-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface mt-1">{residents.length}</h3>
                </div>
            </div>
            
            <div className="col-span-12 lg:col-span-3">
                <div className="card h-full">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-tertiary-container/20 flex items-center justify-center text-tertiary">
                            <span className="material-symbols-outlined">verified_user</span>
                        </div>
                    </div>
                    <p className="text-secondary font-label-md">Active Guards</p>
                    <h3 className="text-display-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface mt-1">{guards.length}</h3>
                </div>
            </div>
            
            <div className="col-span-12 lg:col-span-3">
                <div className="card h-full">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-on-secondary-container/10 flex items-center justify-center text-secondary">
                            <span className="material-symbols-outlined">build</span>
                        </div>
                    </div>
                    <p className="text-secondary font-label-md">Maintenance Crew</p>
                    <h3 className="text-display-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface mt-1">08</h3>
                    <p className="text-outline font-label-sm mt-2 flex items-center">
                        <span className="material-symbols-outlined text-[14px] mr-1">pending_actions</span>
                        4 tasks active
                    </p>
                </div>
            </div>
            
            <div className="col-span-12 lg:col-span-3">
                <div className="card h-full">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-error-container/40 flex items-center justify-center text-error">
                            <span className="material-symbols-outlined">history_edu</span>
                        </div>
                    </div>
                    <p className="text-secondary font-label-md">Pending Approvals</p>
                    <h3 className="text-display-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface mt-1">{pending.length}</h3>
                </div>
            </div>

            <div className="col-span-12 xl:col-span-9 space-y-6">
                {/* Filters / Tabs */}
                <div className="card !p-4 flex flex-row flex-wrap gap-4 items-center">
                    <div className="flex-1 relative min-w-[240px]">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                        <input 
                            className="input-field !py-2 !pl-10" 
                            placeholder="Search staff name or email..." 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center space-x-2 border border-outline-variant rounded-lg p-1 bg-surface-container-low overflow-x-auto">
                        <button 
                            className={`px-4 py-1.5 rounded-md font-label-md transition-colors whitespace-nowrap ${activeTab === 'RESIDENT' ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-on-surface'}`}
                            onClick={() => setActiveTab('RESIDENT')}
                        >
                            Residents ({residents.length})
                        </button>
                        <button 
                            className={`px-4 py-1.5 rounded-md font-label-md transition-colors whitespace-nowrap ${activeTab === 'GUARD' ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-on-surface'}`}
                            onClick={() => setActiveTab('GUARD')}
                        >
                            Security Guards ({guards.length})
                        </button>
                        <button 
                            className={`px-4 py-1.5 rounded-md font-label-md transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'PENDING' ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-on-surface'}`}
                            onClick={() => setActiveTab('PENDING')}
                        >
                            Pending 
                            {pending.length > 0 && (
                                <span className="bg-error text-white text-[10px] px-1.5 py-0.5 rounded-full">{pending.length}</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Main Data Table */}
                <div className="table-container">
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>User Details</th>
                                    <th>Role</th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-primary-container/20 flex items-center justify-center text-primary font-bold">
                                                    {u.firstName[0]}{u.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-body-md font-semibold text-on-surface">{u.firstName} {u.lastName}</p>
                                                    <p className="font-label-sm text-outline">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {getRoleBadge(u.role)}
                                        </td>
                                        <td className="font-mono text-label-sm text-outline">
                                            {u.phone}
                                        </td>
                                        <td>
                                            {getStatusBadge(u)}
                                        </td>
                                        <td className="text-right space-x-3 whitespace-nowrap">
                                            {activeTab === 'PENDING' && (
                                                <button 
                                                    className="text-primary hover:underline font-label-md"
                                                    onClick={() => handleApprove(u.id)}
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            <button 
                                                className="text-outline hover:text-error transition-colors p-1"
                                                onClick={() => setConfirmDelete({ isOpen: true, id: u.id, isDeleting: false })}
                                                title="Delete User"
                                            >
                                                <span className="material-symbols-outlined text-[20px] align-middle">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedData.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-on-surface-variant">
                                            No users found in this category.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 bg-surface-container-low flex justify-between items-center px-6 border-t border-outline-variant/30">
                            <p className="text-label-sm text-outline">Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, usersToShow.length)} of {usersToShow.length} results</p>
                            <div className="flex space-x-2">
                                <button 
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                    className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30"
                                >
                                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                </button>
                                <button className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center text-label-sm hidden sm:flex">
                                    {currentPage}
                                </button>
                                <button 
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages}
                                    className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30"
                                >
                                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Widget */}
            <div className="col-span-12 xl:col-span-3 space-y-6">
                {/* Quick Actions Widget */}
                <div className="card">
                    <h4 className="font-headline-sm text-on-surface mb-4">Quick Actions</h4>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-all group">
                            <div className="flex items-center">
                                <span className="material-symbols-outlined text-primary mr-3">campaign</span>
                                <span className="font-label-md text-on-surface">Broadcast to Staff</span>
                            </div>
                            <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                        </button>
                        <button className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-all group">
                            <div className="flex items-center">
                                <span className="material-symbols-outlined text-secondary mr-3">calendar_month</span>
                                <span className="font-label-md text-on-surface">Roster Management</span>
                            </div>
                            <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                        </button>
                        <button className="w-full flex items-center justify-between p-3 rounded-lg bg-error-container/10 border border-error/10 hover:bg-error-container/20 transition-all group">
                            <div className="flex items-center">
                                <span className="material-symbols-outlined text-error mr-3">contact_phone</span>
                                <span className="font-label-md text-error">Emergency Contact List</span>
                            </div>
                            <span className="material-symbols-outlined text-error/50 group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                        </button>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-headline-sm text-on-surface">Recent Logs</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="flex space-x-3 relative">
                            <div className="w-0.5 bg-outline-variant absolute left-[15px] top-8 h-full"></div>
                            <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center flex-shrink-0 z-10">
                                <span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                            </div>
                            <div>
                                <p className="text-label-md text-on-surface">System initialized</p>
                                <p className="text-label-sm text-outline">Today</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Modals */}
        <ConfirmModal 
            isOpen={confirmDelete.isOpen}
            onClose={() => setConfirmDelete({ isOpen: false, id: null, isDeleting: false })}
            onConfirm={() => handleDelete(confirmDelete.id)}
            title="Delete User"
            message="Are you sure you want to delete this user? This action cannot be undone."
            confirmText={confirmDelete.isDeleting ? "Deleting..." : "Delete"}
            isDanger={true}
        />

        {isModalOpen && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h3 className="modal-title">Onboard New User</h3>
                        <button 
                            className="text-on-surface-variant hover:text-primary transition-colors"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <form onSubmit={handleOnboard}>
                        <div className="modal-body">
                            <div>
                                <label className="input-label">Role</label>
                                <select 
                                    value={formData.role} 
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                    className="input-field"
                                >
                                    <option value="RESIDENT">Resident</option>
                                    <option value="GUARD">Security Guard</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            
                            {formData.role === 'GUARD' && (
                                <div>
                                    <label className="input-label">Assigned Gate / Shift</label>
                                    <input 
                                        type="text" 
                                        value={formData.shift} 
                                        onChange={e => setFormData({...formData, shift: e.target.value})} 
                                        placeholder="e.g., Morning Shift - Main Gate" 
                                        required 
                                        className="input-field"
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="input-label">First Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.firstName} 
                                        onChange={e => setFormData({...formData, firstName: e.target.value})} 
                                        required 
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="input-label">Last Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.lastName} 
                                        onChange={e => setFormData({...formData, lastName: e.target.value})} 
                                        required 
                                        className="input-field"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="input-label">Email</label>
                                <input 
                                    type="email" 
                                    value={formData.email} 
                                    onChange={e => setFormData({...formData, email: e.target.value})} 
                                    required 
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="input-label">Phone</label>
                                <input 
                                    type="text" 
                                    value={formData.phone} 
                                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                                    required 
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="input-label">Password</label>
                                <input 
                                    type="password" 
                                    value={formData.password} 
                                    onChange={e => setFormData({...formData, password: e.target.value})} 
                                    required 
                                    className="input-field"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-secondary btn-md" 
                                onClick={() => setIsModalOpen(false)} 
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary btn-md min-w-[140px]" 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Spinner size="sm" /> : 'Onboard User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}
