import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './RegisterPage.css';

export default function RegisterPage() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nom: '', email: '', password: '', confirmPassword: '', role: 'client' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const trimmedName = formData.nom.trim();
    const trimmedEmail = formData.email.trim();
    if (!trimmedName || !trimmedEmail || !formData.password || !formData.confirmPassword) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Veuillez saisir une adresse e-mail valide.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register({ nom: trimmedName, email: trimmedEmail, password: formData.password, role: formData.role });
      if (result.success) {
        if (result.user) {
          navigate(result.user.role === 'vendor' ? '/vendor/dashboard' : '/');
        } else {
          navigate('/login', { state: { successMessage: 'Votre compte a été créé. Vous pouvez maintenant vous connecter.' } });
        }
      } else {
        setError(result.message || 'Inscription impossible.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <section className="register-card">
        <div className="register-heading">
          <span className="register-logo">DZSHOP</span>
          <h1>Formulaire d'inscription</h1>
          <p>Remplissez soigneusement le formulaire pour créer votre compte.</p>
        </div>

        {error && <div className="register-error">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-field register-field-wide">
            <label htmlFor="register-name">Nom complet</label>
            <input id="register-name" name="nom" type="text" placeholder="Votre nom complet" required value={formData.nom} onChange={handleChange} />
          </div>

          <div className="register-field">
            <label htmlFor="register-email">Adresse e-mail</label>
            <input id="register-email" name="email" type="email" placeholder="exemple@email.com" required value={formData.email} onChange={handleChange} />
          </div>

          <div className="register-field">
            <label htmlFor="register-password">Mot de passe</label>
            <input id="register-password" name="password" type="password" placeholder="Minimum 6 caractères" required minLength="6" value={formData.password} onChange={handleChange} />
          </div>

          <div className="register-field">
            <label htmlFor="register-confirm-password">Confirmer le mot de passe</label>
            <input id="register-confirm-password" name="confirmPassword" type="password" placeholder="Répétez le mot de passe" required minLength="6" value={formData.confirmPassword} onChange={handleChange} />
          </div>

          <div className="register-field register-field-wide register-role-field">
            <span>Je m'inscris en tant que</span>
            <div className="register-role-options">
              <label className={`register-role-option ${formData.role === 'client' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="client"
                  checked={formData.role === 'client'}
                  onChange={handleChange}
                />
                <span className="register-role-icon">🛍️</span>
                <span>
                  <strong>Client</strong>
                  <small>Acheter des produits et suivre mes commandes</small>
                </span>
              </label>
              <label className={`register-role-option ${formData.role === 'vendor' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="vendor"
                  checked={formData.role === 'vendor'}
                  onChange={handleChange}
                />
                <span className="register-role-icon">🏪</span>
                <span>
                  <strong>Vendeur</strong>
                  <small>Gérer ma propre boutique sur DZSHOP</small>
                </span>
              </label>
            </div>
          </div>

          <button type="submit" className="register-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Création en cours...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="register-login-link">Vous avez déjà un compte ? <Link to="/login">Se connecter</Link></p>
      </section>
    </div>
  );
}
