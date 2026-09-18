import { Link } from 'react-router-dom';
import './OrderSuccess.css';

export default function OrderSuccess() {
  return (
    <main className="order-success-page">
      <section className="order-success-card" aria-labelledby="order-success-title">
        <div className="order-success-badge" aria-hidden="true">✓</div>
        <p className="order-success-eyebrow">DZSHOP · COMMANDE</p>
        <h1 id="order-success-title">Commande validée avec succès !</h1>
        <p className="order-success-message">
          Notre équipe vous contactera bientôt par téléphone pour confirmer la livraison.
        </p>
        <div className="delivery-summary">
          <span className="delivery-summary-icon" aria-hidden="true">🚚</span>
          <div>
            <span>Mode de livraison</span>
            <strong>Paiement à la livraison</strong>
          </div>
        </div>
        <Link className="back-to-store-button" to="/produits">Retour à la boutique</Link>
      </section>
    </main>
  );
}