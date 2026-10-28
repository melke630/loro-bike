/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Search,
  Bike,
  Star,
  ThumbsUp,
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Heart,
  ChevronRight,
  Filter,
  User,
  LogIn,
  LogOut,
  MapPin,
  Tag,
  CreditCard,
  Layers,
  ArrowRight,
  Package,
  Sparkles,
  Eye,
  Info
} from 'lucide-react';

// --- DATA STRUCTURES (Baseados exatamente nos seus Models Mongoose) ---

interface Category {
  _id: string;
  name: string;
  image: string;
}

interface SubCategory {
  _id: string;
  name: string;
  categoryId: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  discount: number; // Porcentagem de desconto
  stock: number;
  unit: string;
  category: string; // Nome ou ID
  subCategory: string;
  image: string[];
  description: string;
  more_details?: {
    quadro?: string;
    transmissao?: string;
    freios?: string;
    suspensao?: string;
    peso?: string;
    aro?: string;
  };
}

interface Review {
  _id: string;
  productId: string;
  userName: string;
  avatar?: string;
  rating: number;
  comment: string;
  helpful: number;
  helpfulByMe: boolean;
  createdAt: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Banner {
  _id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageDesktop: string;
  imageMobile: string;
  buttonText: string;
  redirectTo: string;
}

// --- DADOS INICIAIS DA LOJA LORO BIKE ---

const INITIAL_CATEGORIES: Category[] = [
  { _id: 'cat-1', name: 'Mountain Bike (MTB)', image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=400&q=80' },
  { _id: 'cat-2', name: 'Speed / Estrada', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=400&q=80' },
  { _id: 'cat-3', name: 'Bikes Elétricas (E-Bikes)', image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=400&q=80' },
  { _id: 'cat-4', name: 'Urbana & Casual', image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=400&q=80' },
  { _id: 'cat-5', name: 'Componentes & Peças', image: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?auto=format&fit=crop&w=400&q=80' },
  { _id: 'cat-6', name: 'Acessórios & Capacetes', image: 'https://images.unsplash.com/photo-1559348349-86f1f65817fe?auto=format&fit=crop&w=400&q=80' },
];

const INITIAL_BANNERS: Banner[] = [
  {
    _id: 'b1',
    title: 'TEMPORADA DE TRILHA 2026',
    subtitle: 'Até 25% OFF em Mountain Bikes com Shimano Deore 12V e Suspensão a Ar',
    badge: 'OFERTA DESTAQUE',
    imageDesktop: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1600&q=80',
    imageMobile: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    buttonText: 'Ver Bicicletas MTB',
    redirectTo: 'Mountain Bike (MTB)',
  },
  {
    _id: 'b2',
    title: 'NOVA ERA: E-BIKES LORO',
    subtitle: 'Autonomia de até 90km e motor Bosch Performance Line para você ir além',
    badge: 'LANÇAMENTO',
    imageDesktop: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1600&q=80',
    imageMobile: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80',
    buttonText: 'Explorar Elétricas',
    redirectTo: 'Bikes Elétricas (E-Bikes)',
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    _id: 'prod-1',
    name: 'Bicicleta Loro MTB Carbon Comp 29" Shimano Deore 12v',
    price: 6890,
    discount: 15,
    stock: 8,
    unit: 'un',
    category: 'Mountain Bike (MTB)',
    subCategory: 'Hardtail 29',
    image: [
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'A MTB perfeita para trilhas técnicas e maratonas. Quadro em fibra de carbono Toray T700, cabeamento 100% interno e grupo Shimano Deore M6100 de 12 velocidades com cassete 10-51D.',
    more_details: {
      quadro: 'Carbono Toray T700 Boost 148mm',
      transmissao: 'Shimano Deore M6100 12v (1x12)',
      freios: 'Shimano MT200 Hidráulico com Rotores 180/160mm',
      suspensao: 'RockShox Judy Silver TK Air 100mm com Trava Remota',
      peso: '11.8 kg',
      aro: '29" Tubeless Ready'
    }
  },
  {
    _id: 'prod-2',
    name: 'Bicicleta Loro Trail Pro Full Suspension 29"',
    price: 11490,
    discount: 10,
    stock: 5,
    unit: 'un',
    category: 'Mountain Bike (MTB)',
    subCategory: 'Full Suspension',
    image: [
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Domine descidas agressivas com conforto total. Sistema de suspensão dianteira e traseira RockShox com 130mm de curso e canote retrátil dropper de série.',
    more_details: {
      quadro: 'Alumínio 6061 Hidroformado Boost',
      transmissao: 'SRAM NX Eagle 12v',
      freios: 'SRAM Level T 4 Pistões',
      suspensao: 'RockShox Recon Silver 130mm + Shock Monarch R',
      peso: '13.9 kg',
      aro: '29" Boost'
    }
  },
  {
    _id: 'prod-3',
    name: 'Bicicleta Speed Loro Aero Road Carbon Shimano 105',
    price: 9200,
    discount: 0,
    stock: 4,
    unit: 'un',
    category: 'Speed / Estrada',
    subCategory: 'Aero Road',
    image: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Velocidade pura no asfalto. Geometria aerodinâmica refinada em túnel de vento, equipada com o consagrado grupo Shimano 105 R7000 com freios a disco hidráulicos.',
    more_details: {
      quadro: 'Ultra Carbon Aero Monocoque',
      transmissao: 'Shimano 105 11v (52x36D / 11-30D)',
      freios: 'Disco Hidráulico Shimano 105 Flat Mount',
      peso: '8.4 kg',
      aro: '700c Perfil 38mm Carbono'
    }
  },
  {
    _id: 'prod-4',
    name: 'E-Bike Urbana Loro Volt Smart 350W Bateria Integrada',
    price: 5990,
    discount: 12,
    stock: 10,
    unit: 'un',
    category: 'Bikes Elétricas (E-Bikes)',
    subCategory: 'Urbana Elétrica',
    image: [
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Vá ao trabalho ou pedale no fim de semana sem suar. Motor silencioso de 350W no cubo traseiro com sensor de torque inteligente e autonomia para até 65km.',
    more_details: {
      quadro: 'Alumínio 6061 com Bateria Oculta 36V 10.4Ah',
      transmissao: 'Shimano Altus 8v',
      freios: 'Tektro Disco Mecânico',
      peso: '18.2 kg',
      aro: '27.5" x 2.10 Pneu Urbano Anti-furo'
    }
  },
  {
    _id: 'prod-5',
    name: 'Capacete Loro Enduro Aero Pro com Tecnologia MIPS',
    price: 349,
    discount: 20,
    stock: 25,
    unit: 'un',
    category: 'Acessórios & Capacetes',
    subCategory: 'Capacetes',
    image: [
      'https://images.unsplash.com/photo-1559348349-86f1f65817fe?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Máxima proteção contra impactos rotacionais. Sistema MIPS integrado, 22 canais de ventilação e viseira ajustável removível.',
    more_details: {
      quadro: 'Casco In-mold Policarbonato com EPS de alta densidade',
      peso: '290g',
      aro: 'Tamanhos M (54-58cm) e G (58-62cm)'
    }
  },
  {
    _id: 'prod-6',
    name: 'Grupo Completo Shimano Deore M6100 1x12 Velocidades',
    price: 1890,
    discount: 8,
    stock: 14,
    unit: 'kit',
    category: 'Componentes & Peças',
    subCategory: 'Transmissão',
    image: [
      'https://images.unsplash.com/photo-1511994298241-608e28f14fde?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Kit completo original Shimano com pedivela direct mount 32D, câmbio traseiro Shadow RD+, passador Rapidfire Plus, corrente e cassete 10-51D Micro Spline.',
    more_details: {
      transmissao: '12 Velocidades 10-51 dentes',
      peso: '2.1 kg (kit completo)'
    }
  }
];

const INITIAL_REVIEWS: Review[] = [
  {
    _id: 'rev-1',
    productId: 'prod-1',
    userName: 'Carlos Eduardo Mendes',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    comment: 'A bike é sensacional! O quadro de carbono é extremamente rígido na subida e absorve muito bem as pedras soltas. A entrega da Loja Loro Bike chegou em 3 dias aqui em Curitiba.',
    helpful: 14,
    helpfulByMe: false,
    createdAt: 'Há 2 dias'
  },
  {
    _id: 'rev-2',
    productId: 'prod-1',
    userName: 'Mariana Silveira',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    comment: 'Câmbio Deore 12v é um relógio suíço, troca de marcha até sob pressão na subida. Muito satisfeita!',
    helpful: 8,
    helpfulByMe: true,
    createdAt: 'Há 1 semana'
  },
  {
    _id: 'rev-3',
    productId: 'prod-4',
    userName: 'Roberto Guimarães',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    rating: 4,
    comment: 'Uso todo dia para ir ao centro. Subo a serra sem cansar nada. A bateria dura a semana toda de ida e volta.',
    helpful: 6,
    helpfulByMe: false,
    createdAt: 'Há 3 dias'
  }
];

export default function App() {
  // Navigation / View state
  const [activeTab, setActiveTab] = useState<'store' | 'api-docs'>('store');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([
    { product: INITIAL_PRODUCTS[0], quantity: 1 }
  ]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Reviews state (simulando review.controller.js)
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState<string>('');

  // User auth state (simulando user.controller.js)
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>({
    name: 'Cliente Loro Bike',
    email: 'cliente@lorobike.com.br',
    role: 'USER'
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  // Checkout order confirmation modal (simulando order.controller.js)
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [address, setAddress] = useState({
    street: 'Av. das Bicicletas, 1250',
    city: 'São Paulo',
    state: 'SP',
    cep: '01310-100'
  });

  // Filter products by category and search term
  const filteredProducts = useMemo(() => {
    return INITIAL_PRODUCTS.filter((prod) => {
      const matchesCategory =
        selectedCategory === 'Todas' || prod.category === selectedCategory;
      const matchesSearch =
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Cart operations
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => {
    const finalPrice = item.product.discount
      ? item.product.price * (1 - item.product.discount / 100)
      : item.product.price;
    return acc + finalPrice * item.quantity;
  }, 0);

  function handleAddToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  }

  function handleUpdateQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product._id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }

  function handleRemoveItem(productId: string) {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
  }

  // Handle Review Submission (simulando createReview do controller)
  function handleAddReview(productId: string) {
    if (!newReviewComment.trim()) return;
    const newRev: Review = {
      _id: `rev-${Date.now()}`,
      productId,
      userName: user ? user.name : 'Ciclista Anônimo',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      rating: newReviewRating,
      comment: newReviewComment,
      helpful: 0,
      helpfulByMe: false,
      createdAt: 'Agora mesmo'
    };
    setReviews([newRev, ...reviews]);
    setNewReviewComment('');
  }

  // Handle Toggle Helpful (simulando toggleHelpful do review.controller.js)
  function handleToggleHelpful(reviewId: string) {
    setReviews((prev) =>
      prev.map((r) => {
        if (r._id === reviewId) {
          const isHelpful = !r.helpfulByMe;
          return {
            ...r,
            helpfulByMe: isHelpful,
            helpful: isHelpful ? r.helpful + 1 : Math.max(0, r.helpful - 1)
          };
        }
        return r;
      })
    );
  }

  // Finalizar Compra Fake (simula cashOnDeliveryOrderController)
  async function handleCheckout() {
    if (cart.length === 0) return;
    setIsCheckingOut(true);

    setTimeout(() => {
      const fakeOrder = {
        orderId: `ORD_${Math.floor(100000 + Math.random() * 900000)}`,
        items: [...cart],
        totalAmt: cartSubtotal,
        address: `${address.street}, ${address.city} - ${address.state}`,
        date: new Date().toLocaleDateString('pt-BR'),
        paymentMethod: 'Pagamento na Entrega / Pix (Fake)'
      };
      setOrderSuccess(fakeOrder);
      setCart([]);
      setIsCheckingOut(false);
      setIsCartOpen(false);
    }, 1200);
  }

  // Auth Submit
  function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (authMode === 'login') {
      setUser({
        name: authForm.email.split('@')[0] || 'Ciclista',
        email: authForm.email,
        role: 'USER'
      });
    } else {
      setUser({
        name: authForm.name || 'Novo Usuário',
        email: authForm.email,
        role: 'USER'
      });
    }
    setIsAuthModalOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-slate-950 text-xs font-semibold px-4 py-1.5 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-black/20 px-2 py-0.5 rounded text-[11px] font-bold">FRETE GRÁTIS</span>
            <span>Para todo o Brasil em compras acima de R$ 499 na Loja Loro Bike!</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px]">
            <span>📞 WhatsApp: (11) 98765-4321</span>
            <span>📍 Rede: 192.168.0.108:8080</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <Bike className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  LORO <span className="text-emerald-400">BIKE</span>
                </span>
                <span className="hidden md:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  NEXT.JS 15 STORE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Sua loja especializada em Bikes de Alta Performance & Peças
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar bicicletas, quadros, Shimano, capacetes..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* User Controls & Cart Button */}
          <div className="flex items-center gap-2.5">
            {/* View switcher (Vitrine vs Backend Rotas) */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
              <button
                onClick={() => setActiveTab('store')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'store'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Vitrine da Loja
              </button>
              <button
                onClick={() => setActiveTab('api-docs')}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'api-docs'
                    ? 'bg-indigo-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rotas Next.js</span>
              </button>
            </div>

            {/* Auth Button */}
            {user ? (
              <div className="relative group">
                <button
                  onClick={() => setUser(null)}
                  title="Clique para Sair"
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 hover:border-rose-500/50 hover:text-rose-400 transition"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline truncate max-w-[90px]">{user.name}</span>
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-600 transition"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Entrar</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Carrinho</span>
              {totalItemsCount > 0 && (
                <span className="bg-slate-950 text-emerald-400 text-[10px] font-black px-1.5 py-0.5 rounded-full ml-0.5">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="px-4 pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar produtos, peças, aro 29..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </header>

      {/* VIEW 1: A LOJA COMPLETA (VITRINE) */}
      {activeTab === 'store' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {/* Hero Banner Carousel (Baseado no banner.controller.js) */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
            <div
              className="w-full h-64 sm:h-80 md:h-96 bg-cover bg-center transition-all duration-700 relative flex items-center"
              style={{ backgroundImage: `url(${INITIAL_BANNERS[0].imageDesktop})` }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

              {/* Banner Content */}
              <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-2xl space-y-3 sm:space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 tracking-wide uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  {INITIAL_BANNERS[0].badge}
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  {INITIAL_BANNERS[0].title}
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-slate-300 font-medium leading-relaxed">
                  {INITIAL_BANNERS[0].subtitle}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setSelectedCategory('Mountain Bike (MTB)')}
                    className="px-6 py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-white/10"
                  >
                    <span>{INITIAL_BANNERS[0].buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Perks Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Envio Rápido & Seguro</h4>
                <p className="text-[11px] text-slate-400">Bike enviada pré-montada</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Garantia Vitalícia</h4>
                <p className="text-[11px] text-slate-400">Em todos os quadros Loro</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <CreditCard className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">12x Sem Juros</h4>
                <p className="text-[11px] text-slate-400">Ou 10% de desconto no Pix</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <Bike className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Oficina Especializada</h4>
                <p className="text-[11px] text-slate-400">Revisão gratuita de 6 meses</p>
              </div>
            </div>
          </div>

          {/* Category Carousel / Filters (Baseado em category.controller.js) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Categorias da Loja</h3>
                <p className="text-xs text-slate-400">Selecione para filtrar os modelos e componentes</p>
              </div>
              {selectedCategory !== 'Todas' && (
                <button
                  onClick={() => setSelectedCategory('Todas')}
                  className="text-xs text-emerald-400 hover:underline font-semibold"
                >
                  Ver Todas as Categorias
                </button>
              )}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('Todas')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition flex items-center gap-2 border ${
                  selectedCategory === 'Todas'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Todos os Produtos ({INITIAL_PRODUCTS.length})</span>
              </button>

              {INITIAL_CATEGORIES.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition flex items-center gap-2.5 border ${
                    selectedCategory === cat.name
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img src={cat.image} alt={cat.name} className="w-5 h-5 rounded-full object-cover" />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Product Grid (Baseado em product.controller.js) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedCategory === 'Todas' ? 'Catálogo de Produtos' : selectedCategory}
                </h3>
                <p className="text-xs text-slate-400">
                  Mostrando {filteredProducts.length} itens disponíveis em estoque
                </p>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <Bike className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-white">Nenhum produto encontrado</h4>
                <p className="text-xs text-slate-400">
                  Tente alterar os termos da busca ou selecionar outra categoria.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('Todas');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const finalPrice = product.discount
                    ? product.price * (1 - product.discount / 100)
                    : product.price;

                  return (
                    <div
                      key={product._id}
                      className="group bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col"
                    >
                      {/* Image Preview & Badges */}
                      <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
                        <img
                          src={product.image[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Discount Badge */}
                        {product.discount > 0 && (
                          <div className="absolute top-3 left-3 bg-rose-500 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-xl shadow-lg">
                            -{product.discount}% OFF
                          </div>
                        )}
                        {/* Stock Badge */}
                        <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur text-slate-300 font-semibold text-[10px] px-2.5 py-1 rounded-xl border border-slate-800">
                          {product.stock} em estoque
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="font-semibold text-emerald-400">{product.category}</span>
                            <span>{product.subCategory}</span>
                          </div>

                          <h4
                            onClick={() => setSelectedProduct(product)}
                            className="text-sm font-bold text-white group-hover:text-emerald-300 transition line-clamp-2 cursor-pointer"
                          >
                            {product.name}
                          </h4>

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        </div>

                        {/* Price & Action */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <div>
                            {product.discount > 0 && (
                              <span className="text-[11px] text-slate-500 line-through block">
                                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                            <div className="text-lg font-black text-white">
                              R$ {finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <span className="text-[10px] text-emerald-400 font-semibold">
                              em até 12x de R$ {(finalPrice / 12).toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedProduct(product)}
                              title="Ver Detalhes e Avaliações"
                              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-emerald-500/20 cursor-pointer"
                            >
                              <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Comprar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      )}

      {/* VIEW 2: PAINEL DE ROTAS E ARQUITETURA NEXT.JS 15 (BACKEND) */}
      {activeTab === 'api-docs' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Mapa de Rotas Next.js 15 da Loja Loro Bike</h2>
                <p className="text-xs text-slate-400">
                  Todas as 10 rotas do seu antigo <code>server.js</code> mapeadas para Route Handlers
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Autenticação & Usuários (/api/user)
                </span>
                <ul className="text-xs space-y-1 font-mono text-slate-300">
                  <li>POST /api/user/register ➔ Cadastro + E-mail Resend</li>
                  <li>POST /api/user/login ➔ Emissão de JWT em Cookies</li>
                  <li>GET /api/user/logout ➔ Limpeza de Cookies</li>
                  <li>GET /api/user/user-details ➔ Perfil autenticado</li>
                  <li>PUT /api/user/forgot-password ➔ Envio de OTP</li>
                  <li>PUT /api/user/verify-forgot-password-otp ➔ Validação</li>
                  <li>PUT /api/user/reset-password ➔ Nova senha</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                  Catálogo & Estoque (/api/product)
                </span>
                <ul className="text-xs space-y-1 font-mono text-slate-300">
                  <li>POST /api/product/create ➔ Cadastro de produto</li>
                  <li>POST /api/product/get ➔ Paginação e Busca $text</li>
                  <li>POST /api/product/get-product-by-category ➔ Filtros</li>
                  <li>POST /api/product/search-product ➔ Busca rápida</li>
                  <li>PUT /api/product/update-product ➔ Edição de estoque</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Carrinho & Checkout (/api/cart & /api/order)
                </span>
                <ul className="text-xs space-y-1 font-mono text-slate-300">
                  <li>POST /api/cart/add ➔ Adiciona item e vincula ao User</li>
                  <li>GET /api/cart/get ➔ Itens com populate do produto</li>
                  <li>PUT /api/cart/update-qty ➔ Atualização de quantidade</li>
                  <li>DELETE /api/cart/delete ➔ Remoção de item</li>
                  <li>POST /api/order/cash-on-delivery ➔ Validação & Baixa de estoque</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                  Avaliações & Mídia (/api/review & /api/file)
                </span>
                <ul className="text-xs space-y-1 font-mono text-slate-300">
                  <li>POST /api/review/create ➔ Avaliação com estrelas</li>
                  <li>GET /api/review/product/[id] ➔ Lista + Média calculada</li>
                  <li>POST /api/review/[id]/helpful ➔ Votação de utilidade</li>
                  <li>POST /api/file/upload ➔ Upload direto no Cloudinary</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setActiveTab('store')}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Voltar para a Loja Visual
              </button>
            </div>
          </div>
        </main>
      )}

      {/* MODAL: DETALHES DO PRODUTO & AVALIAÇÕES (Baseado em review.controller.js) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl my-8">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-emerald-400 font-semibold">{selectedProduct.category}</span>
                <span>/</span>
                <span>{selectedProduct.subCategory}</span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Product Top Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={selectedProduct.image[0]}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white leading-snug">{selectedProduct.name}</h3>

                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">(4.9 de 5 baseado em clientes)</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-slate-400">Preço Especial:</span>
                    <div className="text-2xl font-black text-emerald-400">
                      R${' '}
                      {(
                        selectedProduct.discount
                          ? selectedProduct.price * (1 - selectedProduct.discount / 100)
                          : selectedProduct.price
                      ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-xs text-slate-400 block">
                      Disponível em estoque ({selectedProduct.stock} unidades)
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
                    <span>Adicionar ao Carrinho</span>
                  </button>
                </div>
              </div>

              {/* Technical Specs */}
              {selectedProduct.more_details && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-400" />
                    Ficha Técnica & Componentes
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(selectedProduct.more_details).map(([key, val]) => (
                      <div key={key} className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                        <span className="text-slate-400 capitalize">{key}:</span>
                        <span className="text-slate-200 font-medium">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Section (Baseada em review.controller.js) */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white">Avaliações de Clientes</h4>
                  <span className="text-xs text-slate-400">
                    {reviews.filter((r) => r.productId === selectedProduct._id).length} avaliações
                  </span>
                </div>

                {/* Add Review Box */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-white block">Escreva sua avaliação:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewReviewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= newReviewRating ? 'fill-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-slate-400 ml-2">Nota: {newReviewRating} de 5</span>
                  </div>
                  <textarea
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="Conte como foi sua experiência com este produto..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    rows={2}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleAddReview(selectedProduct._id)}
                      className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition"
                    >
                      Enviar Avaliação
                    </button>
                  </div>
                </div>

                {/* Review Items */}
                <div className="space-y-3">
                  {reviews
                    .filter((r) => r.productId === selectedProduct._id)
                    .map((rev) => (
                      <div key={rev._id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {rev.avatar ? (
                              <img src={rev.avatar} alt={rev.userName} className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold">
                                {rev.userName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <span className="text-xs font-bold text-white block">{rev.userName}</span>
                              <span className="text-[10px] text-slate-500">{rev.createdAt}</span>
                            </div>
                          </div>
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((st) => (
                              <Star
                                key={st}
                                className={`w-3.5 h-3.5 ${
                                  st <= rev.rating ? 'fill-amber-400' : 'text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>

                        {/* Toggle Helpful Button (igual ao seu review.controller.js) */}
                        <div className="pt-1 flex items-center gap-2">
                          <button
                            onClick={() => handleToggleHelpful(rev._id)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition ${
                              rev.helpfulByMe
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Foi útil? ({rev.helpful})</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: CARRINHO DE COMPRAS (Baseado em cart.controller.js) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
            {/* Cart Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Seu Carrinho</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'itens'}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <ShoppingCart className="w-12 h-12 text-slate-700 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Seu carrinho está vazio</h4>
                  <p className="text-xs text-slate-500">
                    Adicione mountain bikes, peças ou acessórios para continuar.
                  </p>
                </div>
              ) : (
                cart.map(({ product, quantity }) => {
                  const unitPrice = product.discount
                    ? product.price * (1 - product.discount / 100)
                    : product.price;

                  return (
                    <div
                      key={product._id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3"
                    >
                      <img
                        src={product.image[0]}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-900 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-white truncate">{product.name}</h5>
                        <span className="text-[11px] text-emerald-400 font-semibold block">
                          R$ {unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>

                        {/* Quantity Controller */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleUpdateQty(product._id, -1)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-white px-1.5">{quantity}</span>
                          <button
                            onClick={() => handleUpdateQty(product._id, 1)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(product._id)}
                        className="p-2 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cart Footer & Checkout */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span>R$ {cartSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Entrega</span>
                    <span className="text-emerald-400 font-semibold">GRÁTIS</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
                    <span>Total</span>
                    <span className="text-emerald-400">
                      R$ {cartSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {isCheckingOut ? (
                    <span>Validando estoque & fechando pedido...</span>
                  ) : (
                    <>
                      <span>Finalizar Compra (Cash On Delivery)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: SUCESSO DO PEDIDO (Baseado em order.controller.js) */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Pedido Realizado com Sucesso!</h3>
              <p className="text-xs text-slate-400">
                Seu pedido foi registrado no sistema e o estoque foi devidamente atualizado.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">ID do Pedido:</span>
                <span className="font-mono text-emerald-400 font-bold">{orderSuccess.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valor Total:</span>
                <span className="font-bold text-white">
                  R$ {orderSuccess.totalAmt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Endereço de Entrega:</span>
                <span className="text-slate-200">{orderSuccess.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status do Pagamento:</span>
                <span className="text-amber-400 font-bold">{orderSuccess.paymentMethod}</span>
              </div>
            </div>

            <button
              onClick={() => setOrderSuccess(null)}
              className="w-full py-3 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition"
            >
              Continuar Comprando na Loro Bike
            </button>
          </div>
        </div>
      )}

      {/* MODAL: LOGIN / CADASTRO (Baseado em user.controller.js) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {authMode === 'login' ? 'Entrar na Loja Loro Bike' : 'Criar Nova Conta'}
              </h3>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'register' && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Seu Nome:</label>
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    placeholder="João da Silva"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Seu E-mail:</label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  placeholder="ciclista@email.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Sua Senha:</label>
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition mt-2"
              >
                {authMode === 'login' ? 'Fazer Login' : 'Cadastrar Conta'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-800">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-xs text-emerald-400 hover:underline"
              >
                {authMode === 'login'
                  ? 'Não tem conta? Cadastre-se agora'
                  : 'Já possui cadastro? Fazer Login'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 mt-12 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Bike className="w-4 h-4" />
            </div>
            <span className="font-bold text-white">LOJA LORO BIKE © 2026</span>
            <span className="text-slate-600">|</span>
            <span>Next.js 15 Full-Stack E-commerce</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Segurança SSL 256-bit</span>
            <span>Conexão MongoDB Ativa</span>
            <span>Resend E-mails</span>
            <span>Cloudinary Mídia</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
