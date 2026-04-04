import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { adminService, PaymentProofPending } from '../../services/admin.service';

const AdminPaymentProofs: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [proofs, setProofs] = useState<PaymentProofPending[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [previewById, setPreviewById] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const previewByIdRef = useRef(previewById);
  previewByIdRef.current = previewById;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getPendingPaymentProofs();
      setProofs(data);
      setPreviewById((prev) => {
        Object.values(prev).forEach((u) => URL.revokeObjectURL(u));
        return {};
      });
    } catch (e: any) {
      setError(e.message || 'Failed to load payment proofs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(
    () => () => {
      Object.values(previewByIdRef.current).forEach((u) => URL.revokeObjectURL(u));
    },
    []
  );

  const ensurePreview = async (p: PaymentProofPending) => {
    if (previewById[p.id]) return;
    try {
      const url = await adminService.fetchPaymentProofBlobUrl(p.id);
      setPreviewById((prev) => ({ ...prev, [p.id]: url }));
    } catch {
      setError('Could not load file preview');
    }
  };

  const approve = async (proofId: string) => {
    try {
      setBusyId(proofId);
      setError('');
      await adminService.approvePaymentProof(proofId, notesById[proofId]?.trim() || undefined);
      await load();
    } catch (e: any) {
      setError(e.message || 'Approve failed');
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (proofId: string) => {
    try {
      setBusyId(proofId);
      setError('');
      await adminService.rejectPaymentProof(proofId, notesById[proofId]?.trim() || undefined);
      await load();
    } catch (e: any) {
      setError(e.message || 'Reject failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t('admin_payment_proofs')}</h2>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => load()}>
            Refresh
          </button>
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => navigate(`/admin/orders`)}>
            {t('admin_orders')}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status" />
        </div>
      ) : proofs.length === 0 ? (
        <p className="text-muted">No proofs waiting for review.</p>
      ) : (
        <div className="row g-4">
          {proofs.map((p) => (
            <div key={p.id} className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4 mb-3 mb-md-0">
                      <p className="small text-muted mb-1">Order</p>
                      <button
                        type="button"
                        className="btn btn-link p-0 align-baseline"
                        onClick={() => navigate(`/admin/orders/${p.order_id}`)}
                      >
                        Open order
                      </button>
                      <p className="small mb-0 mt-2">
                        <strong>Reference:</strong> {p.payment_reference || '—'}
                      </p>
                      <p className="small mb-0">
                        <strong>Method:</strong> {p.payment_method}
                      </p>
                      <p className="small text-muted mb-0">{p.created_at}</p>
                    </div>
                    <div className="col-md-8">
                      <div className="mb-2 d-flex gap-2 flex-wrap">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => ensurePreview(p)}
                        >
                          Load preview
                        </button>
                      </div>
                      {previewById[p.id] && p.file_type?.startsWith('image/') && (
                        <img
                          src={previewById[p.id]}
                          alt="Proof"
                          className="img-fluid rounded border mb-3"
                          style={{ maxHeight: 280 }}
                        />
                      )}
                      {previewById[p.id] && p.file_type === 'application/pdf' && (
                        <a
                          className="btn btn-sm btn-outline-primary mb-3"
                          href={previewById[p.id]}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open PDF
                        </a>
                      )}
                      <label className="form-label small">Notes (optional)</label>
                      <textarea
                        className="form-control form-control-sm mb-2"
                        rows={2}
                        value={notesById[p.id] || ''}
                        onChange={(e) => setNotesById((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        placeholder="Internal note or reason if rejecting"
                      />
                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          disabled={busyId === p.id}
                          onClick={() => approve(p.id)}
                        >
                          {busyId === p.id ? '…' : 'Approve payment'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          disabled={busyId === p.id}
                          onClick={() => reject(p.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPaymentProofs;
