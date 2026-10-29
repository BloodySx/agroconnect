import { useCallback, useEffect, useState } from 'react';
import { api, ApiClientError } from '../../services/api';
import type { Product, ProductsResponse } from '../../types';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { PageHeader } from '../../components/PageHeader';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { FormField } from '../../components/FormField';
import { LoadingState, EmptyState, ErrorState, ActiveBadge } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { IconInbox, IconChevronLeft, IconChevronRight } from '../../components/icons';

type ActiveFilter = 'all' | 'true' | 'false';

interface ProductForm {
  name: string;
  code: string;
}

export function ProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [search, setSearch] = useState('');
  const [active, setActive] = useState<ActiveFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>({ name: '', code: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [confirm, setConfirm] = useState<{ product: Product; activate: boolean } | null>(null);
  const [toggling, setToggling] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
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
        if (active !== 'all') params.set('active', active);
        const res = await api.get<ProductsResponse>(`/admin/products?${params.toString()}`);
        setProducts(res.data);
        setPagination(res.pagination);
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 401) {
          setError('Sessão expirada. Faça login novamente.');
        } else {
          setError(err instanceof Error ? err.message : 'Erro ao carregar produtos.');
        }
      } finally {
        setLoading(false);
        setDeleting(false);
      }
    },
    [search, active, pagination.limit]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', code: '' });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({ name: product.name, code: product.code });
    setFormError(null);
    setModalOpen(true);
  };

  const submitForm = async () => {
    if (!form.name.trim()) {
      setFormError('O nome é obrigatório.');
      return;
    }
    if (!form.code.trim()) {
      setFormError('O código é obrigatório.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await api.put(`/admin/products/${editing.id}`, {
          name: form.name.trim(),
          code: form.code.trim(),
        });
        showToast('Produto atualizado com sucesso.');
      } else {
        await api.post('/admin/products', {
          name: form.name.trim(),
          code: form.code.trim(),
        });
        showToast('Produto criado com sucesso.');
      }
      setModalOpen(false);
      load(pagination.page);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 409) {
        setFormError(err.message || 'Já existe um produto com este código.');
      } else {
        setFormError(err instanceof Error ? err.message : 'Erro ao salvar produto.');
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmToggle = async () => {
    if (!confirm) return;
    setToggling(true);
    try {
      await api.patch(`/admin/products/${confirm.product.id}/active`, {
        active: confirm.activate,
      });
      showToast(
        confirm.activate ? 'Produto ativado com sucesso.' : 'Produto desativado com sucesso.'
      );
      setConfirm(null);
      load(pagination.page);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao alterar status.', 'error');
    } finally {
      setToggling(false);
    }
  };

  const handleFilter = () => load(1);

  const handleDelete = async (_product: Product) => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/products/${deleteConfirm.id}`);
      showToast('Produto excluído com sucesso.');
      setDeleteConfirm(null);
      load(pagination.page);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 409) {
          showToast('Não é possível excluir este produto pois ele possui preços ou itens de pedido associados.', 'error');
        } else if (err.status === 404) {
          showToast('Produto não encontrado.', 'error');
        } else {
          showToast(err.message || 'Erro ao excluir produto.', 'error');
        }
      } else {
        showToast(err instanceof Error ? err.message : 'Erro ao excluir produto.', 'error');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout title="Produtos" subtitle="Gerencie o catálogo de produtos do AgroConnect">
      <PageHeader
        title="Catálogo de produtos"
        subtitle={`${pagination.total} produto(s) cadastrado(s)`}
        action={
          <button className="btn btn--primary" onClick={openCreate}>
            + Novo produto
          </button>
        }
      />

      <div className="card">
        <div className="card__header">
          <div className="card__title">Produtos cadastrados</div>
          <div className="filter-bar">
            <div className="field" style={{ minWidth: 200 }}>
              <label className="field__label" htmlFor="products-search">Buscar</label>
              <input
                id="products-search"
                className="input"
                placeholder="Buscar por nome ou código"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              />
            </div>
            <div className="field" style={{ minWidth: 150 }}>
              <label className="field__label" htmlFor="products-status">Status</label>
              <select
                id="products-status"
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

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={() => load(pagination.page)} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<IconInbox size={26} />}
            title="Nenhum produto encontrado"
            description="Crie um novo produto ou ajuste os filtros."
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Preços</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
{products.map((product) => (
                     <tr key={product.id}>
                       <td className="cell-strong">{product.code}</td>
                       <td>{product.name}</td>
                       <td>{product._count?.prices ?? 0}</td>
                       <td>
                         <ActiveBadge active={product.active} />
                       </td>
                       <td className="table__actions-cell">
                         <div className="action-group">
                           <button className="btn btn--ghost btn--sm" onClick={() => openEdit(product)}>
                             Editar
                           </button>
                           {product.active ? (
                             <button
                               className="btn btn--ghost btn--sm"
                               onClick={() => setConfirm({ product, activate: false })}
                             >
                               Desativar
                             </button>
                           ) : (
                             <button
                               className="btn btn--success btn--sm"
                               onClick={() => setConfirm({ product, activate: true })}
                             >
                               Ativar
                             </button>
                           )}
                           <button
                             className="btn btn--danger btn--sm"
                             onClick={() => setDeleteConfirm(product)}
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
                Página {pagination.page} de {pagination.totalPages} · {pagination.total} produtos
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
          title={editing ? 'Editar produto' : 'Novo produto'}
          onClose={() => !saving && setModalOpen(false)}
          footer={
            <>
              <button className="btn btn--ghost" onClick={() => setModalOpen(false)} disabled={saving}>
                Cancelar
              </button>
              <button className="btn btn--primary" onClick={submitForm} disabled={saving}>
                {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar produto'}
              </button>
            </>
          }
        >
          {formError && (
            <div className="alert alert--error form-alert" role="alert">
              {formError}
            </div>
          )}
          <FormField label="Nome" htmlFor="product-name" required>
            <input
              id="product-name"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex.: Cimento CP II"
              required
            />
          </FormField>
          <FormField label="Código" htmlFor="product-code" required>
            <input
              id="product-code"
              className="input"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="Ex.: CIM-001"
              required
            />
          </FormField>
        </Modal>
      )}

<ConfirmDialog
         open={!!confirm}
         title={confirm?.activate ? 'Ativar produto' : 'Desativar produto'}
         message={
           confirm
             ? `Deseja ${confirm.activate ? 'ativar' : 'desativar'} o produto "${confirm.product.name}"?`
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
         title="Excluir produto"
         message={
           deleteConfirm
             ? `Tem certeza que deseja excluir o produto "${deleteConfirm.name}"? Esta ação não pode ser desfeita.`
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
