import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { setToken, setStoredUser, clearSession } from '../store/auth';
import type { AdminUser } from '../types';
import { IconAlert } from '../components/icons';

export function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loginRes = await api.post<{ token: string; user: AdminUser }>('/auth/login', {
        identifier,
        password,
      });

      setToken(loginRes.token);

      const me = await api.get<AdminUser>('/auth/me');

      if (me.role !== 'ADMIN') {
        clearSession();
        setError('Acesso restrito à equipe administrativa. Seu usuário não possui permissão.');
        return;
      }

      setStoredUser(me);
      navigate('/admin/orders', { replace: true });
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Falha ao autenticar. Verifique os dados e tente novamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-hero">
        <div className="login-hero__brand">
          <div className="login-hero__logo">SS</div>
          SS Connect
        </div>
        <div>
          <h2>Painel administrativo do SS Connect</h2>
          <p>
            Gerencie pedidos, acompanhe o desempenho comercial e mantenha o controle das
            operações da plataforma em um só lugar.
          </p>
        </div>
        <div className="login-hero__footer">
          Acesso exclusivo para administradores.
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-card">
          <h1>Entrar</h1>
          <p className="sub">Acesse com suas credenciais de administrador.</p>

          {error && (
            <div className="alert alert--error login-alert" role="alert">
              <IconAlert size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field login-field">
              <label className="field__label" htmlFor="identifier">
                Usuário ou e-mail
                <span className="field__required" aria-hidden="true"> *</span>
              </label>
              <input
                id="identifier"
                type="text"
                className="input"
                placeholder="Digite seu usuário ou e-mail"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="field login-field">
              <label className="field__label" htmlFor="password">
                Senha
                <span className="field__required" aria-hidden="true"> *</span>
              </label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--block"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? 'Autenticando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
