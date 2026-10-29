import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiClientError } from '../services/api';
import type { DashboardResponse } from '../types';
import { AdminLayout } from '../components/layout/AdminLayout';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge, LoadingState, EmptyState, ErrorState } from '../components/ui';
import { IconDashboard, IconOrders, IconBox, IconTag, IconUsers, IconEye } from '../components/icons';
import { formatCurrency, formatDate } from '../utils/format';

interface CardDef {
  label: string;
  value: string;
  icon: React.ReactNode;
  cls: string;
}

interface StatusSegment {
  label: string;
  count: number;
  cls: string;
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
      const res = await api.get<DashboardResponse>('/admin/dashboard');
      setData(res);
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

  const cards: CardDef[] = data
    ? [
        { label: 'Total de pedidos', value: String(data.summary.totalOrders), icon: <IconOrders />, cls: 'badge--confirmed' },
        { label: 'Pendentes', value: String(data.summary.pending), icon: <IconDashboard />, cls: 'badge--pending' },
        { label: 'Confirmados', value: String(data.summary.confirmed), icon: <IconOrders />, cls: 'badge--confirmed' },
        { label: 'Concluídos', value: String(data.summary.completed), icon: <IconOrders />, cls: 'badge--completed' },
        { label: 'Cancelados', value: String(data.summary.cancelled), icon: <IconOrders />, cls: 'badge--cancelled' },
        { label: 'Valor total', value: formatCurrency(data.summary.totalValue), icon: <IconTag />, cls: 'badge--confirmed' },
      ]
    : [];

  const segments: StatusSegment[] = data
    ? [
        { label: 'Pendentes', count: data.summary.pending, cls: 'badge--pending' },
        { label: 'Confirmados', count: data.summary.confirmed, cls: 'badge--confirmed' },
        { label: 'Concluídos', count: data.summary.completed, cls: 'badge--completed' },
        { label: 'Cancelados', count: data.summary.cancelled, cls: 'badge--cancelled' },
      ]
    : [];
  const maxSegment = Math.max(1, ...segments.map((s) => s.count));
  const statusTotal = segments.reduce((acc, s) => acc + s.count, 0);

  const shortcuts = [
    { label: 'Pedidos', to: '/admin/orders', icon: <IconOrders /> },
    { label: 'Produtos', to: '/admin/products', icon: <IconBox /> },
    { label: 'Preços', to: '/admin/prices', icon: <IconTag /> },
    { label: 'Usuários', to: '/admin/users', icon: <IconUsers /> },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle="Visão geral da operação do SS Connect">
      <PageHeader title="Dashboard" subtitle="Visão geral da operação do SS Connect" />

      {loading ? (
        <LoadingState label="Carregando indicadores..." />
      ) : error ? (
        <div className="card">
          <ErrorState message={error} onRetry={load} />
        </div>
      ) : (
        data && (
          <>
            <div className="kpi-row">
              {cards.map((card) => (
                <div key={card.label} className="card kpi">
                  <div className="kpi__top">
                    <div className="kpi__label">{card.label}</div>
                    <span className={`kpi__icon ${card.cls}`} aria-hidden="true">
                      {card.icon}
                    </span>
                  </div>
                  <div className="kpi__value">{card.value}</div>
                </div>
              ))}
            </div>

            <div className="card section-card">
              <div className="card__header">
                <div className="card__title">Pedidos por status</div>
                <span className="muted" style={{ fontSize: 13 }}>
                  {statusTotal} no total
                </span>
              </div>
              <div className="card__body">
                {segments.map((seg) => (
                  <div key={seg.label} className="status-progress">
                    <div className="status-progress__label">
                      <span className="muted">{seg.label}</span>
                      <span className="cell-strong">{seg.count}</span>
                    </div>
                    <div className="status-progress__track">
                      <div
                        className={`status-progress__bar ${seg.cls}`}
                        style={{
                          width: `${(seg.count / maxSegment) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card section-card">
              <div className="card__header">
                <div className="card__title">
                Atalhos
                </div>
              </div>
              <div className="card__body shortcut-grid">
                {shortcuts.map((s) => (
                  <button
                    key={s.label}
                    className="btn btn--ghost shortcut"
                    onClick={() => navigate(s.to)}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card__header">
                <div className="card__title">Pedidos recentes</div>
              </div>

              {data.recentOrders.length === 0 ? (
                <EmptyState
                  icon={<IconOrders size={26} />}
                  title="Nenhum pedido realizado ainda"
                  description="Os pedidos aparecerão aqui assim que forem criados."
                />
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Pedido</th>
                        <th>Cliente</th>
                        <th>Status</th>
                        <th>Valor</th>
                        <th>Data</th>
                        <th style={{ textAlign: 'right' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="cell-strong">#{order.id.slice(0, 8)}</td>
                          <td>
                            <div className="cell-strong">{order.user.name}</div>
                            <div className="cell-muted">{order.user.email}</div>
                          </td>
                          <td>
                            <StatusBadge status={order.status as never} />
                          </td>
                          <td className="cell-amount">{formatCurrency(order.totalValue)}</td>
                          <td className="cell-muted">{formatDate(order.createdAt)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn--ghost btn--sm"
                              onClick={() => navigate(`/admin/orders/${order.id}`)}
                            >
                              <IconEye size={16} /> Detalhes
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )
      )}
    </AdminLayout>
  );
}
