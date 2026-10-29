import { useCallback, useEffect, useState } from 'react';
import { api, ApiClientError } from '../../services/api';
import type { ProductPrice, ProductPricesResponse, Product, Package, ProductsResponse, PackagesResponse } from '../../types';
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

interface PriceForm {
  productId: string;
  packageId: string;
  price: string;
}

export function PricesPage() {
  const { showToast } = useToast();
  const [prices, setPrices] = useState<ProductPrice[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);

  const [search, setSearch] = useState('');
  const [productId, setProductId] = useState('');
  const [packageId, setPackageId] = useState('');
  const [active, setActive] = useState<ActiveFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductPrice | null>(null);
  const [form, setForm] = useState<PriceForm>({ productId: '', packageId: '', price: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [confirm, setConfirm] = useState<{ price: ProductPrice; activate: boolean } | null>(null);
  const [toggling, setToggling] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<ProductPrice | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(
    async (page: number) => {
      setLoading(true);
      setError(null);
      setDeleteConfirm(null); // Reset delete confirmation when reloading
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(pagination.limit));
        if (search) params.set('search', search);
        if (productId) params.set('productId', productId);
        if (packageId) params.set('packageId', packageId);
        if (active !== 'all') params.set('active', active);
        const res = await api.get<ProductPricesResponse>(`/admin/product-prices?${params.toString()}`);
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
    [search, productId, packageId, active, pagination.limit]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  useEffect(() => {
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
    setForm({ productId: '', packageId: '', price: '' });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (price: ProductPrice) => {
    setEditing(price);
    setForm({
      productId: price.productId,
      packageId: price.packageId,
      price: String(price.price),
    });
    setFormError(null);
    setModalOpen(true);
  };

  const submitForm = async () => {
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
        await api.put(`/admin/product-prices/${editing.id}`, {
          productId: form.productId,
          packageId: form.packageId,
          price: value,
          unit: 'litro',
        });
        showToast('Preço atualizado com sucesso.');
      } else {
        await api.post('/admin/product-prices', {
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
        setFormError(err.message || 'Já existe um preço para esta combinação de produto e embalagem.');
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
      await api.patch(`/admin/product-prices/${confirm.price.id}/active`, {
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

  const handleDelete = async (_price: ProductPrice) => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/product-prices/${deleteConfirm.id}`);
      showToast('Preço excluído com sucesso.');
      setDeleteConfirm(null);
      load(pagination.page);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 409) {
          showToast('Não é possível excluir este preço pois ele possui itens de pedido associados.', 'error');
        } else if (err.status === 404) {
          showToast('Preço não encontrado.', 'error');
        } else {
          showToast(err.message || 'Erro ao excluir preço.', 'error');
        }
      } else {
        showToast(err instanceof Error ? err.message : 'Erro ao excluir preço.', 'error');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout title="Preços" subtitle="Gerencie os preços por produto e embalagem">
      <PageHeader
        title="Preços"
        subtitle={`${pagination.total} preço(s) cadastrado(s)`}
        action={
          <button className="btn btn--primary" onClick={openCreate}>
            + Novo preço
          </button>
        }
      />

      <div className="card">
        <div className="card__header">
          <div className="card__title">Tabela de preços</div>
          <div className="filter-bar">
            <div className="field" style={{ minWidth: 180 }}>
              <label className="field__label" htmlFor="prices-search">Buscar</label>
              <input
                id="prices-search"
                className="input"
                placeholder="Buscar produto/embalagem"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              />
            </div>
            <div className="field" style={{ minWidth: 160 }}>
              <label className="field__label" htmlFor="prices-product">Produto</label>
              <select id="prices-product" className="select" value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">Todos os produtos</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ minWidth: 160 }}>
              <label className="field__label" htmlFor="prices-package">Embalagem</label>
              <select id="prices-package" className="select" value={packageId} onChange={(e) => setPackageId(e.target.value)}>
                <option value="">Todas as embalagens</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ minWidth: 140 }}>
              <label className="field__label" htmlFor="prices-status">Status</label>
              <select
                id="prices-status"
                className="select"
                value={active}
                onChange={(e) => setActive(e.target.value as ActiveFilter)}
              >
                <option value="all">Todos os status</option>
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
          <strong>Tabela de preços padrão:</strong> estes preços são usados como fallback quando não há preço específico do cliente. Eles têm menor prioridade que os preços por cliente e são usados apenas quando não há preço específico ativo para a combinação produto/embalagem.
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={() => load(pagination.page)} />
        ) : prices.length === 0 ? (
          <EmptyState
            icon={<IconInbox size={26} />}
            title="Nenhum preço encontrado"
            description="Crie um novo preço para um produto e embalagem."
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
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
                       <td className="cell-strong">{price.product.name}</td>
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
          title={editing ? 'Editar preço' : 'Novo preço'}
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
          <FormField label="Produto" htmlFor="price-product" required>
            <select
              id="price-product"
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
          <FormField label="Embalagem" htmlFor="price-package" required>
            <select
              id="price-package"
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
          <FormField label="Preço (R$)" htmlFor="price-value" required>
            <input
              id="price-value"
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
             ? `Deseja ${confirm.activate ? 'ativar' : 'desativar'} o preço de "${confirm.price.product.name}" (${confirm.price.package.name})?`
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
             ? `Tem certeza que deseja excluir o preço de "${deleteConfirm.product.name}" (${deleteConfirm.package.name})? Esta ação não pode ser desfeita.`
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
