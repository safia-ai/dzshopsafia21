import React, { useContext, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CartContext } from './CartContext';
import './ProductDetailsPage.css';

export default function ProductDetailsPage({ products = [], onAddToCart }) {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [added, setAdded] = useState(false);

  const produit = products.find((p) => p.id === Number(id));

  if (!produit) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Produit introuvable</h2>
        <Link to="/produits" style={{ color: '#2563eb', textDecoration: 'none' }}>
          ← Retour à la boutique
        </Link>
      </div>
    );
  }

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(produit.id, 1);
    } else if (addToCart) {
      addToCart(produit);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  const price = produit.price || produit.prix || 0;
  const oldPrice = produit.oldPrice || produit.ancienPrix;
  const name = produit.title || produit.nom;

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <Link to="/produits" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: '24px' }}>
        ← Retour aux produits
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px', alignItems: 'start' }}>
        <div>
          <img 
            src={produit.image} 
            alt={name} 
            style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', border: '1px solid #e2e8f0' }} 
          />
        </div>

        <div>
          <span style={{ display: 'inline-block', backgroundColor: '#e2e8f0', color: '#475569', fontSize: '0.8rem', padding: '4px 10px', borderRadius: '20px', marginBottom: '12px' }}>
            {produit.category || 'Électronique'}
          </span>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '12px' }}>{name}</h1>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '20px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#2563eb' }}>
              {price.toLocaleString('fr-DZ')} DZD
            </span>
            {oldPrice && (
              <span style={{ fontSize: '1.1rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                {oldPrice.toLocaleString('fr-DZ')} DZD
              </span>
            )}
          </div>

          <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '30px' }}>
            {produit.description}
          </p>

          <button 
            onClick={handleAdd}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '14px 24px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🛒 Ajouter au panier
          </button>

          {added && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              backgroundColor: '#dcfce7',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              color: '#15803d',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>✅ Produit ajouté avec succès !</span>
              <Link to="/panier" style={{ fontWeight: 'bold', color: '#15803d', textDecoration: 'underline' }}>
                Voir le panier
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}