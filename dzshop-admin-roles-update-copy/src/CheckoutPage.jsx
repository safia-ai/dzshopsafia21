import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';
import { AuthContext } from './AuthContext';
import api from './api/axios';
import './CheckoutPage.css';

const wilayas = ['Alger', 'Oran', 'Constantine', 'Blida', 'Sétif', 'Annaba'];

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
        nom: item.title || item.nom || 'Produit',
        prix: Number(item.price ?? item.prix ?? 0),
        qte: item.quantity || item.qte || 1
      })),
      total: grandTotal,
      adresse: [formData.get('city'), formData.get('postcode'), formData.get('district'), formData.get('street')]
        .filter(Boolean)
        .join(', '),
      telephone: formData.get('phone'),
      wilaya: formData.get('wilaya')
    };

    try {
      await api.post('/orders', order);
      clearCart();
      navigate('/order-success');
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Impossible d’enregistrer la commande.');
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
          <p>Livraison rapide et paiement à la réception partout en Algérie.</p>
        </div>
        <Link className="checkout-back" to="/panier">← Retour au panier</Link>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="checkout-section-heading">
            <span className="step-number">01</span>
            <div><h2>Adresse de livraison</h2><p>Où souhaitez-vous recevoir votre commande ?</p></div>
          </div>

          <div className="checkout-fields">
            <label className="checkout-field checkout-field-full"><span>Nom complet <b>*</b></span><input required name="fullName" type="text" placeholder="Votre nom complet" /></label>
            <label className="checkout-field checkout-field-full">
              <span>Téléphone <b>*</b></span>
              <div className="phone-input"><strong>DZ +213</strong><input required name="phone" type="tel" placeholder="06 00 00 00 00" /></div>
            </label>
            <label className="checkout-field"><span>Wilaya <b>*</b></span><select required name="wilaya" defaultValue=""><option value="" disabled>Choisir une wilaya</option>{wilayas.map((wilaya) => <option key={wilaya}>{wilaya}</option>)}</select></label>
            <label className="checkout-field"><span>Commune <b>*</b></span><input required name="city" type="text" placeholder="Votre commune" /></label>
            <label className="checkout-field"><span>Code postal <b>*</b></span><input required name="postcode" type="text" inputMode="numeric" placeholder="16000" /></label>
            <label className="checkout-field checkout-field-full"><span>Adresse détaillée <b>*</b></span><textarea required name="district" rows="3" placeholder="Quartier, cité, rue et numéro" /></label>
            <label className="checkout-field checkout-field-full"><span>Repère <small>(optionnel)</small></span><input name="street" type="text" placeholder="Un repère pour la livraison" /></label>
          </div>

          <label className="default-address"><input type="checkbox" /> <span>Make Default</span></label>
          <button className="save-address-button" type="submit" disabled={saving}>{saving ? 'ENREGISTREMENT...' : 'CONFIRMER LA COMMANDE'}</button>
          {error && <p className="checkout-error">{error}</p>}
        </form>

        <aside className="checkout-sidebar">
          <button className="continue-button" type="button" onClick={() => document.querySelector('.checkout-form')?.requestSubmit()}>CONTINUE <span>→</span></button>

          <section className="summary-card">
            <div className="summary-title"><h2>Order Summary</h2><span>{items.length} article{items.length > 1 ? 's' : ''}</span></div>
            {items.length > 0 ? items.map((item) => {
              const quantity = item.quantity || item.qte || 1;
              const name = item.title || item.nom || 'Produit';
              const price = item.price || item.prix || 0;
              return <div className="summary-item" key={item.id}><span>{name} <b>×{quantity}</b></span><strong>{(price * quantity).toLocaleString('fr-DZ')} DZD</strong></div>;
            }) : <p className="empty-summary">Votre panier est vide.</p>}
            <div className="summary-line"><span>Sous-total</span><strong>{subtotal.toLocaleString('fr-DZ')} DZD</strong></div>
            <div className="summary-line"><span>Livraison</span><strong className={shipping === 0 ? 'free-shipping' : ''}>{shipping === 0 ? 'Gratuite' : `${shipping.toLocaleString('fr-DZ')} DZD`}</strong></div>
            <div className="summary-total"><span>Total</span><strong>{grandTotal.toLocaleString('fr-DZ')} DZD</strong></div>
          </section>

          <section className="trust-panel">
            <div className="trust-heading"><span className="trust-icon">✓</span><h3>Payment Security</h3></div>
            <div className="payment-badges"><span>VISA</span><span>mastercard</span><span>ID CHECK</span></div>
            <div className="trust-detail"><strong>Security & Privacy</strong><span>Vos données sont protégées et confidentielles.</span></div>
            <div className="trust-detail"><strong>Secure Shipment Guarantee</strong><span>Suivi de livraison et assistance inclus.</span></div>
            <div className="trust-detail"><strong>Customer Support</strong><span>Une question ? Notre équipe est là pour vous.</span></div>
          </section>
        </aside>
      </div>
    </main>
  );
}