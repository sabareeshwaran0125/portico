import { AlertTriangle } from 'lucide-react';
import '../pages/admin/Admin.css'; // modal-overlay and modal-content styles live here

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = false }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: isDanger ? 'var(--danger)' : 'var(--primary)' }}>
          <AlertTriangle size={48} />
        </div>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{title}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{message}</p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-outline" onClick={onCancel} style={{ flex: 1 }}>
            {cancelText}
          </button>
          <button 
            className={`btn ${isDanger ? 'btn-primary' : 'btn-primary'}`} 
            style={{ flex: 1, backgroundColor: isDanger ? 'var(--danger)' : 'var(--primary)' }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
