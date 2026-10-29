import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiClientError } from '../../services/api';
import type { Order, OrdersResponse, OrderStatus } from '../../types';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge, Spinner, EmptyState, ErrorState, ConfirmDialog } from '../../components/ui';
import { IconInbox, IconEye, IconChevronLeft, IconChevronRight } from '../../components/icons';
import { useToast } from '../../components/Toast';
import { formatCurrency, formatDate, statusLabel } from '../../utils/format';

type StatusFilter = '' | OrderStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: '', label: 'Todos os status' },
  { value: 'PENDING', label: statusLabel.PENDING },
  { value: 'CONFIRMED', label: statusLabel.CONFIRMED },
  { value: 'COMPLETED', label: statusLabel.COMPLETED },
  { value: 'CANCELLED', label: statusLabel.CANCELLED },
];

const ORDER_STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;

export function OrdersListPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [status, setStatus] = useState<StatusFilter>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatusIds, setUpdatingStatusIds] = useState<Set<string>>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const load = useCallback(
    async (page: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        if (status) params.set('status', status);
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);

        const res = await api.get<OrdersResponse>(`/admin/orders?${params.toString()}`);
        setOrders(res.data);
        setPagination(res.pagination);
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 401) {
          setError('Sessão expirada. Faça login novamente.');
        } else {
          setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos.');
        }
      } finally {
        setLoading(false);
      }
    },
    [status, startDate, endDate]
  );

  const handleStatusChange = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatusIds((prev) => new Set([...prev, orderId]));
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      showToast('Status do pedido atualizado.');
      await load(pagination.page);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          setError('Sessão expirada. Faça login novamente.');
        } else if (err.status === 403) {
          setError('Acesso negado.');
        } else if (err.status === 404) {
          setError('Pedido não encontrado.');
        } else {
          setError(err.message || 'Erro ao alterar status.');
        }
      } else {
        setError('Erro ao alterar status.');
      }
    } finally {
      setUpdatingStatusIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  }, [load, pagination.page, showToast]);

  const handleDelete = useCallback(async (orderId: string) => {
    setDeletingIds((prev) => new Set([...prev, orderId]));
    try {
      await api.delete(`/admin/orders/${orderId}`);
      showToast('Pedido excluído com sucesso.');
      await load(pagination.page);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          setError('Sessão expirada. Faça login novamente.');
        } else if (err.status === 403) {
          setError('Acesso negado.');
        } else if (err.status === 404) {
          setError('Pedido não encontrado.');
        } else {
          setError(err.message || 'Erro ao excluir pedido.');
        }
      } else {
        setError('Erro ao excluir pedido.');
      }
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
      setDeleteConfirmId(null);
    }
  }, [load, pagination.page, showToast]);

  useEffect(() => {
    load(1);
  }, [load]);

  const handleFilter = () => load(1);
  const handleClear = () => {
    setStatus('');
    setStartDate('');
    setEndDate('');
  };

  const kpis = [
    { label: 'Total de pedidos', value: pagination.total },
    {
      label: 'Pendentes nesta página',
      value: orders.filter((o) => o.status === 'PENDING').length,
    },
    {
      label: 'Confirmados nesta página',
      value: orders.filter((o) => o.status === 'CONFIRMED').length,
    },
    {
      label: 'Valor nesta página',
      value: formatCurrency(orders.reduce((acc, o) => acc + o.totalValue, 0)),
    },
  ];

  return (
    <AdminLayout title="Pedidos" subtitle="Gerencie e acompanhe os pedidos da plataforma">
      <PageHeader
        title="Pedidos"
        subtitle={`${pagination.total} pedido(s) encontrado(s)`}
      />
      <div className="kpi-row">
        {kpis.map((k) => (
          <div key={k.label} className="card kpi">
            <div className="kpi__label">{k.label}</div>
            <div className="kpi__value">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card__header">
          <div className="card__title">Lista de pedidos</div>
          <div className="filter-bar">
            <div className="field">
              <label className="field__label" htmlFor="orders-status-filter">Status</label>
              <select
                id="orders-status-filter"
                className="select"
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusFilter)}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="orders-start-date">Data inicial</label>
              <input
                id="orders-start-date"
                type="date"
                className="input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="orders-end-date">Data final</label>
              <input
                id="orders-end-date"
                type="date"
                className="input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button className="btn btn--primary" onClick={handleFilter}>
              Filtrar
            </button>
            <button className="btn btn--ghost" onClick={handleClear}>
              Limpar
            </button>
          </div>
        </div>

        {loading ? (
          <Spinner center />
        ) : error ? (
          <ErrorState message={error} onRetry={() => load(pagination.page)} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<IconInbox size={26} />}
            title="Nenhum pedido encontrado"
            description="Ajuste os filtros ou aguarde novas solicitações de pedidos."
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Itens</th>
                    <th>Pagamento</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="cell-strong">#{o.id.slice(0, 8)}</td>
                      <td>
                        <div className="cell-strong">{o.user.name}</div>
                        <div className="cell-muted">{o.user.email}</div>
                      </td>
                      <td className="cell-muted">{formatDate(o.createdAt)}</td>
                      <td>{o.items.length}</td>
                      <td className="cell-muted">{o.paymentTerm}</td>
                      <td className="cell-amount">{formatCurrency(o.totalValue)}</td>
                      <td>
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="table__actions-cell">
                            <div className="action-group action-group--orders">
                              <button
                                className="btn btn--ghost btn--sm"
                                onClick={() => navigate(`/admin/orders/${o.id}`)}
                              >
                                <IconEye size={16} /> Detalhes
                              </button>
                              {updatingStatusIds.has(o.id) ? (
                                <div className="action-status-loading" aria-live="polite">
                                  <Spinner />
                                  <span>Atualizando</span>
                                </div>
                              ) : (
                                <select
                                  className="select select--compact action-status-select"
                                  value={o.status}
                                  onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                                  disabled={updatingStatusIds.has(o.id)}
                                  aria-label={`Alterar status do pedido ${o.id.slice(0, 8)}`}
                                >
                                  {ORDER_STATUS_OPTIONS.map((status) => (
                                    <option key={status} value={status}>
                                      {statusLabel[status]}
                                    </option>
                                  ))}
                                </select>
                              )}
                              <button
                                className={`btn btn--${deletingIds.has(o.id) ? 'danger' : 'ghost'} btn--sm`}
                                onClick={() => setDeleteConfirmId(o.id)}
                                disabled={deletingIds.has(o.id)}
                              >
                                {deletingIds.has(o.id) ? 'Excluindo...' : 'Excluir'}
                              </button>
                            </div>
                          </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <div className="pagination__info">
                Página {pagination.page} de {pagination.totalPages} · {pagination.total} pedidos
              </div>
              <div className="pagination__controls">
                <button
                  className="btn btn--ghost btn--sm"
                  disabled={pagination.page <= 1}
                  onClick={() => load(pagination.page - 1)}
                >
                  <IconChevronLeft size={16} /> Anterior
                </button>
                <button
                  className="btn btn--ghost btn--sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => load(pagination.page + 1)}
                >
                  Próxima <IconChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <ConfirmDialog
        open={deleteConfirmId !== null}
        title="Excluir pedido"
        message={`Tem certeza que deseja excluir o pedido #${deleteConfirmId?.slice(0, 8) ?? ''}? Esta ação não poderá ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        danger={true}
        loading={deletingIds.has(deleteConfirmId ?? '')}
        onConfirm={async () => {
          if (deleteConfirmId) {
            await handleDelete(deleteConfirmId);
          }
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </AdminLayout>
  );
}
