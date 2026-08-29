import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import ProductCard from './produit';
import ProductDetailsPage from './ProductDetailsPage';
import Dashboard from './dashboard';
import Piedpage from './footer';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [cartCount, setCartCount] = useState(0);

  const categories = ['Tous', 'Audio', 'Gaming', 'Bureau', 'Accessoires'];

  const productsList = [
    {
      id: 1,
      title: "Casque Sans Fil Bluetooth Pro",
      price: 8500,
      oldPrice: 10500,
      category: "Audio",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
      description: "Casque haute fidélité avec réduction de bruit active, basses profondes et autonomie longue durée.",
      rating: 4.9,
      discount: 20
    },
    {
      id: 2,
      title: "Montre Connectée Smartwatch V2",
      price: 12000,
      category: "Accessoires",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
      description: "Suivi santé complet (rythme cardiaque, sommeil, SpO2), écran AMOLED haute définition et autonomie 7 jours.",
      rating: 4.7,
      isNew: true
    },
    {
      id: 3,
      title: "Clavier Mécanique RGB Gaming",
      price: 9500,
      oldPrice: 11000,
      category: "Gaming",
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80",
      description: "Switches mécaniques rapides et durables, rétroéclairage RGB personnalisable et repose-poignets confortable.",
      rating: 4.8,
      discount: 15
    },
    {
      id: 4,
      title: "Souris Ergonomique Sans Fil",
      price: 4500,
      category: "Bureau",
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80",
      description: "Design ergonomique vertical réduisant la fatigue du poignet, capteur optique précis et clics silencieux.",
      rating: 4.6,
      isNew: true
    },
  ];

  const handleAddToCart = (productId, qty = 1) => {
    setCartCount((prev) => prev + qty);
  };

  const filteredProducts = productsList.filter((product) => {
    const matchName = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'Tous' || product.category === selectedCategory;
    const matchPrice = maxPrice === '' || product.price <= Number(maxPrice);
    return matchName && matchCat && matchPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'asc') return a.price - b.price;
    if (sortBy === 'desc') return b.price - a.price;
    return 0;
  });

  return (
    <div className="app-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span>DZSHOP</span>
        </div>
        
        <nav className="nav-links">
          <button 
            className={`nav-btn-link ${location.pathname === '/' ? 'active' : ''}`} 
            onClick={() => navigate('/')}
          >
            Accueil
          </button>
          <button 
            className={`nav-btn-link ${location.pathname === '/produits' ? 'active' : ''}`} 
            onClick={() => navigate('/produits')}
          >
            Produits
          </button>
          <button 
            className={`nav-btn-link ${location.pathname === '/dashboard' ? 'active' : ''}`} 
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </button>
        </nav>

        <div className="nav-actions">
          <button className="btn-nav" style={{ position: 'relative' }}>
            🛒 Panier
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#ef4444',
                color: 'white',
                fontSize: '0.75rem',
                borderRadius: '50%',
                padding: '2px 6px',
                fontWeight: 'bold'
              }}>
                {cartCount}
              </span>
            )}
          </button>
          <button className="btn-nav">👤 Connexion</button>
        </div>
      </header>

      {/* الرابط التوجيهي (Routes) */}
      <Routes>
        {/* الصفحة الرئيسية */}
        <Route path="/" element={
          <main>
            <section className="hero">
              <h1>Bienvenue sur DZShop</h1>
              <p>Le meilleur de l'électronique, livré partout en Algérie.</p>
              <button className="btn-hero" onClick={() => navigate('/produits')}>
                Découvrir nos produits
              </button>
            </section>

            <section className="features">
              <div className="feature-item">
                <span style={{ fontSize: '2rem' }}>🚚</span>
                <h3>Livraison 58 wilayas</h3>
                <p>Gratuite dès 10 000 DZD d'achat</p>
              </div>
              <div className="feature-item">
                <span style={{ fontSize: '2rem' }}>🔒</span>
                <h3>Paiement à la livraison</h3>
                <p>Vous payez à la réception</p>
              </div>
              <div className="feature-item">
                <span style={{ fontSize: '2rem' }}>🔄</span>
                <h3>Retour sous 7 jours</h3>
                <p>Produit non conforme ? On le reprend</p>
              </div>
            </section>
          </main>
        } />

        {/* صفحة كل المنتجات */}
        <Route path="/produits" element={
          <main className="products-container">
            {/* شريط البحث */}
            <div className="search-wrapper">
              <div className="search-tabs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`search-tab-pill ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === 'Tous' ? '✨ Tous' : cat === 'Audio' ? '🎧 Audio' : cat === 'Gaming' ? '🎮 Gaming' : cat === 'Bureau' ? '💻 Bureau' : '⌚ Accessoires'}
                  </button>
                ))}
              </div>

              <div className="search-bar-card">
                <div className="search-field">
                  <span className="field-label">Produit</span>
                  <input 
                    type="text" 
                    placeholder="Que cherchez-vous ?" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="field-divider"></div>

                <div className="search-field">
                  <span className="field-label">Budget max</span>
                  <input 
                    type="number" 
                    placeholder="ex: 10000 DZD" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>

                <div className="field-divider"></div>

                <div className="search-field">
                  <span className="field-label">Wilaya</span>
                  <input 
                    type="text" 
                    placeholder="58 Wilayas" 
                    readOnly
                    style={{ cursor: 'default' }}
                  />
                </div>

                <button className="btn-search-action">
                  🔍 Rechercher
                </button>
              </div>
            </div>

            <div className="products-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0 1.5rem 0' }}>
              <h2>Tous nos Produits ({sortedProducts.length})</h2>

              <div className="sort-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="sort-select" style={{ fontSize: '0.9rem', color: '#64748b' }}>Trier par :</label>
                <select 
                  id="sort-select" 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="default">Par défaut</option>
                  <option value="asc">Prix : Croissant 📈</option>
                  <option value="desc">Prix : Décroissant 📉</option>
                </select>
              </div>
            </div>

            <div className="products-grid">
              {sortedProducts.length > 0 ? (
                sortedProducts.map((item) => (
                  <ProductCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    price={item.price}
                    oldPrice={item.oldPrice}
                    category={item.category}
                    image={item.image}
                    description={item.description}
                    rating={item.rating}
                    isNew={item.isNew}
                    discount={item.discount}
                    onAddToCart={handleAddToCart}
                  />
                ))
              ) : (
                <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b', padding: '3rem' }}>
                  Aucun produit ne correspond à votre recherche.
                </p>
              )}
            </div>
          </main>
        } />

        {/* المسار الديناميكي لصفحة تفاصيل المنتج بالـ ID */}
        <Route 
          path="/produit/:id" 
          element={<ProductDetailsPage products={productsList} onAddToCart={handleAddToCart} />} 
        />

        {/* مسار Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

      <Piedpage />
    </div>
  );
}

export default App;