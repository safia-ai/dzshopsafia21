import { useState, useContext, useEffect } from 'react';
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import './App.css';

// Pages
import CheckoutPage from './CheckoutPage';
import OrderSuccess from './OrderSuccess';
import MyOrdersPage from './MyOrdersPage';
import ProfilePage from './ProfilePage';
import ProductDetailsPage from './ProductDetailsPage';
import CartPage from './CartPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import NotFoundPage from './NotFoundPage';

// Dashboards
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/VendorDashboard';

// Components
import PrivateRoute from './PrivateRoute';
import ProductCard from './produit';
import Piedpage from './footer';

// Contexts
import { CartProvider, CartContext } from './CartContext';
import { AuthProvider, AuthContext } from './AuthContext';


// ======================================================
// MAIN APP
// ======================================================

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();

  const { addToCart, nbItems } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);

  // ====================================================
  // STATES
  // ====================================================

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ====================================================
  // CATEGORIES
  // ====================================================

  const categories = [
    'Tous',
    'Audio',
    'Gaming',
    'Bureau',
    'Accessoires',
  ];

  // ====================================================
  // API URL
  // ====================================================

  const getApiBaseUrl = () => {
    const configuredApiUrl =
      import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const cleanUrl = configuredApiUrl.replace(/\/+$/, '');

    if (cleanUrl.endsWith('/api')) {
      return cleanUrl;
    }

    return `${cleanUrl}/api`;
  };

  // ====================================================
  // LOAD PRODUCTS FROM BACKEND
  // ====================================================

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError('');

        const apiBaseUrl = getApiBaseUrl();

        console.log(
          'Connexion API:',
          `${apiBaseUrl}/products`
        );

        const response = await fetch(
          `${apiBaseUrl}/products`
        );

        if (!response.ok) {
          throw new Error(
            `Erreur serveur: ${response.status}`
          );
        }

        const data = await response.json();

        console.log('Produits reçus:', data);

        if (!Array.isArray(data)) {
          throw new Error(
            'Le serveur n’a pas retourné une liste de produits.'
          );
        }

        const formattedProducts = data.map(
          (product, index) => ({
            ...product,

            id:
              product._id ||
              product.id ||
              index + 1,

            title:
              product.title ||
              product.nom ||
              'Produit sans nom',

            price:
              product.price ??
              product.prix ??
              0,

            category:
              product.category ||
              product.categorie ||
              'Divers',

            rating:
              product.rating ??
              4.8,
          })
        );

        setProductsList(formattedProducts);
      } catch (err) {
        console.error(
          'Erreur chargement produits:',
          err
        );

        setError(
          err.message ||
            'Impossible de charger les produits.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // ====================================================
  // ADD TO CART
  // ====================================================

  const handleAddToCart = (
    productId,
    qty = 1
  ) => {
    const product = productsList.find(
      (item) =>
        String(item.id) ===
        String(productId)
    );

    if (!product) {
      console.error(
        'Produit introuvable:',
        productId
      );
      return;
    }

    for (
      let index = 0;
      index < qty;
      index += 1
    ) {
      addToCart(product);
    }
  };

  // ====================================================
  // FILTER PRODUCTS
  // ====================================================

  const filteredProducts =
    productsList.filter((product) => {
      const title = String(
        product.title || ''
      ).toLowerCase();

      const search = searchTerm
        .toLowerCase()
        .trim();

      const matchName =
        title.includes(search);

      const matchCategory =
        selectedCategory === 'Tous' ||
        product.category ===
          selectedCategory;

      const matchPrice =
        maxPrice === '' ||
        Number(product.price) <=
          Number(maxPrice);

      return (
        matchName &&
        matchCategory &&
        matchPrice
      );
    });

  // ====================================================
  // SORT PRODUCTS
  // ====================================================

  const sortedProducts =
    [...filteredProducts].sort(
      (first, second) => {
        if (sortBy === 'asc') {
          return (
            Number(first.price) -
            Number(second.price)
          );
        }

        if (sortBy === 'desc') {
          return (
            Number(second.price) -
            Number(first.price)
          );
        }

        return 0;
      }
    );

  // ====================================================
  // LOGOUT
  // ====================================================

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="app-container">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <header className="navbar">

        {/* LOGO */}

        <div
          className="logo"
          onClick={() =>
            navigate('/')
          }
          style={{
            cursor: 'pointer',
          }}
        >
          <span>DZSHOP</span>
        </div>


        {/* NAVIGATION */}

        <nav className="nav-links">

          <button
            className={`nav-btn-link ${
              location.pathname === '/'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              navigate('/')
            }
          >
            Accueil
          </button>


          <button
            className={`nav-btn-link ${
              location.pathname ===
              '/produits'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              navigate('/produits')
            }
          >
            Produits
          </button>

        </nav>


        {/* NAV ACTIONS */}

        <div
          className="nav-actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >

          {/* ADMIN */}

          {user?.role === 'admin' && (
            <button
              className="btn-nav"
              onClick={() =>
                navigate('/admin')
              }
            >
              Administration
            </button>
          )}


          {/* VENDOR */}

          {(user?.role === 'vendor' ||
            user?.role === 'admin') && (
            <button
              className="btn-nav"
              onClick={() =>
                navigate(
                  '/vendor/dashboard'
                )
              }
            >
              Ma boutique
            </button>
          )}


          {/* CART */}

          {user?.role === 'client' && (
            <button
              className="btn-nav"
              onClick={() => navigate('/mes-commandes')}
            >
              Mes commandes
            </button>
          )}

          <button
            className="btn-nav"
            style={{
              position: 'relative',
            }}
            onClick={() =>
              navigate('/panier')
            }
          >
            🛒 Panier

            {nbItems > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: '#ef4444',
                  color: 'white',
                  fontSize: '0.75rem',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontWeight: 'bold',
                }}
              >
                {nbItems}
              </span>
            )}
          </button>


          {/* USER */}

          {user ? (

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >

              <button className="btn-nav" onClick={() => navigate('/profil')}>
                👤 Mon profil
              </button>


              <button
                className="btn-nav"
                onClick={
                  handleLogout
                }
                style={{
                  color: '#ef4444',
                  borderColor:
                    '#ef4444',
                  cursor: 'pointer',
                }}
              >
                Déconnexion
              </button>

            </div>

          ) : (

            <button
              className="btn-nav"
              onClick={() =>
                navigate('/login')
              }
            >
              👤 Connexion
            </button>

          )}

        </div>

      </header>


      {/* ==================================================
          ROUTES
      ================================================== */}

      <Routes>


        {/* =================================================
            HOME
        ================================================= */}

        <Route
          path="/"
          element={

            <main>

              <section className="hero">

                <h1>
                  Bienvenue sur DZShop
                </h1>

                <p>
                  Le meilleur de
                  l'électronique,
                  livré partout en
                  Algérie.
                </p>

                <button
                  className="btn-hero"
                  onClick={() =>
                    navigate(
                      '/produits'
                    )
                  }
                >
                  Découvrir nos produits
                </button>

              </section>


              <section className="features">


                <div className="feature-item">

                  <span
                    style={{
                      fontSize: '2rem',
                    }}
                  >
                    🚚
                  </span>

                  <h3>
                    Livraison 58 wilayas
                  </h3>

                  <p>
                    Gratuite dès
                    10 000 DZD d'achat
                  </p>

                </div>


                <div className="feature-item">

                  <span
                    style={{
                      fontSize: '2rem',
                    }}
                  >
                    🔒
                  </span>

                  <h3>
                    Paiement à la livraison
                  </h3>

                  <p>
                    Vous payez à la
                    réception
                  </p>

                </div>


                <div className="feature-item">

                  <span
                    style={{
                      fontSize: '2rem',
                    }}
                  >
                    🔄
                  </span>

                  <h3>
                    Retour sous 7 jours
                  </h3>

                  <p>
                    Produit non conforme ?
                    On le reprend
                  </p>

                </div>


              </section>

            </main>
          }
        />


        {/* =================================================
            PRODUCTS
        ================================================= */}

        <Route
          path="/produits"
          element={

            <main
              className="products-container"
            >

              {/* SEARCH */}

              <div className="search-wrapper">


                {/* CATEGORY TABS */}

                <div className="search-tabs">

                  {categories.map(
                    (category) => (

                      <button
                        key={category}
                        className={`search-tab-pill ${
                          selectedCategory ===
                          category
                            ? 'active'
                            : ''
                        }`}
                        onClick={() =>
                          setSelectedCategory(
                            category
                          )
                        }
                      >

                        {category ===
                        'Tous'
                          ? '✨ Tous'
                          : category ===
                            'Audio'
                          ? '🎧 Audio'
                          : category ===
                            'Gaming'
                          ? '🎮 Gaming'
                          : category ===
                            'Bureau'
                          ? '💻 Bureau'
                          : '⌚ Accessoires'}

                      </button>

                    )
                  )}

                </div>


                {/* SEARCH BAR */}

                <div className="search-bar-card">


                  {/* PRODUCT SEARCH */}

                  <div className="search-field">

                    <span className="field-label">
                      Produit
                    </span>

                    <input
                      type="text"
                      placeholder="Que cherchez-vous ?"
                      value={
                        searchTerm
                      }
                      onChange={(
                        event
                      ) =>
                        setSearchTerm(
                          event.target
                            .value
                        )
                      }
                    />

                  </div>


                  <div className="field-divider" />


                  {/* PRICE */}

                  <div className="search-field">

                    <span className="field-label">
                      Budget max
                    </span>

                    <input
                      type="number"
                      placeholder="ex: 10000 DZD"
                      value={
                        maxPrice
                      }
                      onChange={(
                        event
                      ) =>
                        setMaxPrice(
                          event.target
                            .value
                        )
                      }
                    />

                  </div>


                  <div className="field-divider" />


                  {/* WILAYA */}

                  <div className="search-field">

                    <span className="field-label">
                      Wilaya
                    </span>

                    <input
                      type="text"
                      placeholder="58 Wilayas"
                      readOnly
                      style={{
                        cursor:
                          'default',
                      }}
                    />

                  </div>


                  {/* SEARCH BUTTON */}

                  <button
                    className="btn-search-action"
                    onClick={() => {
                      // Le filtrage se fait
                      // automatiquement
                    }}
                  >
                    🔍 Rechercher
                  </button>

                </div>

              </div>


              {/* PRODUCTS HEADER */}

              <div
                className="products-header"
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'center',
                  margin:
                    '2rem 0 1.5rem 0',
                }}
              >

                <h2>
                  Tous nos Produits (
                  {
                    sortedProducts.length
                  }
                  )
                </h2>


                {/* SORT */}

                <div
                  className="sort-container"
                  style={{
                    display: 'flex',
                    alignItems:
                      'center',
                    gap: '8px',
                  }}
                >

                  <label
                    htmlFor="sort-select"
                    style={{
                      fontSize:
                        '0.9rem',
                      color:
                        '#64748b',
                    }}
                  >
                    Trier par :
                  </label>


                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(
                      event
                    ) =>
                      setSortBy(
                        event.target
                          .value
                      )
                    }
                    style={{
                      padding:
                        '6px 12px',
                      borderRadius:
                        '8px',
                      border:
                        '1px solid #cbd5e1',
                      backgroundColor:
                        '#ffffff',
                      fontSize:
                        '0.9rem',
                      outline:
                        'none',
                      cursor:
                        'pointer',
                    }}
                  >

                    <option value="default">
                      Par défaut
                    </option>

                    <option value="asc">
                      Prix : Croissant 📈
                    </option>

                    <option value="desc">
                      Prix : Décroissant 📉
                    </option>

                  </select>

                </div>

              </div>


              {/* PRODUCTS GRID */}

              <div
                className="products-grid"
              >

                {/* LOADING */}

                {loading && (

                  <p
                    style={{
                      gridColumn:
                        '1 / -1',
                      textAlign:
                        'center',
                      color:
                        '#64748b',
                      padding:
                        '3rem',
                    }}
                  >
                    Chargement des
                    produits...
                  </p>

                )}


                {/* ERROR */}

                {!loading &&
                  error && (

                    <div
                      style={{
                        gridColumn:
                          '1 / -1',
                        textAlign:
                          'center',
                        padding:
                          '3rem',
                      }}
                    >

                      <p
                        style={{
                          color:
                            '#ef4444',
                          marginBottom:
                            '1rem',
                        }}
                      >
                        {error}
                      </p>


                      <button
                        className="btn-nav"
                        onClick={() =>
                          window.location
                            .reload()
                        }
                      >
                        Réessayer
                      </button>

                    </div>

                  )}


                {/* PRODUCTS */}

                {!loading &&
                  !error &&
                  sortedProducts.length >
                    0 && (

                    sortedProducts.map(
                      (item) => (

                        <ProductCard
                          key={item.id}
                          {...item}
                          onAddToCart={
                            handleAddToCart
                          }
                        />

                      )
                    )

                  )}


                {/* EMPTY */}

                {!loading &&
                  !error &&
                  sortedProducts.length ===
                    0 && (

                    <p
                      style={{
                        gridColumn:
                          '1 / -1',
                        textAlign:
                          'center',
                        color:
                          '#64748b',
                        padding:
                          '3rem',
                      }}
                    >
                      Aucun produit ne
                      correspond à votre
                      recherche.
                    </p>

                  )}

              </div>

            </main>
          }
        />


        {/* =================================================
            PRODUCT DETAILS
        ================================================= */}

        <Route
          path="/produit/:id"
          element={

            <ProductDetailsPage
              products={
                productsList
              }
              onAddToCart={
                handleAddToCart
              }
            />

          }
        />


        {/* =================================================
            CART
        ================================================= */}

        <Route
          path="/panier"
          element={
            <CartPage />
          }
        />


        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />


        {/* =================================================
            REGISTER
        ================================================= */}

        <Route
          path="/register"
          element={
            <RegisterPage />
          }
        />


        {/* =================================================
            CHECKOUT
        ================================================= */}

        <Route
          path="/checkout"
          element={

            <PrivateRoute
              requiredRole="client"
            >

              <CheckoutPage />

            </PrivateRoute>

          }
        />


        {/* =================================================
            ORDER SUCCESS
        ================================================= */}

        <Route
          path="/order-success"
          element={
            <OrderSuccess />
          }
        />

        <Route
          path="/mes-commandes"
          element={
            <PrivateRoute requiredRole="client">
              <MyOrdersPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/profil"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />


        {/* =================================================
            ADMIN DASHBOARD
        ================================================= */}

        <Route
          path="/admin"
          element={

            <PrivateRoute
              requiredRole="admin"
            >

              <AdminDashboard />

            </PrivateRoute>

          }
        />


        {/* =================================================
            VENDOR DASHBOARD
        ================================================= */}

        <Route
          path="/vendor/dashboard"
          element={

            <PrivateRoute
              requiredRole={[
                'vendor',
                'admin',
              ]}
            >

              <VendorDashboard />

            </PrivateRoute>

          }
        />


        {/* =================================================
            VENDOR ALTERNATIVE ROUTE
        ================================================= */}

        <Route
          path="/vendeur"
          element={

            <PrivateRoute
              requiredRole={[
                'vendor',
                'admin',
              ]}
            >

              <VendorDashboard />

            </PrivateRoute>

          }
        />


        {/* =================================================
            404 NOT FOUND
        ================================================= */}

        <Route
          path="*"
          element={
            <NotFoundPage />
          }
        />

      </Routes>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <Piedpage />

    </div>
  );
}


// ======================================================
// APP
// ======================================================

export default function App() {

  return (

    <AuthProvider>

      <CartProvider>

        <MainApp />

      </CartProvider>

    </AuthProvider>

  );
}