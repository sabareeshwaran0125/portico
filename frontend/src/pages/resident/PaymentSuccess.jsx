import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
      <div className="flex items-center justify-center min-h-[80vh]">
        <Spinner size="md" color="primary" />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <h2 className="font-headline-md text-on-surface mb-4">Bill not found</h2>
        <button 
          className="px-6 py-2 border border-outline text-on-surface-variant rounded-lg font-label-lg hover:bg-surface-container transition-all"
          onClick={() => navigate('/resident/bills')}
        >
          Return to Bills
        </button>
      </div>
    );
  }

    <div className="flex items-center justify-center min-h-[60vh]">
        {/* Transaction Success Modal Card */}
        <section className="card max-w-lg w-full p-8 md:p-12 text-center animate-[fade-in_0.5s_ease-out,zoom-in_0.5s_ease-out]">
            {/* Success Icon Header */}
            <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-tertiary-fixed flex items-center justify-center rounded-full">
                    <span className="material-symbols-outlined text-[48px] text-on-tertiary-fixed-variant" style={{ fontVariationSettings: "'FILL' 0" }}>check_circle</span>
                </div>
            </div>
            
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Payment Successful</h1>
            <p className="font-body-lg text-body-lg text-secondary mb-10 max-w-xs mx-auto">Your maintenance bill for {bill.billingMonth} has been paid.</p>
            
            {/* Transaction Details Table-like Layout */}
            <div className="bg-surface-container-low rounded-lg p-6 mb-10 text-left">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="font-label-lg text-secondary">Transaction ID</span>
                        <span className="font-body-md text-on-surface font-semibold uppercase">#TXN-{Math.floor(Math.random() * 1000000)}</span>
                    </div>
                    <div className="h-px bg-surface-container-highest"></div>
                    <div className="flex justify-between items-center">
                        <span className="font-label-lg text-secondary">Amount Paid</span>
                        <span className="font-body-md text-on-surface font-semibold">₹{bill.amount.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-surface-container-highest"></div>
                    <div className="flex justify-between items-center">
                        <span className="font-label-lg text-secondary">Date</span>
                        <span className="font-body-md text-on-surface">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="h-px bg-surface-container-highest"></div>
                    <div className="flex justify-between items-center">
                        <span className="font-label-lg text-secondary">Bill Title</span>
                        <span className="font-body-md text-on-surface">{bill.title}</span>
                    </div>
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
                <button 
                  onClick={downloadReceipt}
                  className="btn btn-primary w-full py-4 text-lg"
                >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    Download Receipt
                </button>
                <button 
                  onClick={() => navigate('/resident/bills')}
                  className="btn btn-outline w-full py-4 text-lg"
                >
                    Back to Bills
                </button>
            </div>
            
            {/* Footer Message */}
            <p className="mt-8 font-body-sm text-body-sm text-secondary opacity-60">
                A confirmation email has been sent to your registered address.
            </p>
        </section>
    </div>
  );
}
