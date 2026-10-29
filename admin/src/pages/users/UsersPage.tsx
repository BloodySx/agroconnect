import { useCallback, useEffect, useState } from 'react';
import { api, ApiClientError } from '../../services/api';
import type { AdminUser, AdminUsersResponse, UserForm } from '../../types';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { PageHeader } from '../../components/PageHeader';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { UserForm as UserFormComponent } from '../../components/UserForm';
import { LoadingState, EmptyState, ErrorState, ActiveBadge } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { getStoredUser } from '../../store/auth';
import { IconInbox, IconChevronLeft, IconChevronRight } from '../../components/icons';
import { formatDate } from '../../utils/format';

type ActiveFilter = 'all' | 'true' | 'false';
type RoleFilter = 'all' | 'USER' | 'ADMIN';

function RoleBadge({ role }: { role: 'USER' | 'ADMIN' }) {
  const cls = role === 'ADMIN' ? 'badge--confirmed' : 'badge--neutral';
  return (
    <span className={`badge ${cls}`}>
      <span className="badge__dot" />
      {role}
    </span>
  );
}

export function UsersPage() {
  const { showToast } = useToast();
  const currentUser = getStoredUser();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [search, setSearch] = useState('');
  const [role, setRole] = useState<RoleFilter>('all');
  const [active, setActive] = useState<ActiveFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const [detail, setDetail] = useState<AdminUser | null>(null);
   const [confirm, setConfirm] = useState<
     | { type: 'activate'; user: AdminUser }
     | { type: 'deactivate'; user: AdminUser }
     | { type: 'role'; user: AdminUser; role: 'USER' | 'ADMIN' }
     | null
   >(null);
   const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null);
   const [deleting, setDeleting] = useState(false);
   const [acting, setActing] = useState(false);
const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
    const [createUserForm, setCreateUserForm] = useState<UserForm>({ name: '', username: '', password: '', role: 'USER', active: true });
    const [createUserError, setCreateUserError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);

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
        if (role !== 'all') params.set('role', role);
        if (active !== 'all') params.set('active', active);
        const res = await api.get<AdminUsersResponse>(`/admin/users?${params.toString()}`);
        setUsers(res.data);
        setPagination(res.pagination);
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 401) {
          setError('Sessão expirada. Faça login novamente.');
        } else {
          setError(err instanceof Error ? err.message : 'Erro ao carregar usuários.');
        }
      } finally {
        setLoading(false);
        setDeleting(false);
      }
    },
    [search, role, active, pagination.limit]
  );

  useEffect(() => {
    load(1);
  }, [load]);

const isSelf = (id: string) => currentUser?.id === id;

   const confirmAction = async () => {
     if (!confirm) return;
     setActing(true);
     try {
       if (confirm.type === 'role') {
         await api.patch(`/admin/users/${confirm.user.id}/role`, { role: confirm.role });
         showToast(`Função alterada para ${confirm.role} com sucesso.`);
       } else {
         const activeValue = confirm.type === 'activate';
         await api.patch(`/admin/users/${confirm.user.id}/active`, { active: activeValue });
         showToast(activeValue ? 'Usuário ativado com sucesso.' : 'Usuário desativado com sucesso.');
       }
       setConfirm(null);
       load(pagination.page);
     } catch (err) {
       if (err instanceof ApiClientError && err.status === 409) {
         showToast(err.message || 'Operação não permitida.', 'error');
       } else {
         showToast(err instanceof Error ? err.message : 'Erro ao executar ação.', 'error');
       }
     } finally {
       setActing(false);
     }
   };

   const handleFilter = () => load(1);

const openCreateUser = () => {
    setCreateUserForm({ name: '', username: '', password: '', role: 'USER', active: true });
    setCreateUserError(null);
    setCreateUserModalOpen(true);
  };

const handleCreateUserSubmit = async () => {
    if (!createUserForm.name.trim()) {
      setCreateUserError('O nome é obrigatório.');
      return;
    }
    if (!createUserForm.username.trim()) {
      setCreateUserError('O usuário é obrigatório.');
      return;
    }
    if (!createUserForm.password) {
      setCreateUserError('A senha é obrigatória.');
      return;
    }
    setCreating(true);
    setCreateUserError(null);
    try {
      const payload: Record<string, string | boolean> = {
        name: createUserForm.name.trim(),
        username: createUserForm.username.trim().toLowerCase(),
        password: createUserForm.password,
        role: createUserForm.role,
        active: createUserForm.active,
      };
      await api.post('/admin/users', payload);
      showToast('Usuário criado com sucesso.');
      setCreateUserModalOpen(false);
      load(pagination.page);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 409) {
          setCreateUserError(err.message || 'Usuário já está em uso.');
        } else {
          setCreateUserError(err.message || 'Erro ao criar usuário.');
        }
      } else {
        setCreateUserError(err instanceof Error ? err.message : 'Erro ao criar usuário.');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${deleteConfirm.id}`);
      showToast('Usuário excluído com sucesso.');
      setDeleteConfirm(null);
      load(pagination.page);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 409) {
          showToast('Não é possível excluir este usuário pois ele possui pedidos associados.', 'error');
        } else if (err.status === 404) {
          showToast('Usuário não encontrado.', 'error');
        } else {
          showToast(err.message || 'Erro ao excluir usuário.', 'error');
        }
      } else {
        showToast(err instanceof Error ? err.message : 'Erro ao excluir usuário.', 'error');
      }
    } finally {
      setDeleting(false);
    }
  };

  const confirmMessage = () => {
    if (!confirm) return '';
    if (confirm.type === 'activate') return `Deseja ativar o usuário "${confirm.user.name}"?`;
    if (confirm.type === 'deactivate')
      return `Deseja desativar o usuário "${confirm.user.name}"? Ele não poderá utilizar o sistema enquanto estiver inativo.`;
    return `Deseja alterar a função de "${confirm.user.name}" para ${confirm.role}? Isso muda as permissões de acesso deste usuário.`;
  };

  return (
<AdminLayout title="Usuários" subtitle="Gerencie os usuários cadastrados no AgroConnect">
        <PageHeader
          title="Usuários"
          subtitle={`${pagination.total} usuário(s) cadastrado(s)`}
          action={
            <>
              <button className="btn btn--primary" onClick={openCreateUser}>
                + Novo usuário
              </button>
            </>
          }
        />

      <div className="card">
        <div className="card__header">
          <div className="card__title">Lista de usuários</div>
          <div className="filter-bar">
            <div className="field" style={{ minWidth: 200 }}>
              <label className="field__label" htmlFor="users-search">Buscar</label>
              <input
                id="users-search"
                className="input"
                placeholder="Buscar por nome, usuário ou e-mail"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              />
            </div>
            <div className="field" style={{ minWidth: 140 }}>
              <label className="field__label" htmlFor="users-role">Função</label>
              <select id="users-role" className="select" value={role} onChange={(e) => setRole(e.target.value as RoleFilter)}>
                <option value="all">Todas as funções</option>
                <option value="ADMIN">ADMIN</option>
                <option value="USER">USER</option>
              </select>
            </div>
            <div className="field" style={{ minWidth: 140 }}>
              <label className="field__label" htmlFor="users-status">Status</label>
              <select
                id="users-status"
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
        ) : users.length === 0 ? (
          <EmptyState
            icon={<IconInbox size={26} />}
            title="Nenhum usuário encontrado"
            description="Ajuste os filtros de busca."
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Usuário</th>
                    <th>Função</th>
                    <th>Status</th>
                    <th>Cadastro</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
{users.map((u) => (
                     <tr key={u.id}>
                       <td className="cell-strong">{u.name}</td>
                       <td className="cell-muted">{u.username ?? '-'}</td>
                       <td>
                         <RoleBadge role={u.role} />
                       </td>
                       <td>
                         <ActiveBadge active={u.active} />
                       </td>
                       <td className="cell-muted">
                         {u.createdAt ? formatDate(u.createdAt) : '-'}
                       </td>
                       <td className="table__actions-cell">
                         <div className="action-group">
                           <button className="btn btn--ghost btn--sm" onClick={() => setDetail(u)}>
                             Detalhes
                           </button>
                           {u.active ? (
                             <button
                               className="btn btn--ghost btn--sm"
                               disabled={isSelf(u.id)}
                               title={isSelf(u.id) ? 'Você não pode desativar a própria conta' : ''}
                               onClick={() => setConfirm({ type: 'deactivate', user: u })}
                             >
                               Desativar
                             </button>
) : (
                              <button
                                className="btn btn--success btn--sm"
                                onClick={() => setConfirm({ type: 'activate', user: u })}
                              >
                                Ativar
                              </button>
)}
                            <button
                             className="btn btn--ghost btn--sm"
                             disabled={isSelf(u.id)}
                             title={isSelf(u.id) ? 'Você não pode alterar a própria função' : ''}
                             onClick={() =>
                               setConfirm({
                                 type: 'role',
                                 user: u,
                                 role: u.role === 'ADMIN' ? 'USER' : 'ADMIN',
                               })
                             }
                           >
                             Alterar função
                           </button>
                           <button
                             className="btn btn--danger btn--sm"
                             onClick={() => setDeleteConfirm(u)}
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
                Página {pagination.page} de {pagination.totalPages} · {pagination.total} usuários
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

{detail && (
         <Modal
           title="Detalhes do usuário"
           onClose={() => setDetail(null)}
           footer={
             <button className="btn btn--ghost" onClick={() => setDetail(null)}>
               Fechar
             </button>
           }
         >
           <div className="info-list">
             <div className="info-row">
               <span className="info-row__label">Nome</span>
               <span className="info-row__value">{detail.name}</span>
             </div>
             <div className="info-row">
               <span className="info-row__label">Usuário</span>
               <span className="info-row__value">{detail.username ?? '-'}</span>
             </div>
             <div className="info-row">
               <span className="info-row__label">E-mail</span>
               <span className="info-row__value">{detail.email ?? '-'}</span>
             </div>
             <div className="info-row">
               <span className="info-row__label">Função</span>
               <span className="info-row__value">{detail.role}</span>
             </div>
             <div className="info-row">
               <span className="info-row__label">Status</span>
               <span className="info-row__value">{detail.active ? 'Ativo' : 'Inativo'}</span>
             </div>
             <div className="info-row">
               <span className="info-row__label">Cadastro</span>
               <span className="info-row__value">
                 {detail.createdAt ? formatDate(detail.createdAt) : '-'}
               </span>
             </div>
             <div className="info-row">
               <span className="info-row__label">Última atualização</span>
               <span className="info-row__value">
                 {detail.updatedAt ? formatDate(detail.updatedAt) : '-'}
               </span>
             </div>
           </div>
         </Modal>
       )}
       {createUserModalOpen && (
         <Modal
           title="Novo usuário"
           onClose={() => !creating && setCreateUserModalOpen(false)}
footer={
             <button className="btn btn--ghost" onClick={() => setCreateUserModalOpen(false)} disabled={creating}>
               Cancelar
             </button>
           }
         >
<UserFormComponent
             initialValues={{ name: '', username: '', password: '', role: 'USER', active: true }}
             values={createUserForm}
             onChange={setCreateUserForm}
             onSubmit={(_) => handleCreateUserSubmit()}
             loading={creating}
             error={createUserError}
           />
         </Modal>
        )}
        <ConfirmDialog
          open={!!confirm}
          title="Confirmar ação"
          message={confirmMessage()}
          confirmLabel="Confirmar"
          cancelLabel="Cancelar"
          danger={confirm?.type === 'deactivate'}
          loading={acting}
          onConfirm={confirmAction}
          onCancel={() => !acting && setConfirm(null)}
        />
        {deleteConfirm && (
          <ConfirmDialog
            open={true}
            title="Excluir usuário"
            message={`Tem certeza que deseja excluir o usuário "${deleteConfirm.name}"? Essa ação não pode ser desfeita.`}
            confirmLabel="Excluir"
            cancelLabel="Cancelar"
            danger={true}
            loading={deleting}
            onConfirm={handleDelete}
            onCancel={() => setDeleteConfirm(null)}
          />
        )}
      </AdminLayout>

);
  };





