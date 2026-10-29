import type { ReactNode } from 'react';
import type { OrderStatus } from '../types';
import { statusLabel } from '../utils/format';
export { ConfirmDialog } from './ConfirmDialog';

export function StatusBadge({ status }: { status: OrderStatus }) {
  const classByStatus: Record<OrderStatus, string> = {
    PENDING: 'badge--pending',
    CONFIRMED: 'badge--confirmed',
    COMPLETED: 'badge--completed',
    CANCELLED: 'badge--cancelled',
  };
  return (
    <span className={`badge ${classByStatus[status]}`}>
      <span className="badge__dot" />
      {statusLabel[status]}
    </span>
  );
}

export function Spinner({ center = false }: { center?: boolean }) {
  return <div className={center ? 'spinner spinner--center' : 'spinner'} />;
}

export function LoadingState({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="state">
      <Spinner />
      <div>{label}</div>
    </div>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={`badge ${active ? 'badge--completed' : 'badge--cancelled'}`}>
      <span className="badge__dot" />
      {active ? 'Ativo' : 'Inativo'}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="state">
      <div className="state__icon">{icon}</div>
      <div>
        <div className="state__title">{title}</div>
        {description && <div>{description}</div>}
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state">
      <div className="state__icon">⚠️</div>
      <div>
        <div className="state__title">Não foi possível carregar</div>
        <div>{message}</div>
      </div>
      {onRetry && (
        <button className="btn btn--ghost" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}
