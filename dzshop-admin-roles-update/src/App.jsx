import { useState, useContext, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import CheckoutPage from './CheckoutPage';
import OrderSuccess from './OrderSuccess';
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
import PrivateRoute from './PrivateRoute';
import ProductCard from './produit';
import ProductDetailsPage from './ProductDetailsPage';
import Piedpage from './footer';
import CartPage from './CartPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import NotFoundPage from './NotFoundPage';
import { CartProvider, CartContext } from './CartContext';
import { AuthProvider, AuthContext } from './AuthContext';

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, nbItems } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = ['Tous', 'Audio', 'Gaming', 'Bureau', 'Accessoires'];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError('');

        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiBaseUrl}/products`);
        if (!response.ok) throw new Error('Impossible de charger les produits.');

        const products = await response.json();
        setProductsList(products.map((product, index) => ({
          ...product,
          id: product._id || index + 1,
          title: product.title || product.nom,
          price: product.price ?? product.prix,
          category: product.category || product.categorie || 'Divers',
          rating: product.rating || 4.8
        })));
      } catch (requestError) {
        setError(requestError.message || 'Une erreur est survenue lors du chargement.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleAddToCart = (productId, qty = 1) => {
    const product = productsList.find((item) => String(item.id) === String(productId));
    if (product) {
      for (let index = 0; index < qty; index += 1) addToCart(product);
    }
  };

  const filteredProducts = productsList.filter((product) => {
    const matchName = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'Tous' || product.category === selectedCategory;
    const matchPrice = maxPrice === '' || product.price <= Number(maxPrice);
    return matchName && matchCategory && matchPrice;
  });

  const sortedProducts = [...filteredProducts].sort((first, second) => {
    if (sortBy === 'asc') return first.price - second.price;
    if (sortBy === 'desc') return second.price - first.price;
    return 0;
  });

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span>DZSHOP</span>
        </div>
        <nav className="nav-links">
          <button className={`nav-btn-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>Accueil</button>
          <button className={`nav-btn-link ${location.pathname === '/produits' ? 'active' : ''}`} onClick={() => navigate('/produits')}>Produits</button>
        </nav>
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user?.role === 'admin' && <button className="btn-nav" onClick={() => navigate('/admin')}>Administration</button>}
          {(user?.role === 'vendor' || user?.role === 'admin') && <button className="btn-nav" onClick={() => navigate('/vendor/dashboard')}>Ma boutique</button>}
          <button className="btn-nav" style={{ position: 'relative' }} onClick={() => navigate('/panier')}>
            🛒 Panier
            {nbItems > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', fontSize: '0.75rem', borderRadius: '50%', padding: '2px 6px', fontWeight: 'bold' }}>{nbItems}</span>}
          </button>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>👤 {user.nom}</span>
              <button className="btn-nav" onClick={logout} style={{ color: '#ef4444', borderColor: '#ef4444', cursor: 'pointer' }}>Déconnexion</button>
            </div>
          ) : <button className="btn-nav" onClick={() => navigate('/login')}>👤 Connexion</button>}
        </div>
      </header>

      <Routes>
        <Route path="/" element={<main><section className="hero"><h1>Bienvenue sur DZShop</h1><p>Le meilleur de l'électronique, livré partout en Algérie.</p><button className="btn-hero" onClick={() => navigate('/produits')}>Découvrir nos produits</button></section><section className="features"><div className="feature-item"><span style={{ fontSize: '2rem' }}>🚚</span><h3>Livraison 58 wilayas</h3><p>Gratuite dès 10 000 DZD d'achat</p></div><div className="feature-item"><span style={{ fontSize: '2rem' }}>🔒</span><h3>Paiement à la livraison</h3><p>Vous payez à la réception</p></div><div className="feature-item"><span style={{ fontSize: '2rem' }}>🔄</span><h3>Retour sous 7 jours</h3><p>Produit non conforme ? On le reprend</p></div></section></main>} />
        <Route path="/produits" element={<main className="products-container"><div className="search-wrapper"><div className="search-tabs">{categories.map((category) => <button key={category} className={`search-tab-pill ${selectedCategory === category ? 'active' : ''}`} onClick={() => setSelectedCategory(category)}>{category === 'Tous' ? '✨ Tous' : category === 'Audio' ? '🎧 Audio' : category === 'Gaming' ? '🎮 Gaming' : category === 'Bureau' ? '💻 Bureau' : '⌚ Accessoires'}</button>)}</div><div className="search-bar-card"><div className="search-field"><span className="field-label">Produit</span><input type="text" placeholder="Que cherchez-vous ?" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></div><div className="field-divider"></div><div className="search-field"><span className="field-label">Budget max</span><input type="number" placeholder="ex: 10000 DZD" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} /></div><div className="field-divider"></div><div className="search-field"><span className="field-label">Wilaya</span><input type="text" placeholder="58 Wilayas" readOnly style={{ cursor: 'default' }} /></div><button className="btn-search-action">🔍 Rechercher</button></div></div><div className="products-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0 1.5rem 0' }}><h2>Tous nos Produits ({sortedProducts.length})</h2><div className="sort-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><label htmlFor="sort-select" style={{ fontSize: '0.9rem', color: '#64748b' }}>Trier par :</label><select id="sort-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}><option value="default">Par défaut</option><option value="asc">Prix : Croissant 📈</option><option value="desc">Prix : Décroissant 📉</option></select></div></div><div className="products-grid">{loading ? <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b', padding: '3rem' }}>Chargement des produits...</p> : error ? <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#ef4444', padding: '3rem' }}>{error}</p> : sortedProducts.length > 0 ? sortedProducts.map((item) => <ProductCard key={item.id} {...item} onAddToCart={handleAddToCart} />) : <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b', padding: '3rem' }}>Aucun produit ne correspond à votre recherche.</p>}</div></main>} />
        <Route path="/produit/:id" element={<ProductDetailsPage products={productsList} onAddToCart={handleAddToCart} />} />
        <Route path="/panier" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/checkout" element={<PrivateRoute requiredRole="client"><CheckoutPage /></PrivateRoute>} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/admin" element={<PrivateRoute requiredRole="admin"><AdminDashboard /></PrivateRoute>} />
        <Route path="/vendor/dashboard" element={<PrivateRoute requiredRole={['vendor', 'admin']}><VendorDashboard /></PrivateRoute>} />
        <Route path="/vendeur" element={<PrivateRoute requiredRole={['vendor', 'admin']}><VendorDashboard /></PrivateRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Piedpage />
    </div>
  );
}

export default function App() {
  return <AuthProvider><CartProvider><MainApp /></CartProvider></AuthProvider>;
}
