import { useCallback, useEffect, useState } from 'react';
import { api, ApiClientError } from '../../services/api';
import type { Package, PackagesResponse } from '../../types';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { PageHeader } from '../../components/PageHeader';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { FormField } from '../../components/FormField';
import { LoadingState, EmptyState, ErrorState, ActiveBadge } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { IconInbox, IconChevronLeft, IconChevronRight } from '../../components/icons';

type ActiveFilter = 'all' | 'true' | 'false';
type PackageCategory = 'FIXED' | 'SACHET' | 'OTHER';

interface PackageForm {
  name: string;
  category: PackageCategory;
  type: string;
  capacityValue: string;
  capacityUnit: 'L' | 'mL' | 'kg';
  active: boolean;
}

const CATEGORY_OPTIONS: { value: PackageCategory; label: string }[] = [
  { value: 'FIXED', label: 'Capacidade fixa' },
  { value: 'SACHET', label: 'Sachê' },
  { value: 'OTHER', label: 'Outro' },
];

const UNIT_OPTIONS = [
  { value: 'L', label: 'L' },
  { value: 'mL', label: 'mL' },
];

function generatePackageType(category: PackageCategory, name: string, capacityValue: string, capacityUnit: string): string {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  if (category === 'SACHET') {
    return 'SACHE';
  }

  if (category === 'FIXED' && capacityValue) {
    return `${normalized}_${capacityValue}${capacityUnit}`;
  }

  return normalized || 'OUTRA';
}

function buildCapacity(category: PackageCategory, capacityValue: string, capacityUnit: string): string {
  if (category === 'SACHET') {
    return 'Variável por produto';
  }
  if (category === 'FIXED' && capacityValue) {
    return `${capacityValue} ${capacityUnit}`;
  }
  return '';
}

export function PackagesPage() {
  const { showToast } = useToast();
  const [packages, setPackages] = useState<Package[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [search, setSearch] = useState('');
  const [active, setActive] = useState<ActiveFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [form, setForm] = useState<PackageForm>({
    name: '',
    category: 'FIXED',
    type: '',
    capacityValue: '',
    capacityUnit: 'L',
    active: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [confirm, setConfirm] = useState<{ pkg: Package; activate: boolean } | null>(null);
  const [toggling, setToggling] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<Package | null>(null);
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
        if (active !== 'all') params.set('active', active);
        const res = await api.get<PackagesResponse>(`/admin/packages?${params.toString()}`);
        setPackages(res.data);
        setPagination(res.pagination);
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 401) {
          setError('Sessão expirada. Faça login novamente.');
        } else {
          setError(err instanceof Error ? err.message : 'Erro ao carregar embalagens.');
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
    setForm({ name: '', category: 'FIXED', type: '', capacityValue: '', capacityUnit: 'L', active: true });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (pkg: Package) => {
    setEditing(pkg);
    const isSachet = pkg.type === 'SACHÊ' || pkg.type === 'SACHE';
    setForm({
      name: pkg.name,
      category: isSachet ? 'SACHET' : 'FIXED',
      type: pkg.type,
      capacityValue: '',
      capacityUnit: 'L',
      active: pkg.active,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const generatedType = generatePackageType(form.category, form.name, form.capacityValue, form.capacityUnit);
  const capacityLabel = form.category === 'SACHET' ? 'Volume definido por produto' : buildCapacity(form.category, form.capacityValue, form.capacityUnit);
  const isValid = form.name.trim() && generatedType && (form.category !== 'FIXED' || (form.capacityValue && Number(form.capacityValue) > 0));

  const submitForm = async () => {
    if (!form.name.trim()) {
      setFormError('O nome é obrigatório.');
      return;
    }
    if (!generatedType) {
      setFormError('Tipo inválido.');
      return;
    }
    if (form.category === 'FIXED' && (!form.capacityValue || Number(form.capacityValue) <= 0)) {
      setFormError('Capacidade deve ser um número positivo.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const payload: any = {
        name: form.name.trim(),
        type: generatedType,
        active: form.active,
      };

      if (form.category !== 'SACHET') {
        payload.capacity = capacityLabel;
        payload.capacityLiters = form.category === 'FIXED' ? Number(form.capacityValue) : null;
      } else {
        payload.capacity = 'Variável por produto';
        payload.capacityLiters = null;
      }

      if (editing) {
        await api.put(`/admin/packages/${editing.id}`, payload);
        showToast('Embalagem atualizada com sucesso.');
      } else {
        await api.post('/admin/packages', payload);
        showToast('Embalagem criada com sucesso.');
      }
      setModalOpen(false);
      load(pagination.page);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 409) {
        setFormError(err.message || 'Já existe uma embalagem com este tipo.');
      } else {
        setFormError(err instanceof Error ? err.message : 'Erro ao salvar embalagem.');
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmToggle = async () => {
    if (!confirm) return;
    setToggling(true);
    try {
      await api.patch(`/admin/packages/${confirm.pkg.id}/active`, {
        active: confirm.activate,
      });
      showToast(
        confirm.activate ? 'Embalagem ativada com sucesso.' : 'Embalagem desativada com sucesso.'
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

  const handleDelete = async (_pkg: Package) => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/packages/${deleteConfirm.id}`);
      showToast('Embalagem excluída com sucesso.');
      setDeleteConfirm(null);
      load(pagination.page);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 409) {
          showToast('Não é possível excluir esta embalagem pois ela possui preços ou itens de pedido associados.', 'error');
        } else if (err.status === 404) {
          showToast('Embalagem não encontrada.', 'error');
        } else {
          showToast(err.message || 'Erro ao excluir embalagem.', 'error');
        }
      } else {
        showToast(err instanceof Error ? err.message : 'Erro ao excluir embalagem.', 'error');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout title="Embalagens" subtitle="Gerencie as embalagens disponíveis no AgroConnect">
      <PageHeader
        title="Embalagens"
        subtitle={`${pagination.total} embalagem(ns) cadastrada(s)`}
        action={
          <button className="btn btn--primary" onClick={openCreate}>
            + Nova embalagem
          </button>
        }
      />

      <div className="card">
        <div className="card__header">
          <div className="card__title">Lista de embalagens</div>
          <div className="filter-bar">
            <div className="field" style={{ minWidth: 200 }}>
              <label className="field__label" htmlFor="packages-search">Buscar</label>
              <input
                id="packages-search"
                className="input"
                placeholder="Buscar por nome ou tipo"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              />
            </div>
            <div className="field" style={{ minWidth: 150 }}>
              <label className="field__label" htmlFor="packages-status">Status</label>
              <select
                id="packages-status"
                className="select"
                value={active}
                onChange={(e) => setActive(e.target.value as ActiveFilter)}
              >
                <option value="all">Todos os status</option>
                <option value="true">Ativas</option>
                <option value="false">Inativas</option>
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
        ) : packages.length === 0 ? (
          <EmptyState
            icon={<IconInbox size={26} />}
            title="Nenhuma embalagem encontrada"
            description="Crie uma nova embalagem ou ajuste os filtros."
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Capacidade</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => (
                    <tr key={pkg.id}>
                      <td className="cell-strong">{pkg.name}</td>
                      <td>{pkg.type}</td>
                      <td className="cell-muted">{pkg.capacity}</td>
                      <td>
                        <ActiveBadge active={pkg.active} />
                      </td>
                      <td className="table__actions-cell">
                        <div className="action-group">
                          <button className="btn btn--ghost btn--sm" onClick={() => openEdit(pkg)}>
                            Editar
                          </button>
                          {pkg.active ? (
                            <button
                              className="btn btn--ghost btn--sm"
                              onClick={() => setConfirm({ pkg, activate: false })}
                            >
                              Desativar
                            </button>
                          ) : (
                            <button
                              className="btn btn--success btn--sm"
                              onClick={() => setConfirm({ pkg, activate: true })}
                            >
                              Ativar
                            </button>
                          )}
                          <button
                            className="btn btn--danger btn--sm"
                            onClick={() => setDeleteConfirm(pkg)}
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
                Página {pagination.page} de {pagination.totalPages} · {pagination.total} embalagens
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
          title={editing ? 'Editar embalagem' : 'Nova embalagem'}
          onClose={() => !saving && setModalOpen(false)}
          footer={
            <>
              <button className="btn btn--ghost" onClick={() => setModalOpen(false)} disabled={saving}>
                Cancelar
              </button>
              <button className="btn btn--primary" onClick={submitForm} disabled={saving || !isValid}>
                {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar embalagem'}
              </button>
            </>
          }
        >
          {formError && (
            <div className="alert alert--error form-alert" role="alert">
              {formError}
            </div>
          )}
          <FormField label="Nome" htmlFor="package-name" required>
            <input
              id="package-name"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex.: Frasco"
              required
            />
          </FormField>
          <FormField label="Categoria" htmlFor="package-category" required>
            <select
              id="package-category"
              className="select"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as PackageCategory })}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
          {form.category !== 'SACHET' && (
            <div className="field">
              <label className="field__label" htmlFor="package-capacity-value">Capacidade (número)</label>
              <input
                id="package-capacity-value"
                className="input"
                type="number"
                min="0"
                step="any"
                value={form.capacityValue}
                onChange={(e) => setForm({ ...form, capacityValue: e.target.value })}
                placeholder="Ex.: 1000"
                required={form.category === 'FIXED'}
              />
            </div>
          )}
          {form.category !== 'SACHET' && (
            <div className="field">
              <label className="field__label" htmlFor="package-capacity-unit">Unidade</label>
              <select
                id="package-capacity-unit"
                className="select"
                value={form.capacityUnit}
                onChange={(e) => setForm({ ...form, capacityUnit: e.target.value as 'L' | 'mL' | 'kg' })}
              >
                {UNIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {form.category === 'SACHET' && (
            <div className="alert alert--info form-alert" role="alert">
              Volume definido por produto. O valor em litros será configurado em cada produto pelo campo “Caixa de Sachê”.
            </div>
          )}
          <FormField label="Identificador" htmlFor="package-type" required>
            <input
              id="package-type"
              className="input"
              value={generatedType}
              readOnly
              required
            />
          </FormField>
          <div className="field">
            <label className="field__label">Pré-visualização</label>
            <div className="input input--readonly" aria-readonly="true">
              {form.name || 'Nome da embalagem'} — {capacityLabel || 'Capacidade não definida'}
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.activate ? 'Ativar embalagem' : 'Desativar embalagem'}
        message={
          confirm
            ? `Deseja ${confirm.activate ? 'ativar' : 'desativar'} a embalagem "${confirm.pkg.name}"?`
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
        title="Excluir embalagem"
        message={
          deleteConfirm
            ? `Tem certeza que deseja excluir a embalagem "${deleteConfirm.name}"? Esta ação não pode ser desfeita.`
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