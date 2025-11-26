import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import ProductPage from './pages/ProductPage.jsx';

/**
 * Componente raiz da aplicação. Define as rotas principais usando React Router.
 * A rota '/' exibe a página inicial e '/product/:id' carrega dinamicamente
 * a página de produto com base no ID fornecido na URL.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductPage />} />
      </Routes>
    </BrowserRouter>
  );
}