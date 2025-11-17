import React, { useState, useMemo, useEffect } from 'react';
import apiService from '../services/apiService';
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
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'all', name: 'Todos', icon: '👀'},
    { id: 'burgers', name: 'Burgers', icon: '🍔' },
    { id: 'papas', name: 'Papas / Sides', icon: '🍟' },
    { id: 'bebidas', name: 'Bebidas', icon: '🥤' },
    { id: 'salsas', name: 'Salsas', icon: '🥄' },
    { id: 'agregados', name: 'Agregados', icon: '🥬' }
  ];

  // Cargar productos desde la API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const productsData = await apiService.getProducts();
        console.log('✅ Productos cargados:', productsData);
        console.log('📊 Total de productos:', productsData.length);
        console.log('📂 Categorías encontradas:', [...new Set(productsData.map(p => p.category))]);
        setProducts(productsData);
      } catch (err) {
        console.error('❌ Error al cargar productos:', err);
        setError('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    console.log('🔍 Filtrando productos:', {
      totalProducts: products.length,
      activeCategory,
      searchTerm
    });
    
    // Filtrar productos por categoría activa y disponibilidad
    let categoryProducts = products.filter(product => {
      // Verificar disponibilidad (puede ser booleano o número)
      const isAvailable = product.available === true || product.available === 1;
      
      // Si la categoría es 'all', mostrar todos los productos disponibles
      if (activeCategory === 'all') {
        return isAvailable;
      }
      
      // Filtrar por categoría específica
      return product.category === activeCategory && isAvailable;
    });
    
    console.log('📦 Productos después de filtrar por categoría:', categoryProducts.length);
    
    if (searchTerm) {
      categoryProducts = categoryProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      console.log('🔎 Productos después de buscar:', categoryProducts.length);
    }
    
    return categoryProducts;
  }, [products, activeCategory, searchTerm]);

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

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍔</div>
          <div className="text-xl">Cargando menú...</div>
        </div>
      </div>
    );
  }

  // Mostrar error si hay algún problema
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-xl text-red-400 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
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