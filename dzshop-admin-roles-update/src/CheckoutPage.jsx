import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';
import { AuthContext } from './AuthContext';
import api from './api/axios';
import { getImageUrl } from './utils/imageUrl';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, panier, total, livraison, clearCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const items = panier || cart || [];
  const subtotal = total !== undefined
    ? total
    : items.reduce((sum, item) => sum + (item.price || item.prix || 0) * (item.quantity || item.qte || 1), 0);
  const shipping = livraison !== undefined ? livraison : (subtotal >= 10000 || subtotal === 0 ? 0 : 500);
  const grandTotal = subtotal + shipping;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || items.length === 0) return;
    setSaving(true);
    setError('');

    if (!token || !user) {
      setError('Votre session a expiré. Veuillez vous reconnecter.');
      setSaving(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const order = {
      articles: items.map((item) => ({
        produit: item.id || item._id,
        qte: item.quantity || item.qte || 1
      })),
      adresse: [formData.get('fullName'), formData.get('commune'), formData.get('address'), formData.get('note')]
        .map((value) => String(value || '').trim())
        .filter(Boolean)
        .join(', '),
      telephone: `+213${formData.get('phone')}`,
      wilaya: formData.get('wilaya').trim()
    };

    try {
      const { data } = await api.post('/orders', order);
      clearCart();
      navigate('/order-success', { state: { order: data.order, orderId: data.orderId } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Impossible d’enregistrer la commande. Vérifiez votre connexion et réessayez.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="checkout-page">
      <div className="checkout-heading">
        <div>
          <span className="checkout-eyebrow">DZSHOP CHECKOUT</span>
          <h1>Finaliser votre commande</h1>
          <p>Renseignez vos coordonnées pour recevoir votre commande chez vous.</p>
        </div>
        <Link className="checkout-back" to="/panier">← Retour au panier</Link>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="checkout-section-heading">
            <span className="step-number">01</span>
            <div><h2>Vos coordonnées</h2><p>Où souhaitez-vous recevoir votre commande ?</p></div>
          </div>

          <div className="checkout-fields">
            <label className="checkout-field checkout-field-full"><span>Nom et prénom <b>*</b></span><input required name="fullName" type="text" autoComplete="name" defaultValue={user?.nom || user?.name || ''} placeholder="Votre nom complet" /></label>
            <label className="checkout-field checkout-field-full">
              <span>Téléphone <b>*</b></span>
              <div className="phone-input"><strong>+213</strong><input required name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" pattern="[567][0-9]{8}" maxLength="9" title="Saisissez les 9 chiffres après +213, en commençant par 5, 6 ou 7." placeholder="5XX XXX XXX" /></div>
            </label>
            <label className="checkout-field"><span>Wilaya <b>*</b></span><input required name="wilaya" type="text" autoComplete="address-level1" placeholder="Votre wilaya" /></label>
            <label className="checkout-field"><span>Commune <b>*</b></span><input required name="commune" type="text" autoComplete="address-level2" placeholder="Votre commune" /></label>
            <label className="checkout-field checkout-field-full"><span>Adresse exacte <b>*</b></span><textarea required name="address" autoComplete="street-address" rows="3" placeholder="Rue, numéro, bâtiment, quartier..." /></label>
            <label className="checkout-field checkout-field-full"><span>Remarque pour le livreur <small>(facultatif)</small></span><textarea name="note" rows="2" maxLength="500" placeholder="Repère ou précision utile" /></label>
          </div>

          <div className="checkout-payment">
            <span className="checkout-payment-icon" aria-hidden="true">دج</span>
            <span><strong>Paiement à la livraison</strong><small>Réglez votre commande à sa réception.</small></span>
            <input type="radio" name="payment" value="cash-on-delivery" checked readOnly aria-label="Paiement à la livraison sélectionné" />
          </div>
          {error && <p className="checkout-error" role="alert">{error}</p>}
          <button className="save-address-button" type="submit" disabled={saving || items.length === 0}>
            {saving ? <><span className="checkout-spinner" aria-hidden="true" /> Enregistrement...</> : 'Confirmer la commande'}
          </button>
        </form>

        <aside className="checkout-sidebar">
          <section className="summary-card">
            <div className="summary-title"><h2>Votre commande</h2><span>{items.length} article{items.length > 1 ? 's' : ''}</span></div>
            {items.length > 0 ? items.map((item) => {
              const quantity = item.quantity || item.qte || 1;
              const name = item.title || item.nom || 'Produit';
              const price = item.price || item.prix || 0;
              return (
                <div className="summary-item" key={item.id}>
                  {item.image && <img src={getImageUrl(item.image)} alt="" />}
                  <span>{name} <b>×{quantity}</b></span>
                  <strong>{(price * quantity).toLocaleString('fr-DZ')} DZD</strong>
                </div>
              );
            }) : <p className="empty-summary">Votre panier est vide.</p>}
            <div className="summary-line"><span>Sous-total</span><strong>{subtotal.toLocaleString('fr-DZ')} DZD</strong></div>
            <div className="summary-line"><span>Livraison</span><strong className={shipping === 0 ? 'free-shipping' : ''}>{shipping === 0 ? 'Gratuite' : `${shipping.toLocaleString('fr-DZ')} DZD`}</strong></div>
            <div className="summary-total"><span>Total</span><strong>{grandTotal.toLocaleString('fr-DZ')} DZD</strong></div>
          </section>

          <section className="trust-panel">
            <div className="trust-heading"><span className="trust-icon">✓</span><h3>Commande sécurisée</h3></div>
            <div className="trust-detail"><strong>Paiement simple</strong><span>Vous payez uniquement à la réception de votre colis.</span></div>
            <div className="trust-detail"><strong>Confirmation par téléphone</strong><span>Notre équipe vous appellera avant l’expédition.</span></div>
          </section>
        </aside>
      </div>
    </main>
  );
}