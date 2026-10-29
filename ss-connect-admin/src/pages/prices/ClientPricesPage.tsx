import { useCallback, useEffect, useState } from 'react';
import { api, ApiClientError } from '../../services/api';
import type { Product, Package, AdminUsersResponse, ProductsResponse, PackagesResponse } from '../../types';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { PageHeader } from '../../components/PageHeader';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { FormField } from '../../components/FormField';
import { LoadingState, EmptyState, ErrorState, ActiveBadge } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { IconInbox, IconChevronLeft, IconChevronRight } from '../../components/icons';
import { formatCurrency } from '../../utils/format';

type ActiveFilter = 'all' | 'true' | 'false';

interface ClientPriceForm {
  userId: string;
  productId: string;
  packageId: string;
  price: string;
}

export interface ClientProductPrice {
  id: string;
  userId: string;
  productId: string;
  packageId: string;
  price: number;
  unit: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    username: string | null;
  };
  product: {
    id: string;
    name: string;
  };
  package: {
    id: string;
    name: string;
    type: string;
  };
}

export interface ClientProductPricesResponse {
  data: ClientProductPrice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function ClientPricesPage() {
  const { showToast } = useToast();
  const [prices, setPrices] = useState<ClientProductPrice[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [users, setUsers] = useState<Array<{ id: string; name: string; username: string | null }>>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);

  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState('');
  const [productId, setProductId] = useState('');
  const [packageId, setPackageId] = useState('');
  const [active, setActive] = useState<ActiveFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClientProductPrice | null>(null);
  const [form, setForm] = useState<ClientPriceForm>({ userId: '', productId: '', packageId: '', price: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [confirm, setConfirm] = useState<{ price: ClientProductPrice; activate: boolean } | null>(null);
  const [toggling, setToggling] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<ClientProductPrice | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(
    async (page: number) => {
      setLoading(true);
      setError(null);
      setDeleteConfirm(null);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(pagination.limit));
        if (search) params.set('search', search);
        if (userId) params.set('userId', userId);
        if (productId) params.set('productId', productId);
        if (packageId) params.set('packageId', packageId);
        if (active !== 'all') params.set('active', active);
        const res = await api.get<ClientProductPricesResponse>(`/admin/client-product-prices?${params.toString()}`);
        setPrices(res.data);
        setPagination(res.pagination);
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 401) {
          setError('Sessão expirada. Faça login novamente.');
        } else {
          setError(err instanceof Error ? err.message : 'Erro ao carregar preços.');
        }
      } finally {
        setLoading(false);
        setDeleting(false);
      }
    },
    [search, userId, productId, packageId, active, pagination.limit]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  useEffect(() => {
    api
      .get<AdminUsersResponse>('/admin/users?limit=200')
      .then((r) => setUsers(r.data))
      .catch((err) => {
        console.error('Erro ao carregar usuários:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar usuários.');
      });
    api
      .get<ProductsResponse>('/admin/products?limit=200')
      .then((r) => setProducts(r.data))
      .catch((err) => {
        console.error('Erro ao carregar produtos:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar produtos.');
      });
    api
      .get<PackagesResponse>('/admin/packages?limit=200')
      .then((r) => setPackages(r.data))
      .catch((err) => {
        console.error('Erro ao carregar embalagens:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar embalagens.');
      });
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ userId: '', productId: '', packageId: '', price: '' });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (price: ClientProductPrice) => {
    setEditing(price);
    setForm({
      userId: price.userId,
      productId: price.productId,
      packageId: price.packageId,
      price: String(price.price),
    });
    setFormError(null);
    setModalOpen(true);
  };

  const submitForm = async () => {
    if (!form.userId) {
      setFormError('Selecione o cliente.');
      return;
    }
    if (!form.productId) {
      setFormError('Selecione o produto.');
      return;
    }
    if (!form.packageId) {
      setFormError('Selecione a embalagem.');
      return;
    }
    const value = Number(form.price);
    if (!form.price || Number.isNaN(value) || value <= 0) {
      setFormError('Informe um preço maior que zero.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
       if (editing) {
         await api.put(`/admin/client-product-prices/${editing.id}`, {
           userId: form.userId,
           productId: form.productId,
           packageId: form.packageId,
           price: value,
           unit: 'litro',
         });
         showToast('Preço atualizado com sucesso.');
       } else {
         await api.post('/admin/client-product-prices', {
           userId: form.userId,
           productId: form.productId,
           packageId: form.packageId,
           price: value,
           unit: 'litro',
         });
         showToast('Preço criado com sucesso.');
       }
      setModalOpen(false);
      load(pagination.page);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 409) {
        setFormError(err.message || 'Já existe um preço para esta combinação de cliente, produto e embalagem.');
      } else {
        setFormError(err instanceof Error ? err.message : 'Erro ao salvar preço.');
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmToggle = async () => {
    if (!confirm) return;
    setToggling(true);
    try {
      await api.patch(`/admin/client-product-prices/${confirm.price.id}/active`, {
        active: confirm.activate,
      });
      showToast(confirm.activate ? 'Preço ativado com sucesso.' : 'Preço desativado com sucesso.');
      setConfirm(null);
      load(pagination.page);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao alterar status.', 'error');
    } finally {
      setToggling(false);
    }
  };

  const handleFilter = () => load(1);

  const handleDelete = async (_price: ClientProductPrice) => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/client-product-prices/${deleteConfirm.id}`);
      showToast('Preço excluído com sucesso.');
      setDeleteConfirm(null);
      load(pagination.page);
    } catch (err) {
      if (err instanceof ApiClientError) {
        showToast(err.message || 'Erro ao excluir preço.', 'error');
      } else {
        showToast(err instanceof Error ? err.message : 'Erro ao excluir preço.', 'error');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout title="Preços por Cliente" subtitle="Gerencie os preços específicos por cliente, produto e embalagem">
      <PageHeader
        title="Preços por Cliente"
        subtitle={`${pagination.total} preço(s) cadastrado(s)`}
        action={
          <button className="btn btn--primary" onClick={openCreate}>
            + Novo preço
          </button>
        }
      />

      <div className="card">
        <div className="card__header">
          <div className="card__title">Tabela de preços por cliente</div>
          <div className="filter-bar">
            <div className="field" style={{ minWidth: 160 }}>
              <label className="field__label" htmlFor="clientprices-search">Buscar</label>
              <input
                id="clientprices-search"
                className="input"
                placeholder="Cliente, produto ou embalagem"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              />
            </div>
            <div className="field" style={{ minWidth: 150 }}>
              <label className="field__label" htmlFor="clientprices-user">Cliente</label>
              <select id="clientprices-user" className="select" value={userId} onChange={(e) => setUserId(e.target.value)}>
                <option value="">Todos</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ minWidth: 150 }}>
              <label className="field__label" htmlFor="clientprices-product">Produto</label>
              <select id="clientprices-product" className="select" value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">Todos</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ minWidth: 150 }}>
              <label className="field__label" htmlFor="clientprices-package">Embalagem</label>
              <select id="clientprices-package" className="select" value={packageId} onChange={(e) => setPackageId(e.target.value)}>
                <option value="">Todas</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ minWidth: 130 }}>
              <label className="field__label" htmlFor="clientprices-status">Status</label>
              <select
                id="clientprices-status"
                className="select"
                value={active}
                onChange={(e) => setActive(e.target.value as ActiveFilter)}
              >
                <option value="all">Todos</option>
                <option value="true">Ativos</option>
                <option value="false">Inativos</option>
              </select>
            </div>
            <button className="btn btn--primary" onClick={handleFilter}>
              Filtrar
            </button>
          </div>
        </div>

        <div style={{ padding: '12px 16px', background: '#f6f8fa', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 16, fontSize: 14, color: '#374151' }}>
          <strong>Regra de prioridade:</strong> preços específicos do cliente têm prioridade sobre os preços padrão. Se não houver preço específico nem preço padrão ativo para a combinação produto/embalagem, a compra será bloqueada com a mensagem "Preço indisponível para esta embalagem".
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={() => load(pagination.page)} />
        ) : prices.length === 0 ? (
          <EmptyState
            icon={<IconInbox size={26} />}
            title="Nenhum preço encontrado"
            description="Crie um novo preço específico para um cliente, produto e embalagem."
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Produto</th>
                    <th>Embalagem</th>
                    <th>Preço</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((price) => (
                    <tr key={price.id}>
                      <td className="cell-strong">{price.user.name}</td>
                      <td>{price.product.name}</td>
                      <td>{price.package.name}</td>
                      <td className="cell-amount">{formatCurrency(price.price)}</td>
                      <td>
                        <ActiveBadge active={price.active} />
                      </td>
                      <td className="table__actions-cell">
                        <div className="action-group">
                          <button className="btn btn--ghost btn--sm" onClick={() => openEdit(price)}>
                            Editar
                          </button>
                          {price.active ? (
                            <button
                              className="btn btn--ghost btn--sm"
                              onClick={() => setConfirm({ price, activate: false })}
                            >
                              Desativar
                            </button>
                          ) : (
                            <button
                              className="btn btn--success btn--sm"
                              onClick={() => setConfirm({ price, activate: true })}
                            >
                              Ativar
                            </button>
                          )}
                          <button
                            className="btn btn--danger btn--sm"
                            onClick={() => setDeleteConfirm(price)}
                          >
                            Excluir
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
                Página {pagination.page} de {pagination.totalPages} · {pagination.total} preços
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

      {modalOpen && (
        <Modal
          title={editing ? 'Editar preço do cliente' : 'Novo preço do cliente'}
          onClose={() => !saving && setModalOpen(false)}
          footer={
            <>
              <button className="btn btn--ghost" onClick={() => setModalOpen(false)} disabled={saving}>
                Cancelar
              </button>
              <button className="btn btn--primary" onClick={submitForm} disabled={saving}>
                {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar preço'}
              </button>
            </>
          }
        >
          {formError && (
            <div className="alert alert--error form-alert" role="alert">
              {formError}
            </div>
          )}
          <FormField label="Cliente" htmlFor="clientprice-user" required>
            <select
              id="clientprice-user"
              className="select"
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              required
            >
              <option value="">Selecione o cliente</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.username ? `(${u.username})` : ''}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Produto" htmlFor="clientprice-product" required>
            <select
              id="clientprice-product"
              className="select"
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              required
            >
              <option value="">Selecione o produto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Embalagem" htmlFor="clientprice-package" required>
            <select
              id="clientprice-package"
              className="select"
              value={form.packageId}
              onChange={(e) => setForm({ ...form, packageId: e.target.value })}
              required
            >
              <option value="">Selecione a embalagem</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Preço (R$)" htmlFor="clientprice-value" required>
            <input
              id="clientprice-value"
              className="input"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0,00"
              required
            />
          </FormField>
        </Modal>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.activate ? 'Ativar preço' : 'Desativar preço'}
        message={
          confirm
            ? `Deseja ${confirm.activate ? 'ativar' : 'desativar'} o preço de "${confirm.price.user.name}" — ${confirm.price.product.name} (${confirm.price.package.name})?`
            : ''
        }
        confirmLabel={confirm?.activate ? 'Ativar' : 'Desativar'}
        danger={!confirm?.activate}
        loading={toggling}
        onConfirm={confirmToggle}
        onCancel={() => !toggling && setConfirm(null)}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Excluir preço"
        message={
          deleteConfirm
            ? `Tem certeza que deseja excluir o preço de "${deleteConfirm.user.name}" — ${deleteConfirm.product.name} (${deleteConfirm.package.name})? Esta ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Excluir"
        danger={true}
        loading={deleting}
        onConfirm={() => handleDelete(deleteConfirm!)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </AdminLayout>
  );
}
