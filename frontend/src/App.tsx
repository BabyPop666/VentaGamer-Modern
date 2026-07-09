import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AdminOrdersPage } from "./routes/AdminOrdersPage";
import { AdminPage } from "./routes/AdminPage";
import { AdminProductsPage } from "./routes/AdminProductsPage";
import { AiConfigPage } from "./routes/AiConfigPage";
import { AuditPage } from "./routes/AuditPage";
import { CartPage } from "./routes/CartPage";
import { CatalogPage } from "./routes/CatalogPage";
import { ConfigurationPage } from "./routes/ConfigurationPage";
import { HelpPage } from "./routes/HelpPage";
import { HomePage } from "./routes/HomePage";
import { LoginPage } from "./routes/LoginPage";
import { MaintenancePage } from "./routes/MaintenancePage";
import { MyOrdersPage } from "./routes/MyOrdersPage";
import { NotFoundPage } from "./routes/NotFoundPage";
import { OrderDetailPage } from "./routes/OrderDetailPage";
import { PasswordResetPage } from "./routes/PasswordResetPage";
import { RegisterPage } from "./routes/RegisterPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<CatalogPage />} />
            <Route path="home" element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="password-reset" element={<PasswordResetPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="orders" element={<MyOrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="admin/products" element={<AdminProductsPage />} />
            <Route path="admin/orders" element={<AdminOrdersPage />} />
            <Route path="admin/ai" element={<AiConfigPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="config" element={<ConfigurationPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
