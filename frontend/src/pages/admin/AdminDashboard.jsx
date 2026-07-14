import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Users, Home, IndianRupee, AlertTriangle, Eye, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Admin.css';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
    } catch (error) {
      toast.error('Failed to load dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-container">Loading dashboard...</div>;
  if (!analytics) return null;

  const pieData = Object.entries(analytics.complaintsByCategory || {}).map(([name, value]) => ({ name, value }));
  const COLORS = ['#1C2333', '#B8935F', '#7C9885', '#D4A24C', '#C1666B'];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-details">
            <h3>Total Residents</h3>
            <p>{analytics.totalResidents}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Home size={24} /></div>
          <div className="stat-details">
            <h3>Occupancy Rate</h3>
            <p>{analytics.occupancyRate.toFixed(1)}%</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><IndianRupee size={24} /></div>
          <div className="stat-details">
            <h3>Collected (This Month)</h3>
            <p>₹{analytics.maintenanceCollectedThisMonth.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon alert"><AlertTriangle size={24} /></div>
          <div className="stat-details">
            <h3>Pending Maintenance</h3>
            <p>₹{analytics.maintenancePendingThisMonth.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}><Eye size={24} /></div>
          <div className="stat-details">
            <h3>Visitors Today</h3>
            <p>{analytics.visitorsToday}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(212, 162, 76, 0.1)', color: 'var(--warning)' }}><MessageSquare size={24} /></div>
          <div className="stat-details">
            <h3>Open Complaints</h3>
            <p>{analytics.openComplaintsCount}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-card card">
          <h3>Collection Trends</h3>
          <div className="chart-wrapper">
            {analytics.monthlyTrends && analytics.monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="collected" name="Collected" fill="#7C9885" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="#C1666B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No trend data available</div>
            )}
          </div>
        </div>

        <div className="chart-card card">
          <h3>Complaints by Category</h3>
          <div className="chart-wrapper">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No complaints logged</div>
            )}
          </div>
        </div>

        <div className="chart-card card">
          <h3>Visitor Trends (Last 7 Days)</h3>
          <div className="chart-wrapper">
            {analytics.visitorTrends && analytics.visitorTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.visitorTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Visitors" fill="#B8935F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No visitor data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-tables mt-2">
        <div className="card">
          <h3>Maintenance Defaulters</h3>
          {analytics.defaulters && analytics.defaulters.length > 0 ? (
            <div className="table-container mt-1">
              <table>
                <thead>
                  <tr>
                    <th>Flat</th>
                    <th>Resident</th>
                    <th>Month</th>
                    <th>Amount Due</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.defaulters.map((d, i) => (
                    <tr key={i}>
                      <td><span className="badge badge-primary">{d.flatDetails}</span></td>
                      <td>{d.residentName}</td>
                      <td>{d.billingMonth}</td>
                      <td style={{ color: 'var(--danger)', fontWeight: 600 }}>₹{d.outstandingAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted mt-1">No defaulters currently.</p>
          )}
        </div>
      </div>
    </div>
  );
}
