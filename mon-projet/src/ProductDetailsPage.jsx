import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, ShieldCheck, Truck, ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import './ProductDetailsPage.css';

function ProductDetailsPage({ products = [], onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedWilaya, setSelectedWilaya] = useState('Skikda');

  // البحث عن المنتج المطابق للـ id
  const product = products.find((p) => String(p.id) === String(id));

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Produit introuvable !</h2>
        <p>Le produit avec l'ID #{id} n'existe pas ou a été supprimé.</p>
        <button className="btn-back" onClick={() => navigate('/produits')}>
          <ArrowLeft size={18} /> Retour au catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="details-container">
      {/* زر الرجوع */}
      <button className="btn-back-link" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Retour
      </button>

      <div className="product-details-grid">
        {/* القسم الأيسر: الصورة والشارات */}
        <div className="details-image-box">
          {product.discount && (
            <span className="badge-promo-detail">-{product.discount}% PROMO</span>
          )}
          <img src={product.image} alt={product.title} className="main-product-img" />
        </div>

        {/* القسم الأيمن: المعلومات والطلب */}
        <div className="details-info-box">
          <span className="product-category-tag">{product.category}</span>
          <h1 className="details-title">{product.title}</h1>

          {/* التقييم */}
          <div className="details-rating">
            <div className="stars">
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span>{product.rating || 4.8}</span>
            </div>
            <span className="reviews-text">• 56 avis vérifiés</span>
            <span className="stock-status">
              <CheckCircle2 size={16} color="#10b981" /> En Stock
            </span>
          </div>

          {/* السعر */}
          <div className="details-price-wrapper">
            <span className="current-price">{product.price} DZD</span>
            {product.oldPrice && (
              <span className="old-price">{product.oldPrice} DZD</span>
            )}
          </div>

          {/* الوصف التفصيلي */}
          <div className="details-description">
            <h3>Description :</h3>
            <p>{product.description}</p>
            <ul className="product-specs-list">
              <li>✔️ Produit 100% Original & Authentique</li>
              <li>✔️ Garantie officielle 12 mois</li>
              <li>✔️ Câble de charge et accessoires inclus</li>
            </ul>
          </div>

          {/* تحديد الكمية والأزرار */}
          <div className="actions-box">
            <div className="quantity-selector">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>

            <button 
              className="btn-add-cart"
              onClick={() => onAddToCart && onAddToCart(product.id, quantity)}
            >
              <ShoppingCart size={18} /> Ajouter au panier ({quantity * product.price} DZD)
            </button>
          </div>

          {/* قسم التوصيل لـ 58 ولاية */}
          <div className="delivery-card">
            <h3>🚚 Détails de Livraison (58 Wilayas)</h3>
            
            <div className="wilaya-select-group">
              <label>Calculer la livraison pour votre wilaya :</label>
              <select 
                value={selectedWilaya} 
                onChange={(e) => setSelectedWilaya(e.target.value)}
              >
                <option value="Skikda">21 - Skikda (400 DZD - 24h)</option>
                <option value="Alger">16 - Alger (500 DZD - 24-48h)</option>
                <option value="Constantine">25 - Constantine (400 DZD - 24h)</option>
                <option value="Annaba">23 - Annaba (400 DZD - 24h)</option>
                <option value="Oran">31 - Oran (600 DZD - 48h)</option>
                <option value="Autre">Autres Wilayas (600 à 900 DZD)</option>
              </select>
            </div>

            <div className="delivery-perks">
              <div className="perk-item">
                <Truck size={20} color="#2563eb" />
                <div>
                  <strong>Livraison à domicile ou Stop Desk</strong>
                  <p>Réception sous 24 à 48 heures</p>
                </div>
              </div>

              <div className="perk-item">
                <ShieldCheck size={20} color="#10b981" />
                <div>
                  <strong>Paiement à la livraison</strong>
                  <p>Ouvrez et vérifiez votre colis avant de payer</p>
                </div>
              </div>

              <div className="perk-item">
                <RotateCcw size={20} color="#f59e0b" />
                <div>
                  <strong>Retour garanti</strong>
                  <p>Échange ou remboursement sous 7 jours</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;