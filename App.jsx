import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import ProductPage from './pages/ProductPage.jsx';
<section className="max-w-6xl mx-auto px-4 mt-12">
  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">
    DESTAQUES<span className="text-pink-500">.</span>
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {Object.entries(products).map(([id, product]) => (
      <div
        key={id}
        className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
      >
        {/* Faixa de desconto */}
        {product.discount && (
          <div className="bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-br-2xl">
            {product.discount}
          </div>
        )}

        {/* Imagem */}
        <div className="p-4 pb-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-52 object-cover rounded-xl"
          />
        </div>

        {/* Conteúdo */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Estrelas */}
          <div className="flex items-center text-yellow-400 text-xs mb-1">
            {"★".repeat(5)}
            <span className="text-slate-500 text-[11px] ml-1">
              ({product.ratingCount || 0})
            </span>
          </div>

          {/* Nome */}
          <h3 className="text-sm font-semibold text-slate-900 leading-snug mb-1 line-clamp-2">
            {product.name}
          </h3>

          {/* Preços */}
          <div className="mt-2">
            {product.oldPrice && (
              <p className="text-xs text-slate-400 line-through">
                R$ {product.oldPrice}
              </p>
            )}
            <p className="text-lg font-extrabold text-pink-600">
              R$ {product.price}
            </p>
            {product.installments && (
              <p className="text-[11px] text-slate-500">
                {product.installments}
              </p>
            )}
          </div>

          {/* Botão */}
          <button className="mt-3 w-full bg-pink-600 text-white text-xs font-bold py-2 rounded-full hover:bg-pink-700 transition">
            COMPRAR
          </button>
        </div>
      </div>
    ))}
  </div>
</section>

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