import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/common/Spinner';

export default function PaymentSuccess() {
  const { billId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillDetails();
  }, [billId]);

  const fetchBillDetails = async () => {
    try {
      // In a real app, you might have a specific endpoint to fetch a single bill by ID
      // Assuming GET /resident/bills returns all bills for the user
      const res = await api.get('/resident/bills');
      const foundBill = res.data.find(b => b.id === parseInt(billId));
      if (foundBill) {
        setBill(foundBill);
      } else {
        toast.error('Bill not found');
      }
    } catch (error) {
      toast.error('Failed to load bill details');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async () => {
    try {
      const res = await api.get(`/resident/payments/receipt/${billId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt_Bill_${billId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spinner size="md" color="primary" />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="page-container text-center" style={{ paddingTop: '5rem' }}>
        <h2>Bill not found</h2>
        <button className="btn btn-outline mt-4" onClick={() => navigate('/resident/bills')}>Return to Bills</button>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '2rem' }}>
      <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '3rem 2rem', textAlign: 'center', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={48} color="#22c55e" />
          </div>
        </div>
        
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Payment Successful!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Your maintenance bill has been paid successfully.</p>
        
        <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2.5rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-color)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Amount Paid</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>₹{bill.amount}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Bill Title</span>
            <span style={{ fontWeight: '500' }}>{bill.title}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Billing Month</span>
            <span style={{ fontWeight: '500' }}>{bill.billingMonth}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Transaction ID</span>
            <span style={{ fontWeight: '500', fontFamily: 'monospace' }}>TXN-{Math.floor(Math.random() * 1000000000)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Date</span>
            <span style={{ fontWeight: '500' }}>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }} onClick={() => navigate('/resident/bills')}>
            <ArrowLeft size={18} /> Back to Bills
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }} onClick={downloadReceipt}>
            <Download size={18} /> Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
