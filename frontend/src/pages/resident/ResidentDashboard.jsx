import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FileText, Bell, Users, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../admin/Admin.css'; // Reuse common dashboard styles

export default function ResidentDashboard() {
  const [bills, setBills] = useState([]);
  const [notices, setNotices] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [billsRes, noticesRes, visitorsRes] = await Promise.all([
        api.get('/resident/bills'),
        api.get('/notices'), // Note: using common endpoint mapped to /api/notices in controller
        api.get('/resident/visitors')
      ]);
      setBills(billsRes.data);
      setNotices(noticesRes.data);
      setVisitors(visitorsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleVisitorApproval = async (id, status) => {
    try {
      await api.put(`/resident/visitors/${id}/approval?status=${status}`);
      toast.success(`Visitor ${status.toLowerCase()} successfully`);
      fetchDashboardData(); // Refresh list
    } catch (error) {
      toast.error(`Failed to ${status.toLowerCase()} visitor`);
    }
  };

  if (loading) return <div className="page-container">Loading...</div>;

  const pendingBills = bills.filter(b => b.status === 'PENDING' || b.status === 'OVERDUE');
  const recentNotices = notices.slice(0, 3); // Latest 3 notices
  const pendingVisitors = visitors.filter(v => v.approvalStatus === 'PENDING');

  return (
    <div className="page-container">
      <div className="page-header bg-courtyard" style={{ 
        padding: '3rem 2rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        marginBottom: '2.5rem'
      }}>
        <h1 className="page-title">Welcome Home</h1>
      </div>

      <div className="dashboard-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
        
        {/* Pending Visitors Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--status-pending)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Pending Visitors</h2>
          </div>
          
          {pendingVisitors.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingVisitors.map(visitor => (
                <div key={visitor.id} style={{ display: 'flex', flexDirection: 'column', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <p style={{ fontWeight: '600' }}>{visitor.name}</p>
                    <span className="badge badge-warning">Waiting at Gate</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Purpose: {visitor.purpose}</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" style={{ flex: 1, padding: '0.5rem' }} onClick={() => handleVisitorApproval(visitor.id, 'APPROVED')}>
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button className="btn btn-outline" style={{ flex: 1, padding: '0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleVisitorApproval(visitor.id, 'REJECTED')}>
                      <XCircle size={16} /> Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No pending visitor requests.</p>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Pending Bills</h2>
          </div>
          
          {pendingBills.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingBills.map(bill => (
                <div key={bill.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <p style={{ fontWeight: '600' }}>{bill.title}</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Due: {bill.dueDate}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '700', color: 'var(--danger)' }}>₹{bill.amount}</p>
                    <span className={`badge ${bill.status === 'OVERDUE' ? 'badge-danger' : 'badge-warning'}`}>{bill.status}</span>
                  </div>
                </div>
              ))}
              <Link to="/resident/bills" className="btn btn-outline" style={{ marginTop: '0.5rem' }}>View All Bills & Pay</Link>
            </div>
          ) : (
            <p className="text-muted">You have no pending bills. Great job!</p>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Recent Notices</h2>
          </div>
          
          {recentNotices.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentNotices.map(notice => (
                <div key={notice.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{notice.title}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Expires: {notice.expiryDate}</p>
                </div>
              ))}
              <Link to="/resident/notices" className="btn btn-outline" style={{ marginTop: '0.5rem' }}>View All Notices</Link>
            </div>
          ) : (
            <p className="text-muted">No recent notices.</p>
          )}
        </div>
      </div>
    </div>
  );
}
