import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './AdminDashboard.css';
import './VendorDashboard.css';

const apiUrl = 'http://localhost:5000';
const defaultProductImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
const emptyForm = { title: '', description: '', category: '', price: '', stock: '', image: '' };

export default function VendorDashboard() {
  const { user, token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const authorizedHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Cette route est censée renvoyer uniquement les produits appartenant au
  // vendeur connecté (le backend identifie le vendeur via le token, pas
  // besoin d'envoyer l'id manuellement).
  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiUrl}/api/vendor/products`, { headers: authorizedHeaders });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Impossible de charger votre boutique.');
      setProducts(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadProducts();
  }, [token]);

  const addProduct = async (event) => {
    event.preventDefault();
    if (saving) return;
    setMessage('');
    setError('');
    setSaving(true);

    const productData = {
      nom: form.title.trim(),
      description: form.description.trim(),
      categorie: form.category.trim() || 'Divers',
      prix: Number(form.price),
      stock: form.stock === '' ? 0 : Number(form.stock),
      image: form.image.trim() || defaultProductImage
    };

    try {
      const response = await fetch(`${apiUrl}/api/vendor/products`, {
        method: 'POST',
        headers: { ...authorizedHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const product = await response.json();
      if (!response.ok) throw new Error(product.message || "Impossible d'ajouter le produit.");
      setProducts((current) => [product, ...current]);
      setForm(emptyForm);
      setMessage('Produit ajouté à votre boutique.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setEditForm({
      title: product.nom || '',
          description: product.description || '',
          category: product.categorie || '',
      price: product.prix ?? '',
      stock: product.stock ?? '',
      image: product.image || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const saveEdit = async (productId) => {
    setError('');
    try {
      const response = await fetch(`${apiUrl}/api/vendor/products/${productId}`, {
        method: 'PATCH',
        headers: { ...authorizedHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: editForm.title.trim(),
          description: editForm.description.trim(),
          categorie: editForm.category.trim() || 'Divers',
          prix: Number(editForm.price),
          stock: editForm.stock === '' ? 0 : Number(editForm.stock),
          image: editForm.image.trim() || defaultProductImage
        })
      });
      const updated = await response.json();
      if (!response.ok) throw new Error(updated.message || 'Impossible de modifier le produit.');
      setProducts((current) => current.map((product) => product._id === productId ? updated : product));
      setMessage('Produit mis à jour.');
      cancelEdit();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Supprimer ce produit de votre boutique ?')) return;
    setError('');
    try {
      const response = await fetch(`${apiUrl}/api/vendor/products/${productId}`, {
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

  const toggleAdvertising = async (product) => {
    setError('');
    try {
      const response = await fetch(`${apiUrl}/api/vendor/products/${product._id}`, {
        method: 'PATCH',
        headers: { ...authorizedHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdvertised: !product.isAdvertised })
      });
      const updated = await response.json();
      if (!response.ok) throw new Error(updated.message || 'Impossible de modifier la publicité.');
      setProducts((current) => current.map((item) => item._id === product._id ? updated : item));
      setMessage(updated.isAdvertised ? 'Produit mis en avant.' : 'Produit retiré de la publicité.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const advertisedCount = products.filter((product) => product.isAdvertised).length;

  return (
    <main className="admin-page">
      <header className="admin-heading">
        <div>
          <span className="admin-eyebrow">DZSHOP · ESPACE VENDEUR</span>
          <h1>Ma boutique{user?.nom ? ` · ${user.nom}` : ''}</h1>
          <p>Gérez uniquement vos propres produits : ajout, modification, photos et mise en avant.</p>
        </div>
        <Link className="admin-store-link" to="/produits">Voir la boutique →</Link>
      </header>

      {message && <div className="admin-alert admin-alert-success">{message}</div>}
      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <section className="admin-stats">
        <div><span>Mes produits</span><strong>{products.length}</strong></div>
        <div><span>En publicité</span><strong>{advertisedCount}</strong></div>
      </section>

      <div className="admin-lower-grid">
        <section className="admin-panel product-form-panel">
          <div className="admin-panel-heading"><div><span className="panel-kicker">CATALOGUE</span><h2>Ajouter un produit</h2></div></div>
          <form className="product-form" onSubmit={addProduct}>
            <label>Titre<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Nom du produit" /></label>
            <label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Décrivez le produit" /></label>
            <label>Catégorie<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Audio, Gaming..." /></label>
            <label>Prix (DZD)<input required min="0" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="8500" /></label>
            <label>Stock<input min="0" type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} placeholder="10" /></label>
            <label>Image URL<input type="url" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="https://... (optionnel)" /></label>
            <button type="submit" disabled={saving}>{saving ? 'Ajout en cours...' : '+ Ajouter le produit'}</button>
          </form>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading"><div><span className="panel-kicker">MA BOUTIQUE</span><h2>Mes produits</h2></div><span className="panel-count">{products.length} au total</span></div>
          {loading ? <p className="admin-empty">Chargement de vos produits...</p> : products.length === 0 ? <p className="admin-empty">Vous n'avez encore ajouté aucun produit.</p> : (
            <div className="vendor-product-list">
              {products.map((product) => editingId === product._id ? (
                <div className="vendor-product-edit" key={product._id}>
                  <input value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} placeholder="Titre" />
                  <textarea value={editForm.description} onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} placeholder="Description" />
                  <input value={editForm.category} onChange={(event) => setEditForm({ ...editForm, category: event.target.value })} placeholder="Catégorie" />
                  <input type="number" min="0" value={editForm.price} onChange={(event) => setEditForm({ ...editForm, price: event.target.value })} placeholder="Prix" />
                  <input type="number" min="0" value={editForm.stock} onChange={(event) => setEditForm({ ...editForm, stock: event.target.value })} placeholder="Stock" />
                  <input type="url" value={editForm.image} onChange={(event) => setEditForm({ ...editForm, image: event.target.value })} placeholder="URL de la photo" />
                  <div className="vendor-product-edit-actions">
                    <button type="button" className="vendor-btn-save" onClick={() => saveEdit(product._id)}>Enregistrer</button>
                    <button type="button" className="vendor-btn-cancel" onClick={cancelEdit}>Annuler</button>
                  </div>
                </div>
              ) : (
                <div className="vendor-product-item" key={product._id}>
                  <img src={product.image || 'https://placehold.co/80x80?text=Produit'} alt="" />
                  <div className="vendor-product-info">
                    <strong>{product.nom}</strong>
                    <span>{Number(product.prix).toLocaleString('fr-DZ')} DZD · Stock {product.stock}</span>
                    {product.isAdvertised && <span className="ad-badge">📣 En publicité</span>}
                  </div>
                  <div className="vendor-product-actions">
                    <button type="button" className={`vendor-btn-ad ${product.isAdvertised ? 'active' : ''}`} onClick={() => toggleAdvertising(product)}>
                      {product.isAdvertised ? 'Retirer' : 'Publicité'}
                    </button>
                    <button type="button" className="vendor-btn-edit" onClick={() => startEdit(product)}>Modifier</button>
                    <button type="button" className="vendor-btn-delete" onClick={() => deleteProduct(product._id)} title="Supprimer">×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
