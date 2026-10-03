import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from './api/axios';
import { getImageUrl } from './utils/imageUrl';
import './MyOrdersPage.css';

function formatDate(value) {
  return new Date(value).toLocaleDateString('fr-DZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function orderNumber(id) {
  return `ORD-${String(id).slice(-8).toUpperCase()}`;
}

function statusClass(status) {
  if (status === 'Livrée') return 'my-order-status-delivered';
  if (status === 'Expédiée') return 'my-order-status-shipped';
  return 'my-order-status-pending';
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    async function loadOrders() {
      try {
        const { data } = await api.get('/orders/myorders');
        if (isCurrent) setOrders(Array.isArray(data) ? data : []);
      } catch (requestError) {
        if (isCurrent) setError(requestError.response?.data?.message || 'Impossible de charger vos commandes.');
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    loadOrders();
    return () => { isCurrent = false; };
  }, []);

  return (
    <main className="my-orders-page">
      <header className="my-orders-heading">
        <div>
          <span className="my-orders-eyebrow">DZSHOP · ESPACE CLIENT</span>
          <h1>Mes commandes</h1>
          <p>Retrouvez ici le suivi de vos achats.</p>
        </div>
        <Link to="/produits">Continuer vos achats</Link>
      </header>

      {error && <p className="my-orders-error" role="alert">{error}</p>}
      {loading ? <p className="my-orders-empty">Chargement de vos commandes...</p> : orders.length === 0 ? (
        <section className="my-orders-empty-state">
          <span aria-hidden="true">▤</span>
          <h2>Aucune commande pour le moment</h2>
          <p>Vos commandes apparaîtront ici après leur confirmation.</p>
          <Link to="/produits">Découvrir la boutique</Link>
        </section>
      ) : (
        <div className="my-orders-list">
          {orders.map((order) => (
            <article className="my-order" key={order._id}>
              <header className="my-order-header">
                <div><span>Commande</span><strong>#{orderNumber(order._id)}</strong></div>
                <div><span>Passée le</span><strong>{formatDate(order.createdAt)}</strong></div>
                <span className={`my-order-status ${statusClass(order.statut)}`}>{order.statut}</span>
              </header>
              <div className="my-order-items">
                {order.articles?.map((item, index) => (
                  <div className="my-order-item" key={`${item.produitId || item.nom}-${index}`}>
                    {item.image ? <img src={getImageUrl(item.image)} alt="" /> : <span className="my-order-image-placeholder" aria-hidden="true">DZ</span>}
                    <span className="my-order-item-name">{item.nom}<small>Quantité : {item.qte}</small></span>
                    <strong>{(item.prix * item.qte).toLocaleString('fr-DZ')} DZD</strong>
                  </div>
                ))}
              </div>
              <footer className="my-order-footer">
                <span>{order.wilaya}{order.commune ? ` · ${order.commune}` : ''}</span>
                <strong>Total · {Number(order.total).toLocaleString('fr-DZ')} DZD</strong>
              </footer>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}