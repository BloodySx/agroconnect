import * as React from 'react';
import type { UserForm, Role } from '../types';
import { FormField } from './FormField';

export function UserForm({
  initialValues,
  values,
  onChange,
  onSubmit,
  loading = false,
  error = null,
}: {
  initialValues: UserForm;
  values: UserForm;
  onChange: (values: UserForm) => void;
  onSubmit: (data: UserForm) => void;
  loading?: boolean;
  error?: string | null;
}) {
  const normalizedError = error?.toLocaleLowerCase('pt-BR') ?? '';
  const nameError = normalizedError.includes('nome') ? error ?? undefined : undefined;
  const usernameError = normalizedError.includes('usuário') ? error ?? undefined : undefined;
  const passwordError = normalizedError.includes('senha') ? error ?? undefined : undefined;
  const hasFieldError = !!(nameError || usernameError || passwordError);

  const handleChange = (
    field: keyof UserForm,
    value: string | boolean | Role
  ) => {
    const newValues = { ...values, [field]: value };
    onChange(newValues);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <FormField label="Nome" htmlFor="new-user-name" error={nameError} required>
        <input
          id="new-user-name"
          className="input"
          value={values.name}
          onChange={e => handleChange('name', e.target.value)}
          placeholder="Nome completo"
          required
          aria-invalid={!!nameError}
          aria-describedby={nameError ? 'new-user-name-error' : undefined}
        />
      </FormField>

      <FormField label="Usuário" htmlFor="new-user-username" error={usernameError} required>
        <input
          id="new-user-username"
          className="input"
          value={values.username}
          onChange={e => handleChange('username', e.target.value)}
          placeholder="nomeusuario"
          required
          minLength={3}
          maxLength={50}
          aria-invalid={!!usernameError}
          aria-describedby={usernameError ? 'new-user-username-error' : undefined}
        />
      </FormField>

      <FormField label="Senha" htmlFor="new-user-password" error={passwordError} required>
        <input
          id="new-user-password"
          className="input"
          type="password"
          value={values.password}
          onChange={e => handleChange('password', e.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
          aria-invalid={!!passwordError}
          aria-describedby={passwordError ? 'new-user-password-error' : undefined}
        />
      </FormField>

      <FormField label="Função" htmlFor="new-user-role" required>
        <select
          id="new-user-role"
          className="select"
          value={values.role}
          onChange={e => handleChange('role', e.target.value as Role)}
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </FormField>

      <FormField label="Status">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={values.active}
            onChange={e => handleChange('active', e.target.checked)}
          />
          Ativo
        </label>
      </FormField>

      {error && !hasFieldError && (
        <div className="alert alert--error form__error" role="alert">
          {error}
        </div>
      )}

      <div className="form__actions">
        <button
          type="submit"
          className="btn btn--primary"
          disabled={loading}
        >
          {loading ? 'Criando...' : 'Criar usuário'}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            onChange(initialValues);
          }}
          disabled={loading}
        >
          Limpar
        </button>
      </div>
    </form>
  );
}
