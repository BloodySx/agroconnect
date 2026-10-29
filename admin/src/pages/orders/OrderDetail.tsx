import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiClientError } from '../../services/api';
import type { Order, OrderStatus } from '../../types';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { PageHeader } from '../../components/PageHeader';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { StatusBadge, Spinner, EmptyState, ErrorState } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { IconArrowLeft, IconCheck, IconX, IconInbox } from '../../components/icons';
import { formatCurrency, formatDate } from '../../utils/format';

type PendingAction = {
  status: Exclude<OrderStatus, 'PENDING'>;
  title: string;
  message: string;
  danger?: boolean;
  buttonLabel: string;
};

function actionsFor(status: OrderStatus): PendingAction[] {
  if (status === 'PENDING') {
    return [
      {
        status: 'CONFIRMED',
        title: 'Confirmar pedido',
        message: 'Deseja confirmar este pedido? O status será alterado para Confirmado.',
        buttonLabel: 'Confirmar pedido',
      },
      {
        status: 'CANCELLED',
        title: 'Cancelar pedido',
        message: 'Deseja realmente cancelar este pedido? Esta ação não poderá ser desfeita.',
        danger: true,
        buttonLabel: 'Cancelar pedido',
      },
    ];
  }
  if (status === 'CONFIRMED') {
    return [
      {
        status: 'COMPLETED',
        title: 'Concluir pedido',
        message: 'Deseja marcar este pedido como concluído?',
        buttonLabel: 'Concluir pedido',
      },
      {
        status: 'CANCELLED',
        title: 'Cancelar pedido',
        message: 'Deseja realmente cancelar este pedido? Esta ação não poderá ser desfeita.',
        danger: true,
        buttonLabel: 'Cancelar pedido',
      },
    ];
  }
  return [];
}

export function OrderDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Order>(`/admin/orders/${id}`);
      setOrder(data);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setNotFound(true);
      } else if (err instanceof ApiClientError && err.status === 400) {
        setNotFound(true);
        setError('ID do pedido inválido.');
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao carregar pedido.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmAction = async () => {
    if (!pending || !order) return;
    setSubmitting(true);
    try {
      const updated = await api.patch<Order>(`/admin/orders/${order.id}/status`, {
        status: pending.status,
      });
      setOrder(updated);
      showToast(`Pedido ${updated.id.slice(0, 8)} atualizado com sucesso.`);
      setPending(null);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 409) {
        showToast(err.message || 'Transição de status não permitida.', 'error');
      } else {
        showToast(err instanceof Error ? err.message : 'Erro ao atualizar pedido.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Detalhe do pedido" subtitle={`Pedido #${id.slice(0, 8)}`}>
        <Spinner center />
      </AdminLayout>
    );
  }

  if (notFound) {
    return (
      <AdminLayout title="Detalhe do pedido" subtitle="Pedido não encontrado">
        <div className="card">
          <EmptyState
            icon={<IconInbox size={26} />}
            title="Pedido não encontrado"
            description={error ?? 'Verifique o identificador ou retorne à lista.'}
          />
        </div>
        <button className="back-link back-link--spaced" onClick={() => navigate('/admin/orders')}>
          <IconArrowLeft size={16} /> Voltar para pedidos
        </button>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout title="Detalhe do pedido" subtitle="Erro">
        <div className="card">
          <ErrorState message={error ?? 'Erro desconhecido.'} onRetry={load} />
        </div>
      </AdminLayout>
    );
  }

  const itemCount = order.items.reduce((acc, i) => acc + i.quantity, 0);
  const availableActions = actionsFor(order.status);

  return (
    <AdminLayout
      title={`Pedido #${order.id.slice(0, 8)}`}
      subtitle={`Criado em ${formatDate(order.createdAt)}`}
    >
      <button type="button" className="back-link" onClick={() => navigate('/admin/orders')}>
        <IconArrowLeft size={16} /> Voltar para pedidos
      </button>

      <PageHeader
        title={`Pedido #${order.id.slice(0, 8)}`}
        subtitle={`Criado em ${formatDate(order.createdAt)}`}
        action={<StatusBadge status={order.status} />}
      />

      <div className="detail-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div className="card">
            <div className="card__header">
              <div className="card__title">Informações do pedido</div>
              <StatusBadge status={order.status} />
            </div>
            <div className="card__body">
              <div className="info-list">
                <div className="info-row">
                  <span className="info-row__label">Identificador</span>
                  <span className="info-row__value">#{order.id.slice(0, 8)}</span>
                </div>
                <div className="info-row">
                  <span className="info-row__label">Status</span>
                  <span className="info-row__value"><StatusBadge status={order.status} /></span>
                </div>
                <div className="info-row">
                  <span className="info-row__label">Data de criação</span>
                  <span className="info-row__value">{formatDate(order.createdAt)}</span>
                </div>
                <div className="info-row">
                  <span className="info-row__label">Última atualização</span>
                  <span className="info-row__value">{formatDate(order.updatedAt)}</span>
                </div>
                <div className="info-row">
                  <span className="info-row__label">Prazo de entrega</span>
                  <span className="info-row__value">{order.deliveryTerm}</span>
                </div>
                <div className="info-row">
                  <span className="info-row__label">Condição de pagamento</span>
                  <span className="info-row__value">{order.paymentTerm}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <div className="card__title">Itens do pedido</div>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Embalagem</th>
                    <th>Qtd.</th>
                    <th>Unit.</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="cell-strong">{item.product.name}</td>
                      <td className="cell-muted">{item.package.name}</td>
                      <td>{item.quantity}</td>
                      <td className="cell-muted">{formatCurrency(item.unitPrice)}</td>
                      <td className="cell-amount" style={{ textAlign: 'right' }}>
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div className="card">
            <div className="card__header">
              <div className="card__title">Cliente</div>
            </div>
            <div className="card__body">
              <div className="info-list">
                <div className="info-row">
                  <span className="info-row__label">Nome</span>
                  <span className="info-row__value">{order.user.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-row__label">E-mail</span>
                  <span className="info-row__value">{order.user.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-row__label">Conta</span>
                  <span className="info-row__value">
                    {order.user.active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card summary-card">
            <div className="card__header">
              <div className="card__title">Resumo</div>
            </div>
            <div className="card__body">
              <div className="summary-row">
                <span className="muted">Total de itens</span>
                <span className="cell-strong">{itemCount}</span>
              </div>
              <div className="summary-row summary-row--total">
                <span>Valor total</span>
                <span>{formatCurrency(order.totalValue)}</span>
              </div>
            </div>
          </div>

          {availableActions.length > 0 && (
            <div className="card">
              <div className="card__header">
                <div className="card__title">Ações</div>
              </div>
              <div className="card__body">
                <div className="actions-row">
                  {availableActions.map((action) => (
                    <button
                      key={action.status}
                      className={`btn ${
                        action.danger ? 'btn--danger' : 'btn--success'
                      } btn--sm`}
                      onClick={() => setPending(action)}
                    >
                      {action.danger ? <IconX size={16} /> : <IconCheck size={16} />}
                      {action.status === 'CONFIRMED'
                        ? 'Confirmar'
                        : action.status === 'COMPLETED'
                        ? 'Concluir'
                        : 'Cancelar'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!pending}
        title={pending?.title ?? ''}
        message={pending?.message ?? ''}
        confirmLabel={submitting ? 'Processando...' : pending?.buttonLabel}
        cancelLabel="Voltar"
        danger={pending?.danger}
        loading={submitting}
        onConfirm={confirmAction}
        onCancel={() => !submitting && setPending(null)}
      />
    </AdminLayout>
  );
}
