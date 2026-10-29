import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { RequireAuth } from './router/RequireAuth';
import { LoginPage } from './pages/Login';
import { OrdersListPage } from './pages/orders/OrdersList';
import { OrderDetailPage } from './pages/orders/OrderDetail';
import { ProductsPage } from './pages/products/ProductsPage';
import { PackagesPage } from './pages/packages/PackagesPage';
import { PricesPage } from './pages/prices/PricesPage';
import { ClientPricesPage } from './pages/prices/ClientPricesPage';
import { UsersPage } from './pages/users/UsersPage';
import { DashboardPage } from './pages/Dashboard';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin/orders"
            element={
              <RequireAuth>
                <OrdersListPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/products"
            element={
              <RequireAuth>
                <ProductsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/packages"
            element={
              <RequireAuth>
                <PackagesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/prices"
            element={
              <RequireAuth>
                <PricesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/client-prices"
            element={
              <RequireAuth>
                <ClientPricesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RequireAuth>
                <UsersPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/orders/:id"
            element={
              <RequireAuth>
                <OrderDetailPage />
              </RequireAuth>
            }
          />
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
