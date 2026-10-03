import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';
import { AuthContext } from './AuthContext';
import api from './api/axios';
import { getImageUrl } from './utils/imageUrl';
import './CheckoutPage.css';

const normalizeAlgerianPhone = (value) => String(value || '')
  .replace(/\D/g, '')
  .replace(/^213/, '')
  .replace(/^0/, '');

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, panier, clearCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('form');
  const [orderDetails, setOrderDetails] = useState(null);

  const cartItems = Array.isArray(cart) ? cart : [];
  const panierItems = Array.isArray(panier) ? panier : [];
  const items = panierItems.length > 0 ? panierItems : cartItems;
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || item.prix || 0) * Number(item.quantity || item.qte || 1), 0);
  const shipping = subtotal >= 10000 || subtotal === 0 ? 0 : 500;
  const grandTotal = subtotal + shipping;

  const buildOrderPayloadFromDetails = (details) => {
    if (!items.length || !details) return null;

    const tel = normalizeAlgerianPhone(details.telephone);
    const phone = tel ? `+213${tel}` : '';

    return {
      nomClient: String(details.nomClient || '').trim(),
      commune: String(details.commune || '').trim(),
      adresse: String(details.adresse || '').trim(),
      note: String(details.note || '').trim(),
      telephone: phone,
      wilaya: String(details.wilaya || '').trim(),
      modePaiement: 'Paiement à la livraison',
      articles: items.map((item) => {
        const productId = String(item._id || item.id);
        const quantity = Number(item.quantity || item.qte || 1);
        return {
          productId,
          quantity,
          produit: productId,
          qte: quantity
        };
      })
    };
  };

  const validateDetails = (details) => {
    const nomClient = String(details?.nomClient || '').trim();
    const commune = String(details?.commune || '').trim();
    const adresse = String(details?.adresse || '').trim();
    const wilaya = String(details?.wilaya || '').trim();
    const phoneDigits = normalizeAlgerianPhone(details?.telephone);

    if (!nomClient || !commune || !adresse || !wilaya || !phoneDigits || !/^[567]\d{8}$/.test(phoneDigits)) {
      setError('Veuillez remplir correctement tous les champs obligatoires, notamment le téléphone mobile algérien.');
      return false;
    }

    return true;
  };

  const validateForm = (form) => {
    if (!token || !user) {
      setError('Votre session a expiré. Veuillez vous reconnecter.');
      return false;
    }

    if (items.length === 0) {
      setError('Votre panier est vide. Ajoutez au moins un produit avant de commander.');
      return false;
    }

    const formData = new FormData(form);
    const nomClient = String(formData.get('fullName') || '').trim();
    const commune = String(formData.get('commune') || '').trim();
    const adresse = String(formData.get('address') || '').trim();
    const phoneDigits = normalizeAlgerianPhone(formData.get('phone'));
    const wilaya = String(formData.get('wilaya') || '').trim();

    if (!nomClient || !commune || !adresse || !wilaya || !phoneDigits || !/^[567]\d{8}$/.test(phoneDigits)) {
      setError('Veuillez remplir correctement tous les champs obligatoires, notamment le téléphone mobile algérien.');
      return false;
    }

    return true;
  };

  const handleGoToReview = (event) => {
    event.preventDefault();
    if (saving) return;

    if (!validateForm(event.currentTarget)) return;

    const formData = new FormData(event.currentTarget);
    setOrderDetails({
      nomClient: String(formData.get('fullName') || '').trim(),
      telephone: normalizeAlgerianPhone(formData.get('phone')),
      wilaya: String(formData.get('wilaya') || '').trim(),
      commune: String(formData.get('commune') || '').trim(),
      adresse: String(formData.get('address') || '').trim(),
      note: String(formData.get('note') || '').trim(),
    });
    setError('');
    setStep('confirm');
  };

  const handleConfirmOrder = async () => {
    if (saving) return;
    if (items.length === 0) {
      setError('Votre panier est vide. Ajoutez au moins un produit avant de confirmer.');
      return;
    }

    const payload = buildOrderPayloadFromDetails(orderDetails);
    if (!payload || !validateDetails(orderDetails)) return;

    setSaving(true);
    setError('');

    try {
      const { data } = await api.post('/orders', payload);
      clearCart();
      navigate('/order-success', { state: { order: data.order, orderId: data.orderId } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Impossible d’enregistrer la commande. Vérifiez votre connexion et réessayez.');
      setStep('confirm');
    } finally {
      setSaving(false);
    }
  };

  const handleBackToForm = () => {
    setError('');
    setStep('form');
  };

  return (
    <main className="checkout-page">
      <div className="checkout-heading">
        <div>
          <span className="checkout-eyebrow">DZSHOP CHECKOUT</span>
          <h1>{step === 'confirm' ? 'Confirmer votre commande' : 'Finaliser votre commande'}</h1>
          <p>
            {step === 'confirm'
              ? 'Vérifiez vos informations avant de confirmer votre commande.'
              : 'Renseignez vos coordonnées pour recevoir votre commande chez vous.'}
          </p>
        </div>
        <Link className="checkout-back" to="/panier">← Retour au panier</Link>
      </div>

      {step === 'form' ? (
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleGoToReview}>
            <div className="checkout-section-heading">
              <span className="step-number">01</span>
              <div><h2>Vos coordonnées</h2><p>Où souhaitez-vous recevoir votre commande ?</p></div>
            </div>

            <div className="checkout-fields">
              <label className="checkout-field checkout-field-full"><span>Nom et prénom <b>*</b></span><input name="fullName" type="text" autoComplete="name" defaultValue={orderDetails?.nomClient || user?.nom || user?.name || ''} placeholder="Votre nom complet" /></label>
              <label className="checkout-field checkout-field-full">
                <span>Téléphone <b>*</b></span>
                <div className="phone-input"><strong>+213</strong><input name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength="9" title="Saisissez les 9 chiffres après +213, en commençant par 5, 6 ou 7." defaultValue={orderDetails?.telephone || ''} placeholder="5XX XXX XXX" /></div>
              </label>
              <label className="checkout-field"><span>Wilaya <b>*</b></span><input name="wilaya" type="text" autoComplete="address-level1" defaultValue={orderDetails?.wilaya || ''} placeholder="Votre wilaya" /></label>
              <label className="checkout-field"><span>Commune <b>*</b></span><input name="commune" type="text" autoComplete="address-level2" defaultValue={orderDetails?.commune || ''} placeholder="Votre commune" /></label>
              <label className="checkout-field checkout-field-full"><span>Adresse exacte <b>*</b></span><textarea name="address" autoComplete="street-address" rows="3" defaultValue={orderDetails?.adresse || ''} placeholder="Rue, numéro, bâtiment, quartier..." /></label>
              <label className="checkout-field checkout-field-full"><span>Remarque pour le livreur <small>(facultatif)</small></span><textarea name="note" rows="2" maxLength="500" defaultValue={orderDetails?.note || ''} placeholder="Repère ou précision utile" /></label>
            </div>

            <div className="checkout-payment">
              <span className="checkout-payment-icon" aria-hidden="true">💵</span>
              <span><strong>Paiement à la livraison</strong><small>Réglez votre commande à sa réception.</small></span>
              <input type="radio" name="payment" value="cash-on-delivery" checked readOnly aria-label="Paiement à la livraison sélectionné" />
            </div>

            {error && <p className="checkout-error" role="alert">{error}</p>}

            <button className="save-address-button" type="submit" disabled={saving}>
              {saving ? <><span className="checkout-spinner" aria-hidden="true" /> Enregistrement...</> : 'Passer la commande'}
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
                  <div className="summary-item" key={item.id || item._id}>
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
      ) : (
        <div className="checkout-confirmation-wrapper">
          <div className="checkout-confirmation-card">
            <div className="checkout-confirmation-header">
              <div className="checkout-step-badge" aria-hidden="true">✓</div>
              <div>
                <p className="checkout-confirmation-kicker">CONFIRMATION</p>
                <h2>Confirmer votre commande</h2>
              </div>
            </div>

            <div className="checkout-confirmation-grid">
              <section className="checkout-review-box">
                <div className="checkout-box-header">
                  <span className="checkout-box-title">Informations client</span>
                </div>

                <div className="checkout-info-grid">
                  <div><span>Nom et prénom</span><strong>{orderDetails?.nomClient || user?.nom || user?.name || '—'}</strong></div>
                  <div><span>Téléphone</span><strong>{orderDetails?.telephone ? `+213 ${orderDetails.telephone}` : '—'}</strong></div>
                  <div><span>Wilaya</span><strong>{orderDetails?.wilaya || '—'}</strong></div>
                  <div><span>Commune</span><strong>{orderDetails?.commune || '—'}</strong></div>
                  <div className="checkout-full-row"><span>Adresse</span><strong>{orderDetails?.adresse || '—'}</strong></div>
                </div>
              </section>

              <section className="checkout-review-box">
                <div className="checkout-box-header">
                  <span className="checkout-box-title">Résumé de la commande</span>
                </div>

                <div className="checkout-order-items">
                  {items.map((item) => {
                    const quantity = item.quantity || item.qte || 1;
                    const price = item.price || item.prix || 0;
                    const name = item.title || item.nom || 'Produit';

                    return (
                      <div className="checkout-order-item" key={item.id || item._id}>
                        {item.image && <img src={getImageUrl(item.image)} alt={name} />}
                        <div className="checkout-order-summary">
                          <div className="checkout-order-main-line">
                            <strong>{name}</strong>
                            <span>{(price * quantity).toLocaleString('fr-DZ')} DZD</span>
                          </div>
                          <div className="checkout-order-meta-line">
                            <small>Quantité : {quantity}</small>
                            <small>{price.toLocaleString('fr-DZ')} DZD / unité</small>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="checkout-total-box">
                  <div className="checkout-total-row"><span>Sous-total</span><strong>{subtotal.toLocaleString('fr-DZ')} DZD</strong></div>
                  <div className="checkout-total-row"><span>Livraison</span><strong>{shipping === 0 ? 'Gratuite' : `${shipping.toLocaleString('fr-DZ')} DZD`}</strong></div>
                  <div className="checkout-total-row checkout-total-final"><span>TOTAL</span><strong>{grandTotal.toLocaleString('fr-DZ')} DZD</strong></div>
                </div>
              </section>
            </div>

            <div className="checkout-payment-card" aria-label="Paiement à la livraison">
              <div className="checkout-payment-icon-large" aria-hidden="true">💵</div>
              <div>
                <strong>Paiement à la livraison</strong>
                <p>Vous payez uniquement à la réception de votre commande.</p>
              </div>
            </div>

            {error && <p className="checkout-error checkout-error-confirmation" role="alert">{error}</p>}

            <div className="checkout-action-row">
              <button type="button" className="checkout-back-button" onClick={handleBackToForm} disabled={saving}>
                Modifier
              </button>

              <button type="button" className="checkout-confirm-button" onClick={handleConfirmOrder} disabled={saving}>
                {saving ? <><span className="checkout-spinner" aria-hidden="true" /> Confirmation...</> : 'Confirmer la commande'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}