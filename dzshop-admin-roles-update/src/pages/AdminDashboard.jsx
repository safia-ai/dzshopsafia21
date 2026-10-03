import { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { getImageUrl } from '../utils/imageUrl';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import './AdminDashboard.css';

const statuses = ['En attente', 'Expédiée', 'Livrée', 'Annulée'];
const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '').replace(/\/api$/, '');
function formatDate(value) {
  return new Date(value).toLocaleDateString('fr-DZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export default function AdminDashboard() {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ title: '', price: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imageInputKey, setImageInputKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addingProduct, setAddingProduct] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const authorizedHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersResponse, productsResponse, usersResponse, statsResponse] = await Promise.all([
        fetch(`${apiUrl}/api/orders`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
        fetch(`${apiUrl}/api/products`),
        fetch(`${apiUrl}/api/users`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
        fetch(`${apiUrl}/api/admin/stats`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      ]);
      const ordersData = await ordersResponse.json();
      const productsData = await productsResponse.json();
      const usersData = usersResponse.ok ? await usersResponse.json() : [];
      const statsData = statsResponse.ok ? await statsResponse.json() : null;
      if (!ordersResponse.ok) throw new Error(ordersData.message || 'Impossible de charger les commandes.');
      if (!productsResponse.ok) throw new Error(productsData.message || 'Impossible de charger les produits.');
      if (!statsResponse.ok) throw new Error(statsData?.message || 'Impossible de charger les statistiques.');
      setOrders(ordersData);
      setProducts(productsData);
      setUsers(usersData);
      setStats(statsData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) queueMicrotask(loadDashboard);
  }, [token, loadDashboard]);

  const updateUserRole = async (userId, role) => {
    setError('');
    try {
      const response = await fetch(`${apiUrl}/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { ...authorizedHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const updatedUser = await response.json();
      if (!response.ok) throw new Error(updatedUser.message || 'Impossible de modifier le rôle.');
      setUsers((current) => current.map((person) => person._id === userId ? updatedUser : person));
      setMessage('Rôle mis à jour.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const updateStatus = async (orderId, status) => {
    setError('');
    try {
      const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { ...authorizedHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: status })
      });
      const updatedOrder = await response.json();
      if (!response.ok) throw new Error(updatedOrder.message || 'Impossible de modifier le statut.');
      setOrders((current) => current.map((order) => order._id === orderId ? updatedOrder : order));
      setMessage('Statut de la commande mis à jour.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const addProduct = async (event) => {
    event.preventDefault();
    if (addingProduct) return;
    setMessage('');
    setError('');
    setAddingProduct(true);

    try {
      let image = '';
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        const uploadResponse = await fetch(`${apiUrl}/api/upload`, {
          method: 'POST',
          headers: authorizedHeaders,
          body: uploadData
        });
        const uploaded = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploaded.message || 'Impossible de téléverser l’image.');
        image = uploaded.url;
      }

      const response = await fetch(`${apiUrl}/api/products`, {
        method: 'POST',
        headers: { ...authorizedHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: form.title.trim(), prix: Number(form.price), image })
      });
      const product = await response.json();
      if (!response.ok) throw new Error(product.message || 'Impossible d’ajouter le produit.');
      setProducts((current) => [product, ...current]);
      setForm({ title: '', price: '' });
      setImageFile(null);
      setImageInputKey((current) => current + 1);
      setMessage('Produit ajouté avec succès.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setAddingProduct(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    setError('');
    try {
      const response = await fetch(`${apiUrl}/api/products/${productId}`, {
        method: 'DELETE',
        headers: { ...authorizedHeaders, 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Impossible de supprimer le produit.');
      setProducts((current) => current.filter((product) => product._id !== productId));
      setMessage('Produit supprimé.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <main className="admin-page">
      <header className="admin-heading">
        <div>
          <span className="admin-eyebrow">DZSHOP · ADMIN</span>
          <h1>Centre de commandes</h1>
          <p>Suivez les ventes et gardez votre catalogue à jour.</p>
        </div>
        <Link className="admin-store-link" to="/produits">Voir la boutique →</Link>
      </header>

      {message && <div className="admin-alert admin-alert-success">{message}</div>}
      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <section className="admin-stats">
        <div><span>Chiffre d’affaires</span><strong>{Number(stats?.chiffreAffaire || 0).toLocaleString('fr-DZ')} DZD</strong></div>
        <div><span>Commandes</span><strong>{stats?.totalOrders ?? orders.length}</strong></div>
        <div><span>En attente</span><strong>{stats?.enAttenteCount ?? orders.filter((order) => order.statut === 'En attente').length}</strong></div>
        <div><span>Livrées</span><strong>{stats?.livreesCount ?? 0}</strong></div>
        <div><span>Annulées</span><strong>{stats?.annuleesCount ?? 0}</strong></div>
        <div><span>Produits</span><strong>{stats?.totalProducts ?? products.length}</strong></div>
        <div><span>Utilisateurs</span><strong>{stats?.totalUsers ?? users.length}</strong></div>
        <div><span>Clients</span><strong>{stats?.totalClients ?? 0}</strong></div>
        <div><span>Vendeurs</span><strong>{stats?.totalVendors ?? users.filter((person) => person.role === 'vendor').length}</strong></div>
      </section>

      <section className="admin-panel admin-chart-panel">
        <div className="admin-panel-heading"><div><span className="panel-kicker">ACTIVITÉ</span><h2>Ventes des 7 derniers jours</h2></div></div>
        <div className="admin-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.ventes7j || []} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} />
              <YAxis tickFormatter={(value) => Number(value).toLocaleString('fr-DZ')} width={76} />
              <Tooltip formatter={(value) => [`${Number(value).toLocaleString('fr-DZ')} DZD`, 'Ventes']} />
              <Bar dataKey="chiffreAffaire" fill="#16804a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading"><div><span className="panel-kicker">ACTIVITÉ RÉCENTE</span><h2>Commandes</h2></div><span className="panel-count">{orders.length} au total</span></div>
        {loading ? <p className="admin-empty">Chargement des commandes...</p> : orders.length === 0 ? <p className="admin-empty">Aucune commande enregistrée.</p> : (
          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead><tr><th>Client</th><th>Téléphone</th><th>Wilaya / Commune</th><th>Articles</th><th>Montant</th><th>Date</th><th>Statut</th></tr></thead>
              <tbody>{orders.map((order) => (
                <tr key={order._id}>
                  <td><strong>{order.user?.name || order.user?.email || '-'}</strong></td>
                  <td>{order.telephone || '-'}</td>
                  <td>{order.wilaya || '-'}<small>{order.adresse || '-'}</small></td>
                  <td>
                    <div className="order-articles-cell">
                      <span>{order.articles?.reduce((sum, item) => sum + item.qte, 0) || 0} article(s)</span>
                      <div className="order-article-images">
                        {order.articles?.filter((item) => item.image).slice(0, 4).map((item, index) => (
                          <img key={`${item.nom}-${index}`} src={getImageUrl(item.image)} alt={item.nom || 'Produit'} title={`${item.nom || 'Produit'} × ${item.qte}`} />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td><strong>{Number(order.total || 0).toLocaleString('fr-DZ')} DZD</strong></td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td><select className={`status-select status-${order.statut?.replaceAll(' ', '-').toLowerCase()}`} value={order.statut} disabled={order.statut === 'Annulée'} onChange={(event) => updateStatus(order._id, event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading"><div><span className="panel-kicker">COMPTES</span><h2>Utilisateurs</h2></div><span className="panel-count">{users.length} au total</span></div>
        {loading ? <p className="admin-empty">Chargement des utilisateurs...</p> : users.length === 0 ? <p className="admin-empty">Aucun utilisateur trouvé.</p> : (
          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Inscrit le</th><th>Changer le rôle</th></tr></thead>
              <tbody>{users.map((person) => (
                <tr key={person._id}>
                  <td><strong>{person.name}</strong></td>
                  <td>{person.email}</td>
                  <td><span className={`role-badge role-${person.role}`}>{person.role === 'admin' ? 'Admin' : person.role === 'vendor' ? 'Vendeur' : 'Client'}</span></td>
                  <td>{person.createdAt ? formatDate(person.createdAt) : '-'}</td>
                  <td>
                    {person.role === 'admin' ? (
                      <span className="admin-empty" style={{ padding: 0 }}>—</span>
                    ) : (
                      <select className="status-select" value={person.role} onChange={(event) => updateUserRole(person._id, event.target.value)}>
                        <option value="client">Client</option>
                        <option value="vendor">Vendeur</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>

      <div className="admin-lower-grid">
        <section className="admin-panel product-form-panel">
          <div className="admin-panel-heading"><div><span className="panel-kicker">CATALOGUE</span><h2>Ajouter un produit</h2></div></div>
          <form className="product-form" onSubmit={addProduct}>
            <label>Titre<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Nom du produit" /></label>
            <label>Prix (DZD)<input required min="0" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="8500" /></label>
            <label>Photo du produit<input key={imageInputKey} type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} /></label>
            <button type="submit" disabled={addingProduct}>{addingProduct ? 'Ajout en cours...' : '+ Ajouter le produit'}</button>
          </form>
        </section>

        <section className="admin-panel catalogue-panel">
          <div className="admin-panel-heading"><div><span className="panel-kicker">INVENTAIRE</span><h2>Produits récents</h2></div></div>
          <div className="catalogue-list">{products.slice(0, 5).map((product) => <div className="catalogue-item" key={product._id}><img src={product.image ? getImageUrl(product.image) : 'https://placehold.co/80x80?text=Produit'} alt="" /><div><strong>{product.nom}</strong><span>{Number(product.prix).toLocaleString('fr-DZ')} DZD · Stock {product.stock}</span></div><button type="button" onClick={() => deleteProduct(product._id)} title="Supprimer">×</button></div>)}</div>
        </section>
      </div>
    </main>
  );
}
