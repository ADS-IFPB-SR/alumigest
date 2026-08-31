import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { CatalogPage } from './pages/CatalogPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { SeparateSalePage } from './pages/SeparateSalePage';
import { ProductTab as ProductsPage } from './pages/ProductsPage';
import { ProductBuilderPage } from './pages/ProductBuilderPage';

const queryClient = new QueryClient();

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
            <Route
              path="orcamentos/novo"
              element={
                <PlaceholderPage
                  title="Novo Orçamento"
                  icon="receipt_long"
                  description="Assistente para criação e cálculo automático de orçamentos e propostas comerciais."
                />
              }
            />
            <Route
              path="orcamentos/:id"
              element={
                <PlaceholderPage
                  title="Detalhes do Orçamento"
                  icon="receipt_long"
                  description="Visualização detalhada da composição, insumos calculados e exportação de proposta."
                />
              }
            />

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