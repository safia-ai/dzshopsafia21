import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import api from './api/axios';
import './ProfilePage.css';

function formatDate(value) {
  return new Date(value).toLocaleDateString('fr-DZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function formatOrderNumber(id) {
  return `ORD-${String(id).slice(-8).toUpperCase()}`;
}

function statusClass(status) {
  if (status === 'Livrée') return 'profile-order-status-delivered';
  if (status === 'Expédiée') return 'profile-order-status-shipped';
  if (status === 'Annulée') return 'profile-order-status-cancelled';
  return 'profile-order-status-pending';
}

export default function ProfilePage() {
  const { user, token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    async function loadOrders() {
      if (!token) {
        setError('Votre session a expiré. Veuillez vous reconnecter.');
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/orders/my', {
          headers: { Authorization: 'Bearer ' + token }
        });
        if (isCurrent) setOrders(Array.isArray(data) ? data : []);
      } catch (requestError) {
        if (isCurrent) setError(requestError.response?.data?.message || 'Impossible de charger vos commandes.');
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    loadOrders();
    return () => { isCurrent = false; };
  }, [token]);

  return (
    <main className="profile-page">
      <header className="profile-heading">
        <div>
          <span className="profile-eyebrow">DZSHOP · MON ESPACE</span>
          <h1>Mon profil</h1>
        </div>
        <Link to="/produits">Continuer mes achats</Link>
      </header>

      <section className="profile-account" aria-labelledby="profile-account-title">
        <div className="profile-avatar" aria-hidden="true">{(user?.nom || user?.name || 'U').slice(0, 1).toUpperCase()}</div>
        <div>
          <h2 id="profile-account-title">{user?.nom || user?.name || 'Utilisateur'}</h2>
          <p>{user?.email}</p>
          <span className="profile-role">{user?.role || 'client'}</span>
        </div>
      </section>

      <section className="profile-orders" aria-labelledby="profile-orders-title">
        <div className="profile-orders-heading">
          <div><span className="profile-eyebrow">HISTORIQUE</span><h2 id="profile-orders-title">Mes commandes</h2></div>
          <span>{orders.length} commande{orders.length > 1 ? 's' : ''}</span>
        </div>

        {error && <p className="profile-error" role="alert">{error}</p>}
        {loading ? <p className="profile-empty">Chargement de vos commandes...</p> : orders.length === 0 ? (
          <div className="profile-empty-state">
            <h3>Aucune commande pour le moment</h3>
            <p>Vos commandes et leur suivi apparaîtront ici.</p>
            <Link to="/produits">Découvrir les produits</Link>
          </div>
        ) : (
          <div className="profile-order-list">
            {orders.map((order) => (
              <article className="profile-order" key={order._id}>
                <header className="profile-order-header">
                  <div><span>Référence</span><strong>#{formatOrderNumber(order._id)}</strong></div>
                  <div><span>Date</span><strong>{formatDate(order.createdAt)}</strong></div>
                  <span className={`profile-order-status ${statusClass(order.statut)}`}>{order.statut}</span>
                </header>
                <div className="profile-order-lines">
                  {order.articles?.map((item, index) => (
                    <div className="profile-order-line" key={`${item.produit || item.nom}-${index}`}>
                      <span>{item.nom}<small>Quantité : {item.qte}</small></span>
                      <strong>{(item.prix * item.qte).toLocaleString('fr-DZ')} DZD</strong>
                    </div>
                  ))}
                </div>
                <footer className="profile-order-footer">
                  <span>{order.wilaya} · {order.adresse}</span>
                  <strong>Total · {Number(order.total).toLocaleString('fr-DZ')} DZD</strong>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}