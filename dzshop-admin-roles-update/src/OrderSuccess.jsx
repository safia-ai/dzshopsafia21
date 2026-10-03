import { Link, useLocation } from 'react-router-dom';
import './OrderSuccess.css';

export default function OrderSuccess() {
  const { state } = useLocation();
  const order = state?.order;
  const orderId = state?.orderId || order?._id;
  const displayOrderId = orderId ? `ORD-${String(orderId).slice(-8).toUpperCase()}` : '';

  return (
    <main className="order-success-page">
      <section className="order-success-card" aria-labelledby="order-success-title">
        <div className="order-success-badge"><span aria-hidden="true">✓</span></div>
        <p className="order-success-eyebrow">DZSHOP · COMMANDE</p>
        <h1 id="order-success-title">Félicitations ! Votre commande a été enregistrée avec succès.</h1>
        {displayOrderId && <p className="order-reference">Commande <strong>#{displayOrderId}</strong></p>}
        <p className="order-success-message">
          Notre équipe vous contactera par téléphone dans les plus brefs délais pour confirmer l’expédition.
        </p>
        {order && (
          <div className="confirmation-summary">
            <div className="confirmation-summary-heading"><strong>Récapitulatif</strong><span>{order.articles?.length || 0} article(s)</span></div>
            <div className="confirmation-items">
              {order.articles?.map((item, index) => (
                <div className="confirmation-item" key={`${item.produit || item.nom}-${index}`}>
                  <span>{item.nom} <small>× {item.qte}</small></span>
                  <strong>{(item.prix * item.qte).toLocaleString('fr-DZ')} DZD</strong>
                </div>
              ))}
            </div>
            <div className="confirmation-details">
              <span>Livraison à</span>
              <strong>{order.telephone} · {order.wilaya}</strong>
              <span>{order.adresse}</span>
              <div><span>Livraison : {Number(order.livraison || 0).toLocaleString('fr-DZ')} DZD · Paiement à la livraison</span><strong>{Number(order.total).toLocaleString('fr-DZ')} DZD</strong></div>
            </div>
          </div>
        )}
        <div className="order-success-actions">
          <Link className="back-to-store-button" to="/produits">Continuer vos achats</Link>
          <Link className="follow-order-button" to="/profil">Suivre ma commande</Link>
        </div>
      </section>
    </main>
  );
}