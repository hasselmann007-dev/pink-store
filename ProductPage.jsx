import { useParams, Link } from 'react-router-dom';
import products from '../data/products.js';

/**
 * Página de produto individual. Recupera o ID a partir da URL usando
 * useParams() e encontra o produto no objeto de dados. Exibe
 * detalhes básicos e oferece um link para voltar à lista de produtos.
 */
export default function ProductPage() {
  const { id } = useParams();
  const product = products[id];

  if (!product) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Produto não encontrado</h1>
        <p className="mt-2">Parece que este produto não existe ou foi removido.</p>
        <Link to="/" className="text-pink-600 underline mt-4 inline-block">
          Voltar para a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link to="/" className="text-pink-600 underline mb-4 inline-block">
        ← Voltar
      </Link>
      <div className="flex flex-col md:flex-row gap-8">
        <img
          src={product.image}
          alt={product.name}
          className="w-80 h-80 object-cover rounded-xl shadow-md"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl text-pink-600 font-semibold mb-4">
            R$ {product.price}
          </p>
          <p className="prose dark:prose-invert max-w-prose mb-6">
            {product.description || 'Descrição detalhada do produto ainda indisponível.'}
          </p>
          <button
            className="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            onClick={() => alert('Funcionalidade de compra ainda não implementada')}
          >
            Comprar agora
          </button>
        </div>
      </div>
    </div>
  );
}