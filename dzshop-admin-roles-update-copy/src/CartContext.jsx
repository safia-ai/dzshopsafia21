import React, { createContext, useContext, useState } from 'react';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1, qte: (item.qte || 1) + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, qte: 1 }];
    });
  };

  const updateQty = (id, nouvelleQte) => {
    if (nouvelleQte <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: nouvelleQte, qte: nouvelleQte } : item))
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
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