import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Spinner from '../../components/common/Spinner';

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

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-[50vh] w-full">
              <Spinner size="lg" color="primary" />
          </div>
      );
  }

  if (!analytics) return null;

  const pieData = Object.entries(analytics.complaintsByCategory || {}).map(([name, value]) => ({ name, value }));
  const COLORS = ['#e8734f', '#485f86', '#8a726b', '#006b5b', '#a13f1f'];

  return (
    <div className="w-full space-y-6">
        {/* Dashboard Header */}
        <div className="flex flex-wrap justify-between items-end gap-4">
            <div>
                <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
                    <span className="font-label-md text-label-md">Admin Portal</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    <span className="font-label-md text-label-md text-primary">Overview</span>
                </nav>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Executive Overview</h2>
                <p className="font-body-md text-secondary mt-1">Real-time property performance and administrative insights.</p>
            </div>
            <button className="btn btn-primary btn-md">
                <span className="material-symbols-outlined mr-2">download</span>
                <span className="hidden sm:inline">Export Report</span>
            </button>
        </div>

        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* KPI 1: Total Residents */}
            <div className="card">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                        <span className="material-symbols-outlined">groups</span>
                    </div>
                    <span className="text-tertiary font-label-sm flex items-center">
                        <span className="material-symbols-outlined text-[16px] mr-1">home</span>
                    </span>
                </div>
                <p className="text-secondary font-label-md uppercase tracking-wider">Total Residents</p>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1">{analytics.totalResidents}</h3>
                <p className="font-label-sm text-outline mt-2">Occupancy: {analytics.occupancyRate.toFixed(1)}%</p>
            </div>

            {/* KPI 2: Revenue */}
            <div className="card">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <span className="material-symbols-outlined">payments</span>
                    </div>
                    <span className="text-tertiary font-label-sm flex items-center">
                        <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span> This Month
                    </span>
                </div>
                <p className="text-secondary font-label-md uppercase tracking-wider">Revenue (MTD)</p>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1">₹{analytics.maintenanceCollectedThisMonth.toLocaleString()}</h3>
                <p className="font-label-sm text-error mt-2">Pending: ₹{analytics.maintenancePendingThisMonth.toLocaleString()}</p>
            </div>

            {/* KPI 3: Open Complaints */}
            <div className="card">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-error/10 rounded-lg text-error">
                        <span className="material-symbols-outlined">forum</span>
                    </div>
                    <span className="text-error font-label-sm flex items-center">
                        <span className="material-symbols-outlined text-[16px] mr-1">priority_high</span> Attention
                    </span>
                </div>
                <p className="text-secondary font-label-md uppercase tracking-wider">Open Complaints</p>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1">{analytics.openComplaintsCount}</h3>
                <p className="font-label-sm text-outline mt-2">Needs action</p>
            </div>

            {/* KPI 4: Active Visitors */}
            <div className="card">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-tertiary/10 rounded-lg text-tertiary">
                        <span className="material-symbols-outlined">person_pin_circle</span>
                    </div>
                    <span className="text-outline font-label-sm flex items-center">
                        <span className="material-symbols-outlined text-[16px] mr-1">today</span> Today
                    </span>
                </div>
                <p className="text-secondary font-label-md uppercase tracking-wider">Visitors Today</p>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1">{analytics.visitorsToday}</h3>
                <p className="font-label-sm text-outline mt-2">Recorded at gate</p>
            </div>
        </div>

        {/* Charts Section (Bento Grid Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Trends (Line/Bar Chart) */}
            <div className="lg:col-span-2 card">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h4 className="font-headline-sm text-headline-sm text-on-surface">Revenue Trends</h4>
                        <p className="font-body-sm text-outline">Collections vs Pending (Monthly)</p>
                    </div>
                </div>
                
                <div className="h-72 w-full">
                    {analytics.monthlyTrends && analytics.monthlyTrends.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e3e5" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#57423c' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#57423c' }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(27,39,51,0.08)' }} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                <Bar dataKey="collected" name="Collected" fill="#e8734f" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="pending" name="Pending" fill="#8a726b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full border-2 border-dashed border-outline-variant/50 rounded-xl">
                            <span className="text-on-surface-variant">No trend data available</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Complaints Distribution (Doughnut Chart) */}
            <div className="card flex flex-col h-full">
                <div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">Complaints Distribution</h4>
                    <p className="font-body-sm text-outline mb-6">Breakdown by Category</p>
                </div>
                
                <div className="flex-1 min-h-[200px] w-full flex items-center justify-center">
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(27,39,51,0.08)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full w-full border-2 border-dashed border-outline-variant/50 rounded-xl">
                            <span className="text-on-surface-variant">No complaints logged</span>
                        </div>
                    )}
                </div>
                
                {pieData.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {pieData.map((entry, index) => (
                            <div key={index} className="flex items-center font-label-md text-on-surface">
                                <span className="w-2.5 h-2.5 rounded-full mr-2 shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span> 
                                <span className="truncate">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Recent Activity / Defaulters & Property Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Maintenance Defaulters Table */}
            <div className="card !p-0 overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
                    <h4 className="font-headline-sm text-headline-sm text-on-surface">Maintenance Defaulters</h4>
                    <button className="text-primary font-label-md hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left">
                        <thead className="bg-surface-container-low">
                            <tr>
                                <th className="px-6 py-4 font-label-md text-outline uppercase tracking-wider">Flat / Resident</th>
                                <th className="px-6 py-4 font-label-md text-outline uppercase tracking-wider">Month</th>
                                <th className="px-6 py-4 font-label-md text-outline uppercase tracking-wider text-right">Amount Due</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/30">
                            {analytics.defaulters && analytics.defaulters.length > 0 ? (
                                analytics.defaulters.map((d, i) => (
                                    <tr key={i} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-body-md text-on-surface font-semibold">{d.flatDetails}</p>
                                            <p className="text-[12px] text-outline mt-0.5">{d.residentName}</p>
                                        </td>
                                        <td className="px-6 py-4 font-label-md text-secondary">{d.billingMonth}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="badge bg-error/10 text-error whitespace-nowrap">
                                                ₹{d.outstandingAmount.toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-10 text-center text-on-surface-variant font-body-md">
                                        No defaulters currently. Great!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Real-time Map / Property Status */}
            <div className="card relative overflow-hidden group flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="font-headline-sm text-headline-sm text-on-surface">Property Map</h4>
                    <div className="flex space-x-1">
                        <button className="p-1.5 bg-surface-container-low rounded hover:bg-surface-container-high transition-colors text-secondary">
                            <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                        </button>
                        <button className="p-1.5 bg-surface-container-low rounded hover:bg-surface-container-high transition-colors text-secondary">
                            <span className="material-symbols-outlined text-[18px]">zoom_out</span>
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 min-h-[280px] rounded-lg bg-surface-container-high overflow-hidden relative border border-outline-variant/30">
                    {/* Simulated Map UI */}
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')" }}>
                        <div className="absolute inset-0 bg-[#1B3358]/20 mix-blend-multiply"></div>
                    </div>
                    
                    {/* Pulse Points */}
                    <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-primary-container rounded-full animate-ping opacity-75"></div>
                    <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-primary-container rounded-full shadow-[0_0_8px_rgba(232,115,79,0.8)] translate-x-0.5 translate-y-0.5"></div>
                    
                    <div className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-tertiary rounded-full animate-ping opacity-75"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-tertiary rounded-full shadow-[0_0_8px_rgba(0,107,91,0.8)] translate-x-0.5 translate-y-0.5"></div>
                    
                    {/* Map Overlay Info */}
                    <div className="absolute bottom-4 left-4 bg-on-background/80 backdrop-blur-md p-3 rounded-lg text-on-primary shadow-sm border border-outline-variant/10">
                        <p className="font-label-sm uppercase tracking-widest opacity-70">Tower Alpha Status</p>
                        <p className="font-label-lg mt-1 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-tertiary mr-2"></span> Operational
                        </p>
                    </div>
                </div>
                
                <div className="mt-6 flex justify-around">
                    <div className="text-center">
                        <p className="font-headline-sm text-headline-sm text-on-surface">0</p>
                        <p className="text-[11px] text-outline font-bold uppercase mt-1">Lift Downtime</p>
                    </div>
                    <div className="text-center">
                        <p className="font-headline-sm text-headline-sm text-on-surface">100%</p>
                        <p className="text-[11px] text-outline font-bold uppercase mt-1">Water Supply</p>
                    </div>
                    <div className="text-center">
                        <p className="font-headline-sm text-headline-sm text-on-surface">Active</p>
                        <p className="text-[11px] text-outline font-bold uppercase mt-1">DG Back-up</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
