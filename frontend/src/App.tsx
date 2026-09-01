import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { CatalogPage } from './pages/CatalogPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { BudgetNewPage } from './pages/BudgetNewPage';
import { BudgetDetailPage } from './pages/BudgetDetailPage';
import { BudgetEditor } from './features/budgets/components/BudgetEditor';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { SeparateSalePage } from './pages/SeparateSalePage';
import { ProductTab as ProductsPage } from './pages/ProductsPage';
import { ProductBuilderPage } from './pages/ProductBuilderPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<CatalogPage />} />

            <Route path="orcamentos" element={<BudgetsPage />} />
            <Route path="orcamentos/venda-avulsa" element={<SeparateSalePage />} />
            <Route path="orcamentos/novo" element={<BudgetNewPage />} />
            <Route path="orcamentos/:id" element={<BudgetDetailPage />} />
            <Route path="orcamentos/:id/editar" element={<BudgetEditor />} />

            <Route
              path="dashboard"
              element={
                <PlaceholderPage
                  title="Dashboard Gerencial"
                  icon="dashboard"
                  description="Painel com visão geral dos orçamentos gerados, taxas de conversão e indicadores de desempenho."
                />
              }
            />
            <Route
              path="kanban"
              element={
                <PlaceholderPage
                  title="Kanban de Orçamentos"
                  icon="view_kanban"
                  description="Fluxo visual para acompanhamento de propostas em elaboração, enviadas, aprovadas e em fabricação."
                />
              }
            />
            <Route
              path="estoque"
              element={
                <PlaceholderPage
                  title="Gestão de Estoque"
                  icon="inventory"
                  description="Controle de saldos de barras de alumínio, chapas de vidro, ferragens e insumos em almoxarifado."
                />
              }
            />

            <Route path="produtos" element={<ProductsPage />} />
            <Route path="produtos/novo" element={<ProductBuilderPage />} />
            <Route path="produtos/:id/editar" element={<ProductBuilderPage />} />

            <Route
              path="clientes"
              element={
                <PlaceholderPage
                  title="Gestão de Clientes"
                  icon="group"
                  description="Cadastro de clientes, contatos, histórico de orçamentos e vendas realizadas."
                />
              }
            />
            <Route
              path="financeiro"
              element={
                <PlaceholderPage
                  title="Módulo Financeiro"
                  icon="payments"
                  description="Controle de contas a receber, faturamento de projetos, custos de insumos e margens de lucro."
                />
              }
            />
            <Route
              path="configuracoes"
              element={
                <PlaceholderPage
                  title="Configurações do Sistema"
                  icon="settings"
                  description="Parâmetros gerais do AlumiGest, dados da empresa, permissões de usuários e preferências."
                />
              }
            />

            <Route
              path="*"
              element={
                <PlaceholderPage
                  title="Página em Desenvolvimento"
                  icon="construction"
                  description="Esta funcionalidade está programada para implementação nas próximas etapas do AlumiGest."
                />
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;