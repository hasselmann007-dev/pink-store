import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Menu, X, User, Heart, Star, 
  ChevronRight, ChevronLeft, Truck, CreditCard, ShieldCheck, 
  ArrowRight, Plus, Minus, Trash2, CheckCircle, MapPin,
  Clock, ThumbsUp, ChevronDown, Frown, Gift
} from 'lucide-react';

// --- IMPORTAÇÕES DO FIREBASE ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, 
  signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, collection, doc, setDoc, 
  onSnapshot, updateDoc, deleteDoc, writeBatch 
} from 'firebase/firestore';

// ==========================================================
// ⚠️ ÁREA DE CONFIGURAÇÃO - COLE SUAS CHAVES AQUI
// ==========================================================

const firebaseConfig = {
  // Substitua os textos entre aspas pelas suas chaves do site do Firebase
  apiKey: "AIzaSyCcFU2EfMj64OWsp5Vu-BC9kjhEjblSGKQ",
  authDomain: "pink-store-a0ae4.firebaseapp.com",
  projectId: "pink-store-a0ae4",
  storageBucket: "pink-store-a0ae4.firebasestorage.app",
  messagingSenderId: "140236029872",
  appId: "1:140236029872:web:2f60d3ea7cb3df03972075"
};

// ==========================================================

// Inicializa o Firebase com as suas chaves
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'pink-store-v1'; // Nome interno para salvar no banco

// --- DADOS INICIAIS (LISTA COMPLETA DE PRODUTOS) ---
const INITIAL_PRODUCTS = [
  {
    id: 'prod_01',
    name: "Body Splash Sweet Pink 200ml",
    price: 89.90,
    oldPrice: 149.90,
    discount: 40,
    category: "Perfumes",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    reviews: 22,
    description: "Uma fragrância doce e envolvente que desperta sensações únicas. Notas de baunilha, frutas vermelhas e um toque floral delicado.",
    sku: "BSP-001"
  },
  {
    id: 'prod_02',
    name: "Sérum Facial 10 em 1 - Vitamina C",
    price: 129.90,
    oldPrice: 299.90,
    discount: 56,
    category: "Skincare",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&w=600&q=80",
    rating: 4.9,
    reviews: 850,
    description: "Revolução no skincare. Combate rugas, manchas e oleosidade com apenas 3 gotas diárias.",
    sku: "SRM-010"
  },
  {
    id: 'prod_03',
    name: "Kit Cronograma Capilar Power",
    price: 199.90,
    oldPrice: 359.90,
    discount: 45,
    category: "Cabelos",
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    reviews: 432,
    description: "O trio perfeito para hidratação, nutrição e reconstrução. Recupere a saúde dos fios em 4 semanas.",
    sku: "KIT-CAP-03"
  },
  {
    id: 'prod_04',
    name: "Base Matte Alta Cobertura",
    price: 59.90,
    oldPrice: 89.90,
    discount: 33,
    category: "Maquiagem",
    image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=600&q=80",
    rating: 4.6,
    reviews: 2100,
    description: "Cobertura perfeita que dura 24 horas. Resistente à água e suor, com acabamento aveludado.",
    sku: "BASE-MAT-04"
  },
  {
    id: 'prod_05',
    name: "Lip Tint Vermelho Cereja",
    price: 39.90,
    oldPrice: 59.90,
    discount: 33,
    category: "Maquiagem",
    image: "https://images.unsplash.com/photo-1571781535009-2b994dc3882c?auto=format&fit=crop&w=600&q=80",
    rating: 4.5,
    reviews: 560,
    description: "Cor natural e duradoura para lábios e bochechas. Não transfere e não resseca.",
    sku: "LIP-TNT-05"
  },
  {
    id: 'prod_06',
    name: "Hidratante Corporal Marshmallow",
    price: 69.90,
    oldPrice: 99.90,
    discount: 30,
    category: "Corpo",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80",
    rating: 4.9,
    reviews: 3200,
    description: "Pele macia e perfumada com toque seco. Absorção rápida e hidratação profunda por 48h.",
    sku: "HID-MRL-06"
  },
  {
    id: 'prod_07',
    name: "Perfume One Touch Gold 100ml",
    price: 189.90,
    oldPrice: 289.90,
    discount: 35,
    category: "Perfumes",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80",
    rating: 4.8,
    reviews: 980,
    description: "Luxo e sofisticação em um frasco. Notas de ouro, especiarias e madeira nobre.",
    sku: "PRF-OTG-07"
  },
  {
    id: 'prod_08',
    name: "Máscara de Cílios Volume Extremo",
    price: 49.90,
    oldPrice: 79.90,
    discount: 37,
    category: "Maquiagem",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    reviews: 1500,
    description: "Cílios de boneca instantâneos. Aplicador exclusivo que separa e alonga cada fio.",
    sku: "MSC-VOL-08"
  }
];

// --- PRODUTO EXTRA (OFFER BUMP) ---
const ORDER_BUMP_ITEM = {
  id: 'bump_01',
  name: "Esponja de Maquiagem Soft Blender",
  price: 9.90,
  image: "https://images.unsplash.com/photo-1598121210875-502a19c17c85?auto=format&fit=crop&w=200&q=80",
  qty: 1
};

// --- COMPONENTES AUXILIARES ---

const Button = ({ children, variant = 'primary', className, onClick, disabled, loading, size = 'md' }) => {
  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };
  
  const baseStyle = `rounded font-bold transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]}`;
  
  const variants = {
    primary: "bg-[#E91E63] hover:bg-[#C2185B] text-white shadow-lg shadow-[#E91E63]/30 hover:shadow-xl hover:-translate-y-0.5",
    secondary: "bg-black hover:bg-gray-800 text-white",
    outline: "border-2 border-black text-black hover:bg-black hover:text-white",
    ghost: "text-gray-600 hover:bg-gray-100",
    success: "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {loading ? <span className="animate-spin">↻</span> : children}
    </button>
  );
};

// --- APLICAÇÃO PRINCIPAL ---

export default function App() {
  // State
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [searchTerm, setSearchTerm] = useState(''); 

  // --- AUTENTICAÇÃO ---
  useEffect(() => {
    const initAuth = async () => {
      // Tenta logar de forma anônima para o usuário poder usar o banco
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Erro ao logar:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // --- CARREGAR DADOS ---
  useEffect(() => {
    if (!user) return;
    
    // Carregar Produtos
    const productsRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
    const unsubscribeProducts = onSnapshot(productsRef, async (snapshot) => {
      if (snapshot.empty) {
        // Se não tiver produtos no banco, cria os produtos iniciais
        const batch = writeBatch(db);
        INITIAL_PRODUCTS.forEach(prod => {
          const docRef = doc(productsRef, prod.id);
          batch.set(docRef, prod);
        });
        await batch.commit();
      } else {
        setProducts(snapshot.docs.map(d => d.data()));
        setLoading(false);
      }
    }, (error) => console.error("Erro produtos:", error));

    // Carregar Carrinho do Usuário
    const cartRef = collection(db, 'artifacts', appId, 'users', user.uid, 'cart');
    const unsubscribeCart = onSnapshot(cartRef, (snapshot) => {
      setCart(snapshot.docs.map(d => ({...d.data(), id: d.id})));
    }, (error) => console.error("Erro carrinho:", error));

    return () => {
      unsubscribeProducts();
      unsubscribeCart();
    };
  }, [user]);

  // --- LÓGICA DO CARRINHO ---
  const addToCart = async (product, qty = 1) => {
    if (!user) return;
    setIsCartOpen(true);
    const cartRef = collection(db, 'artifacts', appId, 'users', user.uid, 'cart');
    const existingItem = cart.find(item => item.productId === product.id);

    if (existingItem) {
      const docRef = doc(cartRef, existingItem.id);
      await updateDoc(docRef, { qty: existingItem.qty + qty });
    } else {
      await setDoc(doc(cartRef, `item_${product.id}`), {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: qty
      });
    }
  };

  const removeFromCart = async (itemId) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'cart', itemId));
  };

  const updateQty = async (itemId, newQty) => {
    if (!user || newQty < 1) return;
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'cart', itemId), {
      qty: newQty
    });
  };

  const handlePaymentProcess = async (formData) => {
    setPaymentStatus('processing');
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPaymentStatus('success');
      // Limpar carrinho
      const batch = writeBatch(db);
      cart.forEach(item => {
        const ref = doc(db, 'artifacts', appId, 'users', user.uid, 'cart', item.id);
        batch.delete(ref);
      });
      await batch.commit();
    } catch (error) {
      console.error(error);
      setPaymentStatus('error');
    }
  };

  const formatPrice = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const cartSubTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  // --- SUB-COMPONENTES (TELAS) ---

  const NavBar = () => (
    <>
      <div className="bg-[#E91E63] text-white text-[10px] sm:text-xs font-bold text-center py-2 tracking-widest uppercase flex justify-center items-center gap-4">
        <span className="hidden sm:inline">⚡ ENVIOS PARA TODO BRASIL</span>
        <span>🔥 FRETE GRÁTIS ACIMA DE R$ 199,90</span>
        <span className="hidden sm:inline">💳 ATÉ 10X SEM JUROS</span>
      </div>
      
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button className="md:hidden text-gray-800">
              <Menu size={24} />
            </button>

            <div className="flex-shrink-0 cursor-pointer" onClick={() => {setCurrentRoute('home'); setSearchTerm('');}}>
              <div className="text-3xl font-black tracking-tighter flex items-center">
                <span className="text-black">PINK</span>
                <span className="text-[#E91E63]">STORE</span>
                <div className="w-2 h-2 bg-[#E91E63] rounded-full ml-1 mt-3 animate-pulse"></div>
              </div>
            </div>

            <div className="hidden md:flex flex-1 max-w-lg mx-8 relative group">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if(currentRoute !== 'home') setCurrentRoute('home');
                }}
                placeholder="Buscar produtos..."
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
              />
              <Search size={18} className="absolute right-3 top-3 text-gray-400 group-focus-within:text-[#E91E63]" />
            </div>

            <div className="flex items-center gap-6">
              <button 
                className="text-gray-800 hover:text-[#E91E63] relative transition-colors transform hover:scale-105 active:scale-95"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag size={26} strokeWidth={2.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#E91E63] text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce-in">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );

  const HomePage = () => {
    const filteredProducts = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="animate-fade-in">
        {!searchTerm && (
          <div className="relative w-full h-[400px] md:h-[550px] bg-gray-100 overflow-hidden mb-12">
            <img 
              src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=1600&q=80" 
              className="w-full h-full object-cover"
              alt="Banner"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center">
              <div className="max-w-7xl mx-auto px-4 w-full">
                <div className="max-w-xl text-white">
                  <div className="inline-flex items-center gap-2 bg-[#E91E63] text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-widest mb-4">
                    <Clock size={12} /> Oferta Limitada
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black leading-none mb-6 drop-shadow-lg">
                    PINK <br/> FRIDAY
                  </h1>
                  <p className="text-lg md:text-xl mb-8 font-light text-gray-200 max-w-md">
                    O momento que você esperava chegou. Toda a loja com descontos progressivos.
                  </p>
                  <Button 
                    variant="primary" 
                    size="lg"
                    className="px-12"
                    onClick={() => {
                      const el = document.getElementById('products');
                      el?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    QUERO APROVEITAR
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div id="products" className="max-w-7xl mx-auto px-4 mb-20">
          <div className="flex items-end justify-between mb-8 border-b border-gray-200 pb-4">
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
              {searchTerm ? `Resultados para "${searchTerm}"` : <span>Destaques <span className="text-[#E91E63]">.</span></span>}
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E91E63]"></div></div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-xl border border-gray-100 border-dashed">
               <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6 text-gray-400">
                 <Frown size={48} strokeWidth={1.5} />
               </div>
               <h3 className="text-xl font-black text-gray-900 mb-2">Ops! Produto esgotado no estoque.</h3>
               <p className="text-gray-500 max-w-md mx-auto mb-6">
                 Não encontramos o que você procurou. Que tal dar uma olhada nas nossas ofertas especiais abaixo?
               </p>
               <Button variant="outline" onClick={() => setSearchTerm('')}>Ver todos os produtos</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {filteredProducts.map(product => (
                <div key={product.id} className="group flex flex-col bg-white">
                  <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-lg bg-gray-100 border border-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedProduct(product);
                      setCurrentRoute('product');
                      window.scrollTo(0,0);
                    }}
                  >
                    {product.discount > 0 && (
                      <span className="absolute top-0 left-0 bg-[#E91E63] text-white text-xs font-black px-3 py-1.5 z-10 uppercase tracking-wider">
                        {product.discount}% OFF
                      </span>
                    )}
                    <img 
                      src={product.image} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={product.name}
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center text-amber-400 text-[10px] font-bold mb-2 gap-1">
                      <Star size={10} fill="currentColor" />
                      <Star size={10} fill="currentColor" />
                      <Star size={10} fill="currentColor" />
                      <Star size={10} fill="currentColor" />
                      <Star size={10} fill="currentColor" />
                      <span className="text-gray-400 ml-1">({product.reviews})</span>
                    </div>
                    <h3 
                      className="font-bold text-gray-900 text-base mb-1 leading-tight cursor-pointer hover:text-[#E91E63] uppercase"
                      onClick={() => {
                        setSelectedProduct(product);
                        setCurrentRoute('product');
                        window.scrollTo(0,0);
                      }}
                    >
                      {product.name}
                    </h3>
                    <div className="mt-auto pt-2">
                      <span className="text-xs text-gray-400 line-through block">{formatPrice(product.oldPrice)}</span>
                      <span className="text-2xl font-black text-[#E91E63]">{formatPrice(product.price)}</span>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">
                        10x de {formatPrice(product.price / 10)}
                      </p>
                    </div>
                    <Button className="mt-4 w-full text-xs py-2.5" onClick={() => addToCart(product)}>
                      Comprar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const ProductPage = () => {
    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState('aval');
    const [cep, setCep] = useState('');
    const [timeLeft, setTimeLeft] = useState({ h: 4, m: 32, s: 15 });
    const [viewerCount, setViewerCount] = useState(85);

    useEffect(() => {
      const viewerInterval = setInterval(() => {
        setViewerCount(Math.floor(Math.random() * (500 - 50 + 1)) + 50);
      }, 3500);
      return () => clearInterval(viewerInterval);
    }, []);

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev.s > 0) return { ...prev, s: prev.s - 1 };
          if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
          if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
          return prev; 
        });
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    const formatTime = (time) => time.toString().padStart(2, '0');

    const MOCK_REVIEWS = [
      { id: 1, initials: "DD", name: "Daniela D.", verified: true, date: "03/11/2025", rating: 5, title: "cheiro incrível, bem masculino e ótima fixação", recommend: true },
      { id: 2, initials: "BP", name: "Bibiana P.", verified: true, date: "21/10/2025", rating: 5, title: "Manda uns mimos... We 💕💕💕", text: "Top d++++, amooo! =))", recommend: true },
      { id: 3, initials: "MA", name: "Mariana A.", verified: true, date: "15/10/2025", rating: 4, title: "Gostei muito!", text: "Chegou super rápido e o produto é de qualidade. Só achei a embalagem um pouco frágil.", recommend: true }
    ];

    if (!selectedProduct) return null;

    return (
      <div className="animate-fade-in bg-white pb-20">
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-3 text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
            <span className="cursor-pointer hover:text-black" onClick={() => setCurrentRoute('home')}>Home</span>
            <ChevronRight size={12} />
            <span className="cursor-pointer hover:text-black">{selectedProduct.category}</span>
            <ChevronRight size={12} />
            <span className="text-[#E91E63]">{selectedProduct.name}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-12 gap-10">
            <div className="md:col-span-7">
              <div className="aspect-[4/4] md:aspect-[4/3] rounded-sm overflow-hidden bg-gray-50 border border-gray-100 relative group">
                 <img loading="lazy" src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name}/>
                 {selectedProduct.discount > 0 && (
                    <div className="absolute top-0 left-0 bg-[#E91E63] text-white p-4 z-10">
                      <p className="text-2xl font-black leading-none">-{selectedProduct.discount}%</p>
                      <p className="text-xs font-bold uppercase tracking-wider">Desconto</p>
                    </div>
                 )}
                 <button className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-md hover:text-[#E91E63] transition-colors"><Heart size={20} /></button>
              </div>
            </div>

            <div className="md:col-span-5 flex flex-col">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight uppercase mb-2">
                {selectedProduct.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-6">
                <div className="flex text-amber-400">
                  {[1,2,3,4,5].map(i => <Star key={i} size={18} fill="currentColor" />)}
                </div>
                <span className="text-sm font-bold text-gray-500">({selectedProduct.reviews} avaliações)</span>
                <span className="text-gray-300">|</span>
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1 transition-all duration-500">
                   <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                   {viewerCount} pessoas vendo agora
                </span>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#E91E63] text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 transition-all animate-pulse-slow">
                  <Clock size={12} /> EXPIRA EM: {formatTime(timeLeft.h)}:{formatTime(timeLeft.m)}:{formatTime(timeLeft.s)}
                </div>

                <p className="text-gray-500 text-sm line-through mb-1">De: {formatPrice(selectedProduct.oldPrice)}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-[#E91E63] tracking-tighter">{formatPrice(selectedProduct.price)}</span>
                  <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded">-{selectedProduct.discount}%</span>
                </div>
                <p className="text-gray-900 font-bold mt-2">
                  em até <span className="text-black text-lg">10x de {formatPrice(selectedProduct.price / 10)}</span> sem juros
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex gap-4">
                  <div className="w-32 flex items-center border-2 border-gray-200 rounded h-14">
                     <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-full px-4 hover:bg-gray-100 text-gray-600"><Minus size={16}/></button>
                     <span className="flex-1 text-center font-bold text-lg">{qty}</span>
                     <button onClick={() => setQty(qty + 1)} className="h-full px-4 hover:bg-gray-100 text-gray-600"><Plus size={16}/></button>
                  </div>
                  <Button className="flex-1 h-14 text-lg shadow-xl shadow-[#E91E63]/20 animate-pulse-slow" onClick={() => addToCart(selectedProduct, qty)}>ADICIONAR À SACOLA</Button>
                </div>
                <Button variant="success" className="w-full h-12 text-base" onClick={() => { addToCart(selectedProduct, qty); setIsCartOpen(false); setCurrentRoute('checkout'); }}>COMPRAR AGORA</Button>
              </div>

              <div className="border-t border-b border-gray-100 py-6 mb-6">
                 <div className="flex items-center gap-2 font-bold text-sm uppercase mb-3">
                   <Truck size={18} className="text-gray-400" />
                   Calcular Frete e Prazo
                 </div>
                 <div className="flex gap-2">
                   <input 
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      placeholder="00000-000" 
                      className="bg-gray-50 border border-gray-200 px-4 py-2 rounded w-40 text-sm outline-none focus:border-black"
                   />
                   <button className="text-xs font-bold underline hover:text-[#E91E63]">NÃO SEI MEU CEP</button>
                 </div>
                 {cep.length >= 8 && (
                   <div className="mt-4 space-y-2 text-sm animate-fade-in">
                     <div className="flex justify-between items-center p-3 bg-green-50 border border-green-100 rounded">
                        <span className="font-bold text-gray-800">Expresso (até 3 dias)</span>
                        <span className="font-bold text-green-600">R$ 14,90</span>
                     </div>
                   </div>
                 )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-2 border border-gray-100 p-2 rounded"><ShieldCheck className="text-green-500" size={20} /><span>Garantia de 7 dias para trocas</span></div>
                <div className="flex items-center gap-2 border border-gray-100 p-2 rounded"><ThumbsUp className="text-blue-500" size={20} /><span>98% de aprovação dos clientes</span></div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 max-w-6xl mx-auto">
             <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
               {['Descrição', 'Como Usar', 'Ingredientes', 'Avaliações'].map(tab => {
                 const key = tab.toLowerCase().substring(0, 4);
                 return (
                   <button 
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-8 py-4 font-bold uppercase tracking-wider text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === key ? 'border-[#E91E63] text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                   >
                     {tab}
                   </button>
                 )
               })}
             </div>
             
             <div className="prose max-w-none text-gray-600 leading-relaxed">
                {activeTab === 'desc' && (
                  <div className="animate-fade-in">
                    <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase">{selectedProduct.name}</h3>
                    <p className="mb-4">{selectedProduct.description}</p>
                    <p>Desenvolvido com tecnologia exclusiva, este produto entrega resultados visíveis desde a primeira aplicação. Sua fórmula contém ativos concentrados que agem profundamente.</p>
                  </div>
                )}
                {activeTab === 'aval' && (
                  <div className="animate-fade-in">
                     <h3 className="text-xl font-black text-gray-900 mb-6 text-center">Avaliações de Clientes</h3>
                     <div className="grid gap-4">
                        {MOCK_REVIEWS.map(review => (
                          <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                             <div className="flex items-center gap-2 mb-2">
                               <span className="font-bold text-gray-900">{review.name}</span>
                               <div className="flex text-amber-400 text-xs">
                                 {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />)}
                               </div>
                             </div>
                             <p className="text-sm text-gray-600">{review.title}</p>
                          </div>
                        ))}
                     </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    );
  };

  const CheckoutPage = () => {
    const [formData, setFormData] = useState({ email: '', name: '', address: '', number: '', cardName: '', cardNumber: '', cvv: '' });
    const [bumpAdded, setBumpAdded] = useState(false);
    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

    const shippingCost = cartSubTotal > 199.90 ? 0 : 14.90;
    const bumpCost = bumpAdded ? ORDER_BUMP_ITEM.price : 0;
    const finalTotal = cartSubTotal + shippingCost + bumpCost;

    const handleBumpToggle = () => {
        setBumpAdded(!bumpAdded);
    }

    if (cart.length === 0 && paymentStatus !== 'success') {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <ShoppingBag size={64} className="text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Seu carrinho está vazio</h2>
          <Button variant="outline" className="mt-4" onClick={() => setCurrentRoute('home')}>Voltar a comprar</Button>
        </div>
      );
    }

    if (paymentStatus === 'success') {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600"><CheckCircle size={48} /></div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Pedido Confirmado!</h2>
          <p className="text-gray-600 mb-8 max-w-md">Obrigado por comprar na Pink Store. Você receberá um e-mail com os detalhes.</p>
          <Button onClick={() => { setPaymentStatus('idle'); setCurrentRoute('home'); }}>Continuar Comprando</Button>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-8 text-sm font-bold text-gray-400">
          <span onClick={() => setCurrentRoute('home')} className="cursor-pointer hover:text-black">HOME</span>
          <ChevronRight size={12} />
          <span className="text-black">CHECKOUT</span>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded border border-gray-200">
               <h3 className="font-black text-gray-900 mb-4 uppercase flex items-center gap-2 text-lg"><User size={20} /> Dados Pessoais</h3>
               <div className="grid gap-4">
                 <input name="email" placeholder="E-mail" className="bg-gray-50 border-gray-200 border p-3 rounded text-sm outline-none focus:border-[#E91E63]" onChange={handleChange} />
                 <input name="name" placeholder="Nome Completo" className="bg-gray-50 border-gray-200 border p-3 rounded text-sm outline-none focus:border-[#E91E63]" onChange={handleChange} />
               </div>
            </div>
            <div className="bg-white p-6 rounded border border-gray-200">
               <h3 className="font-black text-gray-900 mb-4 uppercase flex items-center gap-2 text-lg"><MapPin size={20} /> Endereço</h3>
               <div className="grid grid-cols-3 gap-4">
                 <input name="cep" placeholder="CEP" className="bg-gray-50 border-gray-200 border p-3 rounded text-sm outline-none focus:border-[#E91E63] col-span-1" />
                 <input name="address" placeholder="Endereço" className="bg-gray-50 border-gray-200 border p-3 rounded text-sm outline-none focus:border-[#E91E63] col-span-2" onChange={handleChange} />
                 <input name="number" placeholder="Número" className="bg-gray-50 border-gray-200 border p-3 rounded text-sm outline-none focus:border-[#E91E63] col-span-1" onChange={handleChange} />
                 <input name="city" placeholder="Cidade" className="bg-gray-50 border-gray-200 border p-3 rounded text-sm outline-none focus:border-[#E91E63] col-span-2" />
               </div>
            </div>
            <div className="bg-white p-6 rounded border border-gray-200">
               <h3 className="font-black text-gray-900 mb-4 uppercase flex items-center gap-2 text-lg"><CreditCard size={20} /> Pagamento</h3>
               <div className="flex gap-3 mb-6">
                 <button className="flex-1 py-4 border-2 border-[#E91E63] bg-[#E91E63]/5 text-[#E91E63] font-bold rounded flex flex-col items-center justify-center gap-1 text-xs uppercase"><CreditCard size={20} /> Cartão de Crédito</button>
                 <button className="flex-1 py-4 border border-gray-200 text-gray-400 font-bold rounded flex flex-col items-center justify-center gap-1 text-xs uppercase hover:bg-gray-50">PIX (-5%)</button>
               </div>
               <div className="space-y-4">
                 <input name="cardNumber" placeholder="Número do Cartão" className="w-full bg-gray-50 border-gray-200 border p-3 rounded text-sm outline-none focus:border-[#E91E63]" onChange={handleChange} />
                 <input name="cardName" placeholder="Nome Impresso" className="w-full bg-gray-50 border-gray-200 border p-3 rounded text-sm outline-none focus:border-[#E91E63]" onChange={handleChange} />
                 <div className="grid grid-cols-2 gap-4">
                   <input name="expiry" placeholder="MM/AA" className="bg-gray-50 border-gray-200 border p-3 rounded text-sm outline-none focus:border-[#E91E63]" />
                   <input name="cvv" placeholder="CVV" className="bg-gray-50 border-gray-200 border p-3 rounded text-sm outline-none focus:border-[#E91E63]" onChange={handleChange} />
                 </div>
               </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-gray-50 p-6 rounded border border-gray-200 sticky top-24">
              <h3 className="font-black text-gray-900 mb-6 uppercase text-lg">Resumo</h3>
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3 text-sm border-b border-gray-200 pb-3 last:border-0">
                    <div className="w-12 h-12 bg-white rounded border border-gray-200 overflow-hidden shrink-0">
                      <img loading="lazy" src={item.image} className="w-full h-full object-cover" alt={item.name}/>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">qtd: {item.qty}</p>
                    </div>
                    <span className="font-bold text-gray-900">{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white border-2 border-dashed border-[#E91E63]/30 rounded-lg p-3 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#E91E63] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl">OFERTA ÚNICA</div>
                <div className="flex items-start gap-3">
                   <div className="w-14 h-14 bg-gray-100 rounded shrink-0">
                      <img loading="lazy" src={ORDER_BUMP_ITEM.image} className="w-full h-full object-cover rounded" alt={ORDER_BUMP_ITEM.name}/>
                   </div>
                   <div>
                      <p className="text-xs font-black text-gray-900 uppercase leading-tight mb-1">{ORDER_BUMP_ITEM.name}</p>
                      <p className="text-sm font-bold text-[#E91E63]">{formatPrice(ORDER_BUMP_ITEM.price)}</p>
                   </div>
                </div>
                <div className="mt-3 flex items-center gap-2 cursor-pointer" onClick={handleBumpToggle}>
                   <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${bumpAdded ? 'bg-[#E91E63] border-[#E91E63]' : 'border-gray-300'}`}>
                      {bumpAdded && <CheckCircle size={14} className="text-white" />}
                   </div>
                   <span className="text-xs font-bold text-gray-600 select-none">Sim, quero aproveitar esta oferta!</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatPrice(cartSubTotal)}</span></div>
                <div className="flex justify-between text-gray-500">
                    <span>Frete (Expresso)</span>
                    <span className={shippingCost === 0 ? "text-green-600 font-bold" : "text-gray-900"}>
                        {shippingCost === 0 ? "Grátis" : formatPrice(shippingCost)}
                    </span>
                </div>
                {bumpAdded && (
                    <div className="flex justify-between text-[#E91E63] font-bold">
                        <span>Oferta Especial</span>
                        <span>{formatPrice(ORDER_BUMP_ITEM.price)}</span>
                    </div>
                )}
                <div className="flex justify-between text-xl font-black text-gray-900 pt-4 border-t border-gray-200 mt-2">
                  <span>Total</span><span>{formatPrice(finalTotal)}</span>
                </div>
              </div>
              <Button className="w-full mt-6 h-14 text-base" onClick={() => handlePaymentProcess(formData)} loading={paymentStatus === 'processing'}>
                FINALIZAR COMPRA
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CartDrawer = () => (
    <div className={`fixed inset-0 z-[60] ${isCartOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsCartOpen(false)} />
      <div className={`absolute top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl transform transition-transform duration-300 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 className="font-black text-xl uppercase flex items-center gap-2"><ShoppingBag className="text-[#E91E63]" /> Sua Sacola</h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-10 text-gray-400"><p>Sua sacola está vazia.</p><Button variant="ghost" className="mt-4" onClick={() => setIsCartOpen(false)}>Começar a comprar</Button></div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 animate-fade-in">
                <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                  <img loading="lazy" src={item.image} className="w-full h-full object-cover" alt={item.name}/>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div><h4 className="text-sm font-bold text-gray-900 line-clamp-2">{item.name}</h4><p className="text-xs text-gray-500 mt-1">{formatPrice(item.price)} un.</p></div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-300 rounded h-8">
                       <button onClick={() => item.qty === 1 ? removeFromCart(item.id) : updateQty(item.id, item.qty - 1)} className="px-2 h-full hover:bg-gray-100 text-gray-600"><Minus size={12}/></button>
                       <span className="px-2 text-xs font-bold">{item.qty}</span>
                       <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-2 h-full hover:bg-gray-100 text-gray-600"><Plus size={12}/></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 font-bold hover:underline">Remover</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-5 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4"><span className="text-gray-600 font-medium">Subtotal</span><span className="text-xl font-black text-gray-900">{formatPrice(cartSubTotal)}</span></div>
            <Button className="w-full py-4 text-base shadow-lg shadow-[#E91E63]/30" onClick={() => { setIsCartOpen(false); setCurrentRoute('checkout'); }}>Finalizar Compra</Button>
          </div>
        )}
      </div>
    </div>
  );

  const Footer = () => (
    <footer className="bg-black text-white pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <h4 className="font-black text-xl mb-6 text-[#E91E63]">PINK STORE</h4>
            <p className="text-gray-400 text-sm leading-relaxed">A marca revolucionária de beleza. Produtos de alta performance com preços acessíveis para você brilhar.</p>
          </div>
          <div><h5 className="font-bold text-sm uppercase mb-4 tracking-widest">Institucional</h5><ul className="space-y-2 text-sm text-gray-400"><li><a href="#" className="hover:text-white">Sobre a Marca</a></li><li><a href="#" className="hover:text-white">Trabalhe Conosco</a></li><li><a href="#" className="hover:text-white">Política de Privacidade</a></li></ul></div>
          <div><h5 className="font-bold text-sm uppercase mb-4 tracking-widest">Ajuda</h5><ul className="space-y-2 text-sm text-gray-400"><li><a href="#" className="hover:text-white">Trocas e Devoluções</a></li><li><a href="#" className="hover:text-white">Fale Conosco</a></li><li><a href="#" className="hover:text-white">Rastrear Pedido</a></li></ul></div>
          <div><h5 className="font-bold text-sm uppercase mb-4 tracking-widest">Pagamento</h5><div className="flex gap-2 text-gray-400"><CreditCard /><CreditCard /><CreditCard /></div></div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-xs text-gray-500"><p>© 2025 Pink Store. Todos os direitos reservados.</p></div>
      </div>
    </footer>
  );

  return (
    <div className="font-sans bg-white min-h-screen text-gray-900">
      <NavBar />
      <main>
        {currentRoute === 'home' && <HomePage />}
        {currentRoute === 'product' && <ProductPage />}
        {currentRoute === 'checkout' && <CheckoutPage />}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
