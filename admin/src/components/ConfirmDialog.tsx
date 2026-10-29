import { Modal } from './Modal';
import { IconAlert } from './icons';

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <Modal
      title={title}
      onClose={loading ? () => {} : onCancel}
      footer={
        <>
          <button className="btn btn--ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className={`confirm-message ${danger ? 'confirm-message--danger' : ''}`}>
        <span className="confirm-message__icon" aria-hidden="true">
          <IconAlert size={20} />
        </span>
        <p>{message}</p>
      </div>
    </Modal>
  );
}
