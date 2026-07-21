import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ResidentDashboard() {
  const [bills, setBills] = useState([]);
  const [notices, setNotices] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [billsRes, noticesRes, visitorsRes] = await Promise.all([
        api.get('/resident/bills'),
        api.get('/notices'),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const pendingBills = bills.filter(b => b.status === 'PENDING' || b.status === 'OVERDUE');
  const recentNotices = notices.slice(0, 3);
  const activeVisitors = visitors.filter(v => v.approvalStatus === 'APPROVED' && v.outTime === null).length;
  const pendingVisitorsCount = visitors.filter(v => v.approvalStatus === 'PENDING').length;

  return (
    <div className="w-full space-y-6">
        {/* Hero Banner */}
        <section className="relative h-64 rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(27,39,51,0.08)] group">
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10"></div>
            <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida/AP1WRLuyEVmgWJy0viBRZoo-woZzzsI-njlhv1T6GQc7qGI-n859cYG0OqyfwjmeTkc8jIXCefdGSfJ8tER9w2NrJtKys4OUwFmaOk2A0bEFYK8cV1nnn6An5Qq1zijpchhgljgt0ooS0xzVpn0UubS2qIzZZc1U_c-5UX5ZmBc6fPXEc2i9b10DXmA1dk7HO8M3VjtRTlW09d2lsHcXc8w04Y81_moyHd946fIcc1wHm27Ba2zc_JDkP46tDDY')" }}
            ></div>
            <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-12">
                <h2 className="font-display-lg text-display-lg text-white mb-2">Welcome Home, {user?.name?.split(' ')[0] || 'Resident'}</h2>
                <p className="text-white/80 font-body-lg text-body-lg max-w-lg">Everything you need to manage your residence at Prestige Heights, all in one place.</p>
            </div>
        </section>

        {/* Grid Layout for Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Bills Card */}
            <section className="card !p-0 flex flex-col overflow-hidden h-full">
                <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-bright">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Pending Bills</h3>
                    {pendingBills.length > 0 && (
                        <span className="badge bg-primary-container/10 text-primary">
                            {pendingBills.length} Pending
                        </span>
                    )}
                </div>
                <div className="p-0 overflow-x-auto flex-1">
                    {pendingBills.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Service</th>
                                    <th>Due Date</th>
                                    <th className="text-right">Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingBills.slice(0,3).map(bill => (
                                    <tr key={bill.id} className="group">
                                        <td>{bill.title}</td>
                                        <td>{bill.dueDate}</td>
                                        <td className="text-right font-semibold">₹{bill.amount}</td>
                                        <td>
                                            <span className={`badge ${bill.status === 'OVERDUE' ? 'bg-error-container text-on-error-container' : 'bg-[#fff8e1] text-[#f57f17]'}`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-secondary">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">task_alt</span>
                            <p>You have no pending bills. Great job!</p>
                        </div>
                    )}
                </div>
                <div className="mt-auto p-6">
                    <Link to="/resident/bills" className="btn btn-primary w-full py-3 justify-center min-h-[48px]">
                        View All Bills & Pay
                    </Link>
                </div>
            </section>

            {/* Recent Notices Card */}
            <section className="card !p-0 flex flex-col overflow-hidden h-full">
                <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-bright">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Recent Notices</h3>
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>push_pin</span>
                </div>
                <div className="p-6 space-y-4 flex-1">
                    {recentNotices.length > 0 ? (
                        recentNotices.map(notice => (
                            <Link to="/resident/notices" key={notice.id} className="block p-4 rounded-lg bg-surface-container-lowest border border-outline-variant/10 hover:border-primary-container/40 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-body-lg text-body-lg font-semibold text-on-surface group-hover:text-primary transition-colors">{notice.title}</h4>
                                    <span className="material-symbols-outlined text-outline text-sm">chevron_right</span>
                                </div>
                                <div className="flex items-center gap-4 text-secondary font-label-sm text-label-sm">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">timer</span>
                                        Expires: {notice.expiryDate}
                                    </span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center text-secondary py-4">No recent notices.</div>
                    )}
                </div>
                <div className="mt-auto p-6 border-t border-outline-variant/10">
                    <Link to="/resident/notices" className="btn btn-outline w-full py-3 justify-center min-h-[48px]">
                        View All Notices
                    </Link>
                </div>
            </section>
        </div>

        {/* Bento Mini Grid (Quick Stats) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
            <div className="card bg-[#1B3358] text-white">
                <p className="font-label-md text-label-md text-white/60 mb-2">Pending Visitors</p>
                <div className="flex items-end justify-between">
                    <span className="text-4xl font-bold">{String(pendingVisitorsCount).padStart(2, '0')}</span>
                    <span className="material-symbols-outlined opacity-50">group</span>
                </div>
            </div>
            
            <div className="card">
                <p className="font-label-md text-label-md text-secondary mb-2">Active Visitors</p>
                <div className="flex items-end justify-between">
                    <span className="text-4xl font-bold text-on-surface">{String(activeVisitors).padStart(2, '0')}</span>
                    <span className="material-symbols-outlined text-primary">emoji_people</span>
                </div>
            </div>
            
            <div className="card">
                <p className="font-label-md text-label-md text-secondary mb-2">Pending Bills</p>
                <div className="flex items-end justify-between">
                    <span className="text-4xl font-bold text-on-surface">{String(pendingBills.length).padStart(2, '0')}</span>
                    <span className="material-symbols-outlined text-amber-500">pending_actions</span>
                </div>
            </div>
            
            <div className="card bg-primary text-white">
                <p className="font-label-md text-label-md text-white/60 mb-2">Total Notices</p>
                <div className="flex items-end justify-between">
                    <span className="text-4xl font-bold">{String(notices.length).padStart(2, '0')}</span>
                    <span className="material-symbols-outlined opacity-50">campaign</span>
                </div>
            </div>
        </section>
    </div>
  );
}
