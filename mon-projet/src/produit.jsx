import './product.css';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ProductCard({ 
  id, 
  title, 
  price, 
  oldPrice, 
  image, 
  description, 
  rating = 4.8, 
  isNew = false, 
  discount,
  onAddToCart 
}) {
  const navigate = useNavigate();

  // الانتقال لصفحة التفاصيل
  const handleOpenDetails = () => {
    navigate(`/produit/${id}`);
  };

  return (
    <div className="product-card" id={`product-${id}`} data-id={id}>
      <div className="product-image-container" onClick={handleOpenDetails} style={{ cursor: 'pointer' }}>
        <div className="product-badges">
          {discount && <span className="badge badge-discount">-{discount}%</span>}
          {isNew && <span className="badge badge-new">Nouveau</span>}
        </div>

        <button 
          className="btn-wishlist" 
          title="Ajouter aux favoris" 
          onClick={(e) => { e.stopPropagation(); }}
        >
          <Heart size={18} />
        </button>

        <img src={image || "https://placehold.co/300x200?text=Produit"} alt={title} className="product-img" />
      </div>

      <div className="product-info">
        <div className="product-rating">
          <Star size={14} className="star-icon" fill="#f59e0b" color="#f59e0b" />
          <span>{rating}</span>
          <span className="reviews-count">(42 avis)</span>
        </div>

        <h3 className="product-title" onClick={handleOpenDetails} style={{ cursor: 'pointer' }}>
          {title || "Nom du produit"}
        </h3>
        <p className="product-desc">{description}</p>

        <div className="product-footer">
          <div className="price-wrapper">
            <span className="product-price">{price || "0"} DZD</span>
            {oldPrice && <span className="product-old-price">{oldPrice} DZD</span>}
          </div>
          
          <button 
            className="btn-buy" 
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart && onAddToCart(id);
            }}
          >
            <ShoppingCart size={16} /> Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;