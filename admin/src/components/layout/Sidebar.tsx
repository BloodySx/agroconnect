import { NavLink, useLocation } from 'react-router-dom';
import {
  IconDashboard,
  IconOrders,
  IconBox,
  IconPackage,
  IconTag,
  IconUserTag,
  IconUsers,
} from '../icons';

interface NavEntry {
  label: string;
  to?: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const location = useLocation();

  const nav: NavEntry[] = [
    { label: 'Dashboard', to: '/admin/dashboard', icon: <IconDashboard /> },
    { label: 'Pedidos', to: '/admin/orders', icon: <IconOrders /> },
    { label: 'Produtos', to: '/admin/products', icon: <IconBox /> },
    { label: 'Embalagens', to: '/admin/packages', icon: <IconPackage /> },
    { label: 'Preços', to: '/admin/prices', icon: <IconTag /> },
    { label: 'Preços por Cliente', to: '/admin/client-prices', icon: <IconUserTag /> },
    { label: 'Usuários', to: '/admin/users', icon: <IconUsers /> },
  ];

  return (
    <aside
      id="admin-navigation"
      className={`sidebar ${open ? 'sidebar--open' : ''}`}
      aria-label="Navegação principal"
    >
      <div className="sidebar__brand">
        <div className="sidebar__logo">SS</div>
        <div>
          <div className="sidebar__brand-name">AgroConnect</div>
          <div className="sidebar__brand-sub">Painel Administrativo</div>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Seções administrativas">
        <div className="sidebar__section">Geral</div>
        {nav.map((item) => {
          const isActive = item.to && location.pathname.startsWith(item.to);
          if (item.disabled || !item.to) {
            return (
              <div key={item.label} className="nav-item nav-item--disabled">
                <span className="nav-item__icon">{item.icon}</span>
                {item.label}
              </div>
            );
          }
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
              onClick={onNavigate}
            >
              <span className="nav-item__icon">{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar__footer">AgroConnect © {new Date().getFullYear()}</div>
    </aside>
  );
}
