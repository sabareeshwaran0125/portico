import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';
import Spinner from '../../components/common/Spinner';
import useDataList from '../../hooks/useDataList';

export default function Flats() {
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, isDeleting: false });
  const [formData, setFormData] = useState({ block: '', flatNumber: '', sizeSqft: '', flatType: '2BHK' });
  const toast = useToast();

  const searchFilterFn = (flat, query, filterState) => {
    const matchesSearch = !query || 
        flat.block.toLowerCase().includes(query.toLowerCase()) || 
        flat.flatNumber.toLowerCase().includes(query.toLowerCase()) ||
        (flat.residentName && flat.residentName.toLowerCase().includes(query.toLowerCase()));
    const matchesBlock = filterState.block === '' || flat.block === filterState.block;
    return matchesSearch && matchesBlock;
  };

  const {
    searchQuery, setSearchQuery,
    filterState, setFilterState,
    paginatedData, currentPage, totalPages, nextPage, prevPage
  } = useDataList(flats, searchFilterFn, { block: '' }, 10);

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

  const uniqueBlocks = [...new Set(flats.map(f => f.block))].sort();
  const totalFlats = flats.length;
  const occupiedFlats = flats.filter(f => f.residentName).length;
  const occupancyRate = totalFlats > 0 ? ((occupiedFlats / totalFlats) * 100).toFixed(0) : 0;
  
  // Calculate total Sqft as an estimate for Portfolio Overview
  const totalSqft = flats.reduce((acc, curr) => acc + (Number(curr.sizeSqft) || 0), 0);

  const getTypeStyle = (type) => {
      if (type.includes('3')) return "bg-secondary-container/30 text-on-secondary-container";
      if (type.includes('2')) return "bg-secondary-container/30 text-on-secondary-container";
      if (type.includes('4') || type.toLowerCase().includes('pent')) return "bg-tertiary-fixed/30 text-on-tertiary-fixed-variant";
      return "bg-surface-variant text-on-surface-variant";
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-[50vh] w-full">
              <Spinner size="lg" color="primary" />
          </div>
      );
  }

  return (
    <div className="w-full space-y-6">
        {/* Header (Top Nav typically outside, but providing local page context) */}
        <div className="flex justify-between items-end mb-2 hidden md:flex">
            <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Flat Management</h2>
                <p className="font-body-md text-secondary mt-1">Manage all physical assets, unit configurations, and residents.</p>
            </div>
        </div>

        {/* Actions & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 max-w-2xl">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                    <input 
                        className="input-field !py-2.5 !pl-10" 
                        placeholder="Search by flat number or resident..." 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select 
                    className="input-field !py-2.5 min-w-[120px]"
                    value={filterState.block}
                    onChange={(e) => setFilterState('block', e.target.value)}
                >
                    <option value="">All Blocks</option>
                    {uniqueBlocks.map(b => (
                        <option key={b} value={b}>Block {b}</option>
                    ))}
                </select>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary btn-md"
            >
                <span className="material-symbols-outlined mr-2">add</span>
                Add Flat
            </button>
        </div>

        {/* Management Table Card */}
        <div className="table-container">
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Block</th>
                            <th>Flat No.</th>
                            <th>Size (SQFT)</th>
                            <th>Type</th>
                            <th>Resident</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(flat => (
                            <tr key={flat.id}>
                                <td className="font-semibold text-on-surface">{flat.block}</td>
                                <td>{flat.flatNumber}</td>
                                <td>{flat.sizeSqft}</td>
                                <td>
                                    <span className={`badge ${getTypeStyle(flat.flatType)}`}>
                                        {flat.flatType}
                                    </span>
                                </td>
                                <td>
                                    {flat.residentName ? (
                                        flat.residentName
                                    ) : (
                                        <span className="italic text-outline">Unoccupied</span>
                                    )}
                                </td>
                                <td className="text-right">
                                    <button 
                                        className="text-outline hover:text-error transition-colors p-1"
                                        onClick={() => setConfirmDelete({ isOpen: true, id: flat.id, isDeleting: false })}
                                        title="Delete Flat"
                                    >
                                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">delete</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-secondary font-body-md">
                                    No flats found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-outline-variant/30 bg-surface-container-lowest flex-wrap gap-4">
                    <p className="font-body-sm text-body-sm text-secondary">
                        Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, flats.length)} of {flats.length} flats
                    </p>
                    <div className="flex items-center space-x-2">
                        <button 
                            className="p-2 rounded-lg border border-outline-variant/50 hover:bg-surface-container transition-colors disabled:opacity-30"
                            onClick={prevPage}
                            disabled={currentPage === 1}
                        >
                            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                        </button>
                        <button className="w-10 h-10 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg hidden sm:block">
                            {currentPage}
                        </button>
                        <button 
                            className="p-2 rounded-lg border border-outline-variant/50 hover:bg-surface-container transition-colors disabled:opacity-30"
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                        >
                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Stats/Insight Section (Asymmetric Modern Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="card border-l-4 border-primary">
                <p className="font-label-md text-label-md text-secondary uppercase tracking-widest mb-1">Total Capacity</p>
                <div className="flex items-baseline space-x-2">
                    <h4 className="font-display-lg text-display-lg text-on-surface">{totalFlats}</h4>
                    <span className="text-secondary font-label-lg text-label-lg">Units</span>
                </div>
                <div className="mt-4 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${occupancyRate}%` }}></div>
                </div>
                <p className="mt-2 font-body-sm text-body-sm text-secondary">{occupancyRate}% Occupancy Rate</p>
            </div>
            
            <div className="md:col-span-2 relative overflow-hidden bg-[#1B3358] rounded-xl p-8 text-white flex flex-col justify-center shadow-[0_4px_12px_rgba(27,39,51,0.08)]">
                <div className="relative z-10">
                    <h4 className="font-headline-md text-headline-md mb-2">Portfolio Overview</h4>
                    <p className="font-body-md text-body-md text-surface-variant/80 max-w-md mb-6">Manage all physical assets, unit configurations, and architectural specifications from a single source of truth.</p>
                    <div className="flex flex-wrap gap-8">
                        <div>
                            <p className="text-3xl font-bold">{uniqueBlocks.length}</p>
                            <p className="text-xs uppercase tracking-widest opacity-60 mt-1">Blocks</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold">{(totalSqft > 0 ? totalSqft / 1000 : 0).toFixed(1)}k</p>
                            <p className="text-xs uppercase tracking-widest opacity-60 mt-1">Total Sqft</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold">18</p>
                            <p className="text-xs uppercase tracking-widest opacity-60 mt-1">Amenities</p>
                        </div>
                    </div>
                </div>
                {/* Subtle background decoration */}
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                    <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'wght' 100" }}>apartment</span>
                </div>
            </div>
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

        {/* Add Flat Modal */}
        {isModalOpen && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h3 className="modal-title">Add New Flat</h3>
                        <button 
                            className="text-on-surface-variant hover:text-primary transition-colors"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <form onSubmit={handleCreate}>
                        <div className="modal-body">
                            <div>
                                <label className="input-label">Block</label>
                                <input 
                                    type="text" 
                                    value={formData.block} 
                                    onChange={e => setFormData({...formData, block: e.target.value.toUpperCase()})} 
                                    required 
                                    className="input-field"
                                    placeholder="e.g., A, B, C"
                                />
                            </div>
                            <div>
                                <label className="input-label">Flat Number</label>
                                <input 
                                    type="text" 
                                    value={formData.flatNumber} 
                                    onChange={e => setFormData({...formData, flatNumber: e.target.value})} 
                                    required 
                                    className="input-field"
                                    placeholder="e.g., 101"
                                />
                            </div>
                            <div>
                                <label className="input-label">Size (Sqft)</label>
                                <input 
                                    type="number" 
                                    value={formData.sizeSqft} 
                                    onChange={e => setFormData({...formData, sizeSqft: e.target.value})} 
                                    required 
                                    className="input-field"
                                    placeholder="e.g., 1450"
                                />
                            </div>
                            <div>
                                <label className="input-label">Flat Type</label>
                                <select 
                                    value={formData.flatType} 
                                    onChange={e => setFormData({...formData, flatType: e.target.value})}
                                    className="input-field"
                                >
                                    <option value="1BHK">1 BHK</option>
                                    <option value="2BHK">2 BHK</option>
                                    <option value="3BHK">3 BHK</option>
                                    <option value="4BHK">4 BHK Duplex</option>
                                    <option value="PENTHOUSE">Penthouse</option>
                                </select>
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
                                className="btn btn-primary btn-md min-w-[120px]" 
                                disabled={isSubmitting}
                            >
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