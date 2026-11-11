import { useNavigate } from 'react-router-dom';
import { getStoredUser, clearSession } from '../../store/auth';
import { IconLogout } from '../icons';

export function Header({
  title,
  subtitle,
  navigationOpen,
  onToggleNavigation,
}: {
  title: string;
  subtitle?: string;
  navigationOpen: boolean;
  onToggleNavigation: () => void;
}) {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'AD';

  return (
    <header className="header">
      <button
        type="button"
        className="header__menu"
        onClick={onToggleNavigation}
        aria-label={navigationOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={navigationOpen}
        aria-controls="admin-navigation"
      >
        <span aria-hidden="true">{navigationOpen ? '×' : '☰'}</span>
      </button>

      <div className="header__workspace">
        <div className="header__workspace-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32">
            <path d="M16 25V14" />
            <path d="M16 17C16 10 11 7 5 7c0 7 4 11 11 11" />
            <path d="M16 14c0-6 4-10 11-10 0 6-4 10-11 10" />
            <path d="M8 26h16" />
          </svg>
        </div>
        <div className="header__workspace-copy">
          <span>AGROCONNECT</span>
          <strong>Central administrativa</strong>
        </div>
      </div>

      <span className="sr-only">{title}{subtitle ? ` — ${subtitle}` : ''}</span>

      <div className="header__user">
        <div className="header__user-meta">
          <div className="header__user-name">{user?.name ?? 'Administrador'}</div>
          <div className="header__user-role">
            Administrador · {user?.username ?? user?.email ?? 'conta ativa'}
          </div>
        </div>
        <div className="avatar" aria-hidden="true">{initials}</div>
        <span className="header__divider" aria-hidden="true" />
        <button
          type="button"
          className="btn btn--ghost btn--sm header__logout"
          onClick={handleLogout}
          title="Sair"
          aria-label="Sair do painel"
        >
          <IconLogout size={18} />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
}
