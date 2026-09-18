import { useContext } from 'react';
import './navbar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from './CartContext';
import { AuthContext } from './AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { nbItems } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);

  return (
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
        <button 
          className={`nav-btn-link ${location.pathname === '/admin' ? 'active' : ''}`} 
          onClick={() => navigate('/admin')}
        >
          Admin
        </button>
      </nav>

      <div className="nav-actions">
        <button 
          className="btn-nav" 
          style={{ position: 'relative' }} 
          onClick={() => navigate('/panier')}
        >
          🛒 Panier
          {nbItems > 0 && (
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
              {nbItems}
            </span>
          )}
        </button>
        {user ? (
          <button className="btn-nav" onClick={logout}>👤 Déconnexion</button>
        ) : (
          <button className="btn-nav" onClick={() => navigate('/login')}>👤 Connexion</button>
        )}
      </div>
    </header>
  );
}

export default Navbar;