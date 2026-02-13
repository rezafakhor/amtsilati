// Cart management using localStorage

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  type: 'product' | 'package';
  productId?: string;
  packageId?: string;
  productName?: string;
}

export const getCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
};

export const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
  const cart = getCart();
  const existingIndex = cart.findIndex(i => i.id === item.id);
  
  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({ ...item, quantity });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
};

export const updateCartItem = (id: string, quantity: number) => {
  const cart = getCart();
  const index = cart.findIndex(i => i.id === id);
  
  if (index > -1) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  }
};

export const removeFromCart = (id: string) => {
  const cart = getCart().filter(i => i.id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
};

export const clearCart = () => {
  localStorage.removeItem('cart');
  window.dispatchEvent(new Event('cartUpdated'));
};

export const getCartTotal = (): number => {
  return getCart().reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const getCartCount = (): number => {
  return getCart().reduce((count, item) => count + item.quantity, 0);
};
