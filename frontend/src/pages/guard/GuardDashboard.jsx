import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CheckCircle, LogOut } from 'lucide-react';
import '../admin/Admin.css';

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
    <div className="page-container">
      <div className="page-header bg-gate" style={{
        padding: '3rem 2rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        marginBottom: '2.5rem'
      }}>
        <h1 className="page-title">Today's Expected Visitors</h1>
      </div>

      <div className="card table-container">
        {loading ? (
          <p className="p-4">Loading visitors...</p>
        ) : (
          <table>
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
                      <span className="badge badge-warning">Awaiting Entry</span>
                    ) : !v.exitTime ? (
                      <span className="badge badge-success">Checked In</span>
                    ) : (
                      <span className="badge">Checked Out</span>
                    )}
                  </td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    {!v.entryTime && (
                      <button className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleEntry(v.id)}>
                        <CheckCircle size={14} /> Log Entry
                      </button>
                    )}
                    {v.entryTime && !v.exitTime && (
                      <button className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleExit(v.id)}>
                        <LogOut size={14} /> Log Exit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {expectedVisitors.length === 0 && (
                <tr><td colSpan="6" className="text-center empty-state" style={{ height: '100px' }}>No expected visitors for today.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
