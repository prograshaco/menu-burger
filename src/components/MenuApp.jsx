import React, { useState, useMemo } from 'react';
import menuData from '../data/menu.json';
import MenuHeader from './MenuHeader';
import CategoryTabs from './CategoryTabs';
import SearchBar from './SearchBar';
import MenuGrid from './MenuGrid';
import Cart from './Cart';
import ProductModal from './ProductModal';
import Checkout from './Checkout';
import OrderConfirmation from './OrderConfirmation';
import AdminDashboard from './AdminDashboard';

const MenuApp = () => {
  const [activeCategory, setActiveCategory] = useState('burgers');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);

  const categories = [
    { id: 'burgers', name: 'Burgers', icon: '🍔' },
    { id: 'papas', name: 'Papas / Sides', icon: '🍟' },
    { id: 'bebidas', name: 'Bebidas', icon: '🥤' },
    { id: 'salsas', name: 'Salsas', icon: '🥄' },
    { id: 'agregados', name: 'Agregados', icon: '🥬' }
  ];

  const filteredProducts = useMemo(() => {
    let products = menuData[activeCategory] || [];
    
    if (searchTerm) {
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.ingredients && product.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }
    
    return products;
  }, [activeCategory, searchTerm]);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = (orderData) => {
    setIsCheckoutOpen(false);
    setCompletedOrder(orderData);
    setCart([]); // Limpiar carrito
  };

  const handleNewOrder = () => {
    setCompletedOrder(null);
    setActiveCategory('burgers');
    setSearchTerm('');
  };

  // Si está en vista de administrador, mostrar solo el dashboard
  if (isAdminView) {
    return <AdminDashboard onBackToMenu={() => setIsAdminView(false)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <MenuHeader 
        cartItemsCount={getTotalItems()}
        onCartClick={() => setIsCartOpen(true)}
        onAdminClick={() => setIsAdminView(true)}
      />
      
      <div className="container mx-auto px-4 py-8">
        <CategoryTabs 
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <MenuGrid 
          products={filteredProducts}
          onAddToCart={addToCart}
          onProductClick={setSelectedProduct}
        />
      </div>
      
      {isCartOpen && (
        <Cart 
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onRemoveItem={removeFromCart}
          onUpdateQuantity={updateQuantity}
          totalPrice={getTotalPrice()}
          onCheckout={handleCheckout}
        />
      )}
      
      {isCheckoutOpen && (
        <Checkout 
          cartItems={cart}
          total={getTotalPrice()}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderComplete={handleOrderComplete}
        />
      )}
      
      {completedOrder && (
        <OrderConfirmation 
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
          onNewOrder={handleNewOrder}
        />
      )}
      
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
};

export default MenuApp;