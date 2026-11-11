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
  to: string;
  icon: React.ReactNode;
}

interface NavSection {
  label: string;
  items: NavEntry[];
}

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const location = useLocation();

  const sections: NavSection[] = [
    {
      label: 'Visão geral',
      items: [
        { label: 'Dashboard', to: '/admin/dashboard', icon: <IconDashboard /> },
      ],
    },
    {
      label: 'Operação',
      items: [
        { label: 'Pedidos', to: '/admin/orders', icon: <IconOrders /> },
      ],
    },
    {
      label: 'Catálogo e preços',
      items: [
        { label: 'Produtos', to: '/admin/products', icon: <IconBox /> },
        { label: 'Embalagens', to: '/admin/packages', icon: <IconPackage /> },
        { label: 'Preços', to: '/admin/prices', icon: <IconTag /> },
        { label: 'Preços por cliente', to: '/admin/client-prices', icon: <IconUserTag /> },
      ],
    },
    {
      label: 'Administração',
      items: [
        { label: 'Usuários', to: '/admin/users', icon: <IconUsers /> },
      ],
    },
  ];

  return (
    <aside
      id="admin-navigation"
      className={`sidebar ${open ? 'sidebar--open' : ''}`}
      aria-label="Navegação principal"
    >
      <div className="sidebar__brand">
        <div className="sidebar__logo" aria-hidden="true">
          <svg viewBox="0 0 32 32" role="img">
            <path d="M16 25V14" />
            <path d="M16 17C16 10 11 7 5 7c0 7 4 11 11 11" />
            <path d="M16 14c0-6 4-10 11-10 0 6-4 10-11 10" />
            <path d="M8 26h16" />
          </svg>
        </div>
        <div className="sidebar__brand-copy">
          <div className="sidebar__brand-name">AgroConnect</div>
          <div className="sidebar__brand-sub">Painel administrativo</div>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Seções administrativas">
        {sections.map((section) => (
          <div className="sidebar__group" key={section.label}>
            <div className="sidebar__section">{section.label}</div>
            {section.items.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin/dashboard'}
                  className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
                  onClick={onNavigate}
                >
                  <span className="nav-item__icon">{item.icon}</span>
                  <span className="nav-item__label">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        <span className="sidebar__footer-mark" aria-hidden="true">
          <svg viewBox="0 0 16 16"><path d="M8 13V7M8 9C4 9 3 6 3 3c3 0 5 2 5 5M8 7c0-3 2-5 5-5 0 3-2 5-5 5M3 14h10" /></svg>
        </span>
        <span>AgroConnect · Gestão</span>
        <span className="sidebar__footer-version">© {new Date().getFullYear()}</span>
      </div>
    </aside>
  );
}
