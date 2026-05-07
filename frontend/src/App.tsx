import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AdminPage } from "./routes/AdminPage";
import { AuditPage } from "./routes/AuditPage";
import { MaintenancePage } from "./routes/MaintenancePage";
import { CartPage } from "./routes/CartPage";
import { CatalogPage } from "./routes/CatalogPage";
import { LoginPage } from "./routes/LoginPage";
import { MyOrdersPage } from "./routes/MyOrdersPage";
import { OrderDetailPage } from "./routes/OrderDetailPage";

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
            <Route path="login" element={<LoginPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="orders" element={<MyOrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
