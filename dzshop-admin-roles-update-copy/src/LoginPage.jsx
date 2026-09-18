import { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage] = useState(location.state?.successMessage || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      if (result.user?.role === 'admin') navigate('/admin');
      else if (result.user?.role === 'vendor') navigate('/vendor/dashboard');
      else navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-page">
      <section className="login-showcase" aria-label="DZShop">
        <div className="showcase-orbit showcase-orbit-one"></div>
        <div className="showcase-orbit showcase-orbit-two"></div>
        <div className="showcase-content">
          <span className="showcase-mark">DZ</span>
          <p className="showcase-kicker">Bienvenue chez</p>
          <h1>DZSHOP</h1>
          <p>Retrouvez vos produits préférés et suivez vos commandes en toute simplicité.</p>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <p className="login-eyebrow">Espace client</p>
          <h2>Welcome Back!</h2>
          <p className="login-intro">Connectez-vous pour accéder à votre espace et continuer vos achats.</p>

          {error && <div className="login-error">{error}</div>}
          {successMessage && <div className="login-success" role="status">{successMessage}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="login-email">Email</label>
            <div className="login-input-wrap">
              <span aria-hidden="true">✉</span>
              <input id="login-email" type="email" placeholder="Entrez votre email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="password-label-row">
              <label htmlFor="login-password">Mot de passe</label>
              <button type="button" className="forgot-password">Mot de passe oublié ?</button>
            </div>
            <div className="login-input-wrap">
              <span aria-hidden="true">⌑</span>
              <input id="login-password" type="password" placeholder="Entrez votre mot de passe" required minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button type="submit" className="login-submit">Se connecter</button>
          </form>

          <div className="login-divider"><span>ou</span></div>
          <button type="button" className="social-login"><strong>G</strong> Continuer avec Google</button>
          <button type="button" className="social-login"><strong>●</strong> Continuer avec Apple</button>

          <p className="signup-prompt">Vous n'avez pas de compte ? <Link to="/register">Créer un compte</Link></p>
        </div>
      </section>
    </div>
  );
}