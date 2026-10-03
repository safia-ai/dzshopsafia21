/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';

export const CartContext = createContext();
const cartStorageKey = 'dzshop_panier';

function readStoredCart() {
  try {
    const storedCart = JSON.parse(localStorage.getItem(cartStorageKey) || '[]');
    return Array.isArray(storedCart) ? storedCart : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(readStoredCart);

  useEffect(() => {
    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    } catch {
      // The in-memory cart remains usable when browser storage is unavailable.
    }
  }, [cart]);

  useEffect(() => {
    const syncCart = (event) => {
      if (event.key === cartStorageKey) setCart(readStoredCart());
    };
    window.addEventListener('storage', syncCart);
    return () => window.removeEventListener('storage', syncCart);
  }, []);

  const addToCart = (product) => {
    setCart((prev) => {
      const productId = String(product.id ?? product._id);
      const exists = prev.find((item) => String(item.id ?? item._id) === productId);
      if (exists) {
        return prev.map((item) =>
          String(item.id ?? item._id) === productId
            ? { ...item, quantity: (item.quantity || item.qte || 1) + 1, qte: (item.qte || item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prev, { ...product, id: productId, quantity: 1, qte: 1 }];
    });
  };

  const updateQty = (id, nouvelleQte) => {
    if (nouvelleQte <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (String(item.id ?? item._id) === String(id) ? { ...item, quantity: nouvelleQte, qte: nouvelleQte } : item))
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => String(item.id ?? item._id) !== String(id)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const total = cart.reduce((sum, item) => sum + (item.price || item.prix || 0) * (item.quantity || item.qte || 1), 0);
  const nbItems = cart.reduce((sum, item) => sum + (item.quantity || item.qte || 1), 0);
  const livraison = total >= 10000 || total === 0 ? 0 : 500;

  return (
    <CartContext.Provider
      value={{
        cart,
        panier: cart,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        total,
        totalPrice: total,
        nbItems,
        totalCount: nbItems,
        livraison,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);