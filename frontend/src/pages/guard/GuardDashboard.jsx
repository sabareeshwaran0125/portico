import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function GuardDashboard() {
  const [expectedVisitors, setExpectedVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchExpectedVisitors();
  }, []);

  const fetchExpectedVisitors = async () => {
    try {
      const res = await api.get('/guard/visitors/expected');
      setExpectedVisitors(res.data);
    } catch (error) {
      toast.error('Failed to load expected visitors');
    } finally {
      setLoading(false);
    }
  };

  const handleEntry = async (id) => {
    try {
      await api.post(`/guard/visitors/${id}/entry`);
      toast.success('Visitor entry logged');
      fetchExpectedVisitors();
    } catch (error) {
      toast.error('Failed to log entry');
    }
  };

  const handleExit = async (id) => {
    try {
      await api.post(`/guard/visitors/${id}/exit`);
      toast.success('Visitor exit logged');
      fetchExpectedVisitors();
    } catch (error) {
      toast.error('Failed to log exit');
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <nav className="flex items-center gap-2 text-secondary mb-2">
                <span className="font-label-md">Guard Portal</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                <span className="font-label-md text-primary">Dashboard</span>
            </nav>
            <h2 className="font-headline-lg text-on-surface">Today's Expected Visitors</h2>
        </div>
      </div>

      <div className="card !p-0 overflow-x-auto">
        {loading ? (
          <p className="p-4 text-secondary">Loading visitors...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Visitor Name</th>
                <th>Phone</th>
                <th>Expected Arrival</th>
                <th>Flat To Visit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expectedVisitors.map(v => (
                <tr key={v.id}>
                  <td><strong>{v.name}</strong></td>
                  <td>{v.phone}</td>
                  <td>{new Date(v.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>{v.flatDetails}</td>
                  <td>
                    {!v.entryTime ? (
                      <span className="badge bg-amber-100 text-amber-800">Awaiting Entry</span>
                    ) : !v.exitTime ? (
                      <span className="badge bg-green-100 text-green-800">Checked In</span>
                    ) : (
                      <span className="badge bg-surface-container-highest text-on-surface-variant">Checked Out</span>
                    )}
                  </td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    {!v.entryTime && (
                      <button className="btn btn-primary btn-sm flex items-center gap-1" onClick={() => handleEntry(v.id)}>
                        <span className="material-symbols-outlined text-[16px]">login</span> Log Entry
                      </button>
                    )}
                    {v.entryTime && !v.exitTime && (
                      <button className="btn btn-outline btn-sm flex items-center gap-1" onClick={() => handleExit(v.id)}>
                        <span className="material-symbols-outlined text-[16px]">logout</span> Log Exit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {expectedVisitors.length === 0 && (
                <tr><td colSpan="6" className="text-center py-10 text-secondary">No expected visitors for today.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
