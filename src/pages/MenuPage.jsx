import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiService from '../services/apiService'
import MenuHeader from '../components/MenuHeader'
import CategoryTabs from '../components/CategoryTabs'
import SearchBar from '../components/SearchBar'
import MenuGrid from '../components/MenuGrid'
import Cart from '../components/Cart'
import ProductModal from '../components/ProductModal'
import Checkout from '../components/Checkout'
import OrderConfirmation from '../components/OrderConfirmation'

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState('burgers')
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const categories = [
    { id: 'burgers', name: 'Burgers', icon: '🍔' },
    { id: 'papas', name: 'Papas / Sides', icon: '🍟' },
    { id: 'bebidas', name: 'Bebidas', icon: '🥤' },
    { id: 'salsas', name: 'Salsas', icon: '🥄' },
    { id: 'agregados', name: 'Agregados', icon: '🥬' }
  ]

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const data = await apiService.getProducts()
        setProducts(data)
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    // Filtrar productos por categoría activa y disponibilidad
    let categoryProducts = products.filter(product => 
      product.category === activeCategory && product.available !== false
    )
    
    if (searchTerm) {
      categoryProducts = categoryProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    return categoryProducts
  }, [products, activeCategory, searchTerm])

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId)
      return
    }
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handleCheckout = () => {
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }

  const handleOrderComplete = (orderData) => {
    setIsCheckoutOpen(false)
    setCompletedOrder(orderData)
    setCart([]) // Limpiar carrito
  }

  const handleNewOrder = () => {
    setCompletedOrder(null)
    setActiveCategory('burgers')
    setSearchTerm('')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header con botón de volver */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link 
                to="/" 
                className="text-burger-yellow hover:text-yellow-400 transition-colors mr-4"
                title="Volver al inicio"
              >
                ← Inicio
              </Link>
              <div className="text-3xl">🍔</div>
              <div>
                <h1 className="text-2xl font-bold text-white">Burger Menu</h1>
                <p className="text-gray-400 text-sm">Hamburguesas Gourmet</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                to="/admin"
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                title="Panel de Administración"
              >
                <span className="text-lg">⚙️</span>
                <span className="hidden sm:inline">Admin</span>
              </Link>
              
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
              >
                <span className="text-xl">🛒</span>
                <span>Carrito</span>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      
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
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          </div>
        ) : (
          <MenuGrid 
            products={filteredProducts}
            onAddToCart={addToCart}
            onProductClick={setSelectedProduct}
          />
        )}
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
  )
}

export default MenuPage