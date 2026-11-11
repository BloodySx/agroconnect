import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiClientError } from '../services/api';
import type { DashboardResponse } from '../types';
import { AdminLayout } from '../components/layout/AdminLayout';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge, LoadingState, EmptyState, ErrorState } from '../components/ui';
import {
  IconDashboard,
  IconOrders,
  IconBox,
  IconTag,
  IconUsers,
  IconCheck,
  IconX,
} from '../components/icons';
import { formatCurrency, formatDate } from '../utils/format';

interface MetricCard {
  label: string;
  value: string;
  note: string;
  tone: 'total' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'value';
  icon: React.ReactNode;
}

interface StatusItem {
  label: string;
  count: number;
  tone: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<DashboardResponse>('/admin/dashboard');
      setData(response);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao carregar o dashboard.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const metrics: MetricCard[] = data
    ? [
        {
          label: 'Total de pedidos',
          value: String(data.summary.totalOrders),
          note: 'Todos os registros',
          tone: 'total',
          icon: <IconOrders size={20} />,
        },
        {
          label: 'Pendentes',
          value: String(data.summary.pending),
          note: 'Aguardando análise',
          tone: 'pending',
          icon: <IconDashboard size={20} />,
        },
        {
          label: 'Confirmados',
          value: String(data.summary.confirmed),
          note: 'Em andamento',
          tone: 'confirmed',
          icon: <IconCheck size={20} />,
        },
        {
          label: 'Concluídos',
          value: String(data.summary.completed),
          note: 'Finalizados',
          tone: 'completed',
          icon: <IconOrders size={20} />,
        },
        {
          label: 'Cancelados',
          value: String(data.summary.cancelled),
          note: 'Fora da operação',
          tone: 'cancelled',
          icon: <IconX size={20} />,
        },
        {
          label: 'Valor total',
          value: formatCurrency(data.summary.totalValue),
          note: 'Volume dos pedidos',
          tone: 'value',
          icon: <IconTag size={20} />,
        },
      ]
    : [];

  const statuses: StatusItem[] = data
    ? [
        { label: 'Pendentes', count: data.summary.pending, tone: 'pending' },
        { label: 'Confirmados', count: data.summary.confirmed, tone: 'confirmed' },
        { label: 'Concluídos', count: data.summary.completed, tone: 'completed' },
        { label: 'Cancelados', count: data.summary.cancelled, tone: 'cancelled' },
      ]
    : [];

  const statusTotal = statuses.reduce((total, status) => total + status.count, 0);

  const shortcuts = [
    { label: 'Pedidos', description: 'Acompanhe solicitações', to: '/admin/orders', icon: <IconOrders size={21} />, tone: 'green' },
    { label: 'Produtos', description: 'Gerencie o catálogo', to: '/admin/products', icon: <IconBox size={21} />, tone: 'sand' },
    { label: 'Preços', description: 'Consulte e atualize valores', to: '/admin/prices', icon: <IconTag size={21} />, tone: 'sage' },
    { label: 'Usuários', description: 'Gerencie os acessos', to: '/admin/users', icon: <IconUsers size={21} />, tone: 'green' },
  ] as const;

  return (
    <AdminLayout title="Dashboard" subtitle="Visão geral da operação do AgroConnect">
      <div className="dashboard-page">
        <PageHeader title="Dashboard" subtitle="Visão geral da operação do AgroConnect" />

        {loading ? (
          <LoadingState label="Carregando indicadores..." />
        ) : error ? (
          <div className="card">
            <ErrorState message={error} onRetry={load} />
          </div>
        ) : (
          data && (
            <>
              <section className="dashboard-metrics" aria-label="Indicadores gerais">
                {metrics.map((metric) => (
                  <article className={`dashboard-metric dashboard-metric--${metric.tone}`} key={metric.label}>
                    <div className="dashboard-metric__top">
                      <span className="dashboard-metric__label">{metric.label}</span>
                      <span className="dashboard-metric__icon">{metric.icon}</span>
                    </div>
                    <strong className="dashboard-metric__value">{metric.value}</strong>
                    <span className="dashboard-metric__note">{metric.note}</span>
                  </article>
                ))}
              </section>

              <section className="dashboard-panel">
                <div className="dashboard-panel__heading">
                  <div>
                    <span className="dashboard-eyebrow">ACOMPANHAMENTO</span>
                    <h2>Pedidos por status</h2>
                    <p>Distribuição dos pedidos registrados na plataforma.</p>
                  </div>
                  <span className="dashboard-panel__total">
                    {statusTotal} {statusTotal === 1 ? 'pedido' : 'pedidos'}
                  </span>
                </div>

                <div className="dashboard-status-grid">
                  {statuses.map((status) => {
                    const percentage = statusTotal > 0
                      ? Math.round((status.count / statusTotal) * 100)
                      : 0;

                    return (
                      <article className={`dashboard-status dashboard-status--${status.tone}`} key={status.label}>
                        <span className="dashboard-status__dot" aria-hidden="true" />
                        <div className="dashboard-status__copy">
                          <span className="dashboard-status__label">{status.label}</span>
                          <strong className="dashboard-status__count">{status.count}</strong>
                        </div>
                        <span className="dashboard-status__share">
                          {statusTotal > 0 ? `${percentage}% do total` : 'Sem registros'}
                        </span>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="dashboard-panel">
                <div className="dashboard-panel__heading">
                  <div>
                    <span className="dashboard-eyebrow">NAVEGAÇÃO</span>
                    <h2>Acesso rápido</h2>
                    <p>Encontre as principais áreas de gestão.</p>
                  </div>
                </div>
                <div className="dashboard-shortcuts">
                  {shortcuts.map((shortcut) => (
                    <button
                      key={shortcut.label}
                      type="button"
                      className="dashboard-shortcut"
                      onClick={() => navigate(shortcut.to)}
                    >
                      <span className={`dashboard-shortcut__icon dashboard-shortcut__icon--${shortcut.tone}`}>
                        {shortcut.icon}
                      </span>
                      <span className="dashboard-shortcut__copy">
                        <strong>{shortcut.label}</strong>
                        <small>{shortcut.description}</small>
                      </span>
                      <span className="dashboard-shortcut__arrow" aria-hidden="true">↗</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="dashboard-panel dashboard-recent">
                <div className="dashboard-panel__heading">
                  <div>
                    <span className="dashboard-eyebrow">MOVIMENTAÇÕES</span>
                    <h2>Pedidos recentes</h2>
                    <p>Últimas solicitações recebidas pela plataforma.</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm dashboard-recent__all"
                    onClick={() => navigate('/admin/orders')}
                  >
                    Ver todos
                  </button>
                </div>

                {data.recentOrders.length === 0 ? (
                  <EmptyState
                    icon={<IconOrders size={26} />}
                    title="Nenhum pedido realizado ainda"
                    description="Os pedidos aparecerão aqui assim que forem criados."
                  />
                ) : (
                  <div className="table-wrap dashboard-recent__table-wrap">
                    <table className="table dashboard-recent__table">
                      <thead>
                        <tr>
                          <th>Pedido</th>
                          <th>Cliente</th>
                          <th>Status</th>
                          <th>Valor</th>
                          <th>Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td>
                              <button
                                type="button"
                                className="orders-id orders-id-button"
                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                                aria-label={`Abrir detalhes do pedido ${order.id.slice(0, 8)}`}
                                title="Abrir detalhes do pedido"
                              >
                                #{order.id.slice(0, 8)}
                                <span aria-hidden="true">↗</span>
                              </button>
                            </td>
                            <td>
                              <div className="orders-customer">
                                <strong>{order.user.name}</strong>
                                <span>{order.user.email}</span>
                              </div>
                            </td>
                            <td><StatusBadge status={order.status as never} /></td>
                            <td className="orders-amount">{formatCurrency(order.totalValue)}</td>
                            <td className="orders-date">{formatDate(order.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )
        )}
      </div>
    </AdminLayout>
  );
}
