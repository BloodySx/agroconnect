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
    {
      label: 'Pedidos encontrados',
      value: pagination.total,
      note: 'Resultado da consulta',
      tone: 'total',
    },
    {
      label: 'Pendentes na página',
      value: orders.filter((order) => order.status === 'PENDING').length,
      note: 'Aguardando análise',
      tone: 'pending',
    },
    {
      label: 'Confirmados na página',
      value: orders.filter((order) => order.status === 'CONFIRMED').length,
      note: 'Pedidos confirmados',
      tone: 'confirmed',
    },
    {
      label: 'Valor na página',
      value: formatCurrency(orders.reduce((total, order) => total + order.totalValue, 0)),
      note: 'Soma dos pedidos exibidos',
      tone: 'value',
    },
  ];

  return (
    <AdminLayout title="Pedidos" subtitle="Gerencie e acompanhe os pedidos da plataforma">
      <div className="orders-page">
        <PageHeader
          title="Pedidos"
          subtitle="Acompanhe solicitações, atualize o andamento e consulte os detalhes."
        />

        <section className="orders-overview" aria-label="Resumo dos pedidos">
          {kpis.map((item) => (
            <article className={`orders-stat orders-stat--${item.tone}`} key={item.label}>
              <span className="orders-stat__accent" aria-hidden="true" />
              <div className="orders-stat__content">
                <span className="orders-stat__label">{item.label}</span>
                <strong className="orders-stat__value">{item.value}</strong>
                <span className="orders-stat__note">{item.note}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="orders-workspace" aria-label="Consulta de pedidos">
          <div className="orders-filters">
            <div className="orders-filters__heading">
              <div>
                <span className="orders-section-kicker">CONSULTA</span>
                <h2>Filtrar pedidos</h2>
                <p>Escolha um status ou período para localizar solicitações.</p>
              </div>
            </div>

            <div className="orders-filters__controls">
              <div className="orders-filter-field">
                <label htmlFor="orders-status-filter">Status do pedido</label>
                <select
                  id="orders-status-filter"
                  className="select"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as StatusFilter)}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="orders-filter-field">
                <label htmlFor="orders-start-date">Data inicial</label>
                <input
                  id="orders-start-date"
                  type="date"
                  className="input"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>

              <div className="orders-filter-field">
                <label htmlFor="orders-end-date">Data final</label>
                <input
                  id="orders-end-date"
                  type="date"
                  className="input"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>

              <div className="orders-filter-actions">
                <button type="button" className="btn btn--primary" onClick={handleFilter}>
                  Aplicar filtros
                </button>
                <button type="button" className="btn btn--ghost" onClick={handleClear}>
                  Limpar
                </button>
              </div>
            </div>
          </div>

          <div className="orders-results">
            <div className="orders-results__heading">
              <div>
                <span className="orders-section-kicker">ACOMPANHAMENTO</span>
                <h2>Lista de pedidos</h2>
              </div>
              <span className="orders-results__count">
                {pagination.total} {pagination.total === 1 ? 'pedido' : 'pedidos'}
              </span>
            </div>

            {loading ? (
              <div className="orders-state-block">
                <Spinner center />
              </div>
            ) : error ? (
              <div className="orders-state-block">
                <ErrorState message={error} onRetry={() => load(pagination.page)} />
              </div>
            ) : orders.length === 0 ? (
              <div className="orders-state-block">
                <EmptyState
                  icon={<IconInbox size={26} />}
                  title="Nenhum pedido encontrado"
                  description="Ajuste os filtros ou aguarde novas solicitações."
                />
              </div>
            ) : (
              <>
                <div className="table-wrap orders-table-wrap">
                  <table className="table orders-table">
                    <thead>
                      <tr>
                        <th>Pedido</th>
                        <th>Cliente</th>
                        <th>Data</th>
                        <th>Itens</th>
                        <th>Pagamento</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th className="orders-actions-heading">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <span className="orders-id">#{order.id.slice(0, 8)}</span>
                          </td>
                          <td>
                            <div className="orders-customer">
                              <strong>{order.user.name}</strong>
                              <span>{order.user.email}</span>
                            </div>
                          </td>
                          <td className="orders-date">{formatDate(order.createdAt)}</td>
                          <td>
                            <span className="orders-item-count">{order.items.length}</span>
                          </td>
                          <td className="orders-payment">{order.paymentTerm}</td>
                          <td className="orders-amount">{formatCurrency(order.totalValue)}</td>
                          <td>
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="table__actions-cell orders-actions-cell">
                            <div className="action-group action-group--orders orders-row-actions">
                              <button
                                type="button"
                                className="btn btn--ghost btn--sm orders-details-btn"
                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                              >
                                <IconEye size={16} />
                                <span>Detalhes</span>
                              </button>

                              {updatingStatusIds.has(order.id) ? (
                                <div className="action-status-loading" aria-live="polite">
                                  <Spinner />
                                  <span>Atualizando</span>
                                </div>
                              ) : (
                                <select
                                  className="select select--compact action-status-select orders-status-select"
                                  value={order.status}
                                  onChange={(event) =>
                                    handleStatusChange(order.id, event.target.value as OrderStatus)
                                  }
                                  disabled={updatingStatusIds.has(order.id)}
                                  aria-label={`Alterar status do pedido ${order.id.slice(0, 8)}`}
                                >
                                  {ORDER_STATUS_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                      {statusLabel[option]}
                                    </option>
                                  ))}
                                </select>
                              )}

                              <button
                                type="button"
                                className="btn btn--ghost btn--sm orders-delete-btn"
                                onClick={() => setDeleteConfirmId(order.id)}
                                disabled={deletingIds.has(order.id)}
                              >
                                {deletingIds.has(order.id) ? 'Excluindo...' : 'Excluir'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="orders-pagination">
                  <span className="orders-pagination__info">
                    Exibindo página <strong>{pagination.page}</strong> de{' '}
                    <strong>{pagination.totalPages}</strong>
                    <span className="orders-pagination__separator">·</span>
                    {pagination.total} {pagination.total === 1 ? 'pedido' : 'pedidos'} no total
                  </span>
                  <div className="orders-pagination__controls">
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      disabled={pagination.page <= 1}
                      onClick={() => load(pagination.page - 1)}
                    >
                      <IconChevronLeft size={16} />
                      Anterior
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => load(pagination.page + 1)}
                    >
                      Próxima
                      <IconChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
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
