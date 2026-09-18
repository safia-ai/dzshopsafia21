import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from './CartContext';
import './cart.css';

export default function CartPage() {
  const { 
    cart, 
    panier, 
    updateQty, 
    removeFromCart, 
    clearCart, 
    total, 
    livraison, 
    nbItems 
  } = useContext(CartContext);

  const items = panier || cart || [];
  const currentTotal = total !== undefined 
    ? total 
    : items.reduce((sum, item) => sum + (item.price || item.prix || 0) * (item.quantity || item.qte || 1), 0);

  const shippingFee = livraison !== undefined 
    ? livraison 
    : (currentTotal >= 10000 || currentTotal === 0 ? 0 : 500);

  const itemCount = nbItems !== undefined 
    ? nbItems 
    : items.reduce((sum, item) => sum + (item.quantity || item.qte || 1), 0);

  const grandTotal = currentTotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="cart-page-container" style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🛒</div>
        <h2 style={{ fontSize: '1.75rem', color: '#1e293b', marginBottom: '8px' }}>Votre panier est vide</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>Vous n'avez pas encore ajouté de produits dans votre panier.</p>
        <Link 
          to="/produits" 
          style={{
            display: 'inline-block',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '12px 28px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          Découvrir nos produits
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page-container" style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a', margin: 0 }}>
          Votre Panier <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'normal' }}>({itemCount} article{itemCount > 1 ? 's' : ''})</span>
        </h1>
        <button 
          onClick={clearCart}
          style={{
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '0.9rem',
            textDecoration: 'underline'
          }}
        >
          Vider le panier
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.9rem' }}>
                <th style={{ padding: '16px' }}>Produit</th>
                <th style={{ padding: '16px' }}>Prix</th>
                <th style={{ padding: '16px' }}>Quantité</th>
                <th style={{ padding: '16px' }}>Total</th>
                <th style={{ padding: '16px', textAlign: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const price = item.price || item.prix || 0;
                const qty = item.quantity || item.qte || 1;
                const name = item.title || item.nom || 'Produit';

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={name} 
                          style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px' }} 
                        />
                      )}
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{name}</span>
                    </td>
                    <td style={{ padding: '16px', color: '#475569' }}>
                      {price.toLocaleString('fr-DZ')} DZD
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                        <button 
                          onClick={() => updateQty(item.id, qty - 1)}
                          disabled={qty <= 1}
                          style={{
                            padding: '4px 10px',
                            background: 'none',
                            border: 'none',
                            cursor: qty <= 1 ? 'not-allowed' : 'pointer',
                            color: qty <= 1 ? '#cbd5e1' : '#1e293b'
                          }}
                        >
                          −
                        </button>
                        <span style={{ padding: '0 8px', fontWeight: 'bold', fontSize: '0.9rem' }}>{qty}</span>
                        <button 
                          onClick={() => updateQty(item.id, qty + 1)}
                          style={{ padding: '4px 10px', background: 'none', border: 'none', cursor: 'pointer', color: '#1e293b' }}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 'bold', color: '#0f172a' }}>
                      {(price * qty).toLocaleString('fr-DZ')} DZD
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '1.1rem'
                        }}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#0f172a' }}>Récapitulatif</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#475569' }}>
            <span>Sous-total</span>
            <span>{currentTotal.toLocaleString('fr-DZ')} DZD</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#475569' }}>
            <span>Livraison</span>
            <span>
              {shippingFee === 0 ? (
                <strong style={{ color: '#16a34a' }}>Gratuite 🎉</strong>
              ) : (
                `${shippingFee.toLocaleString('fr-DZ')} DZD`
              )}
            </span>
          </div>

          <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.25rem', color: '#0f172a', marginBottom: '24px' }}>
            <span>Total</span>
            <span style={{ color: '#2563eb' }}>{grandTotal.toLocaleString('fr-DZ')} DZD</span>
          </div>

          <Link
            to="/checkout"
            style={{
              display: 'block',
              width: '100%',
              boxSizing: 'border-box',
              textAlign: 'center',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              textDecoration: 'none',
              marginBottom: '12px'
            }}
          >
            Passer la commande
          </Link>

          <Link 
            to="/produits"
            style={{
              display: 'block',
              textAlign: 'center',
              color: '#2563eb',
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}