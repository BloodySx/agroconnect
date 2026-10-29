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
        .map((p) => p[0])
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
      <div className="header__title">
        {title}
        {subtitle && <small>{subtitle}</small>}
      </div>
      <div className="header__user">
        <div className="header__user-meta">
          <div className="header__user-name">{user?.name ?? 'Administrador'}</div>
          <div className="header__user-role">
            Administrador · {user?.username ?? user?.email ?? 'conta ativa'}
          </div>
        </div>
        <div className="avatar" aria-hidden="true">{initials}</div>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={handleLogout}
          title="Sair"
          aria-label="Sair do painel"
        >
          <IconLogout size={18} />
        </button>
      </div>
    </header>
  );
}
