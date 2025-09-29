import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';


const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  // Estados para búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  // Estados para modal de confirmación
  const [showDisableAllModal, setShowDisableAllModal] = useState(false);
  const [disablingAll, setDisablingAll] = useState(false);
  const [showActiveAllModal, setShowActiveAllModal] = useState(false);
  const [activatingAll, setActivatingAll] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'burgers',
    image: '',
    available: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  

  const categories = [
    { value: 'burgers', label: 'Burgers' },
    { value: 'papas', label: 'Papas / Sides' },
    { value: 'bebidas', label: 'Bebidas' },
    { value: 'salsas', label: 'Salsas' },
    { value: 'agregados', label: 'Agregados' }
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  // Efecto para filtrar productos cuando cambia el término de búsqueda o la lista de productos
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [products, searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const productsData = await apiService.getAllProducts();
      setProducts(productsData);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return null;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('http://localhost:3006/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const result = await response.json();
      return `http://localhost:3006${result.imageUrl}`;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      let imageUrl = formData.image;
      
      // Si hay un archivo seleccionado, subirlo primero
      if (selectedFile) {
        imageUrl = await uploadImage();
      }
      
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        image: imageUrl
      };

      if (editingProduct) {
        await apiService.updateProduct(editingProduct.id, productData);
      } else {
        await apiService.createProduct(productData);
      }

      await loadProducts();
      resetForm();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      setError(err.message || 'Error al guardar el producto');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      image: product.image || '',
      available: Boolean(product.available)
    });
    setSelectedFile(null);
    setImagePreview(null);
    setUploadingImage(false);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      setError(null);
      await apiService.deleteProduct(productId);
      await loadProducts();
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setError(err.message || 'Error al eliminar el producto');
    }
  };

  const handleToggleAvailability = async (productId) => {
    // 1) estado previo para posible rollback
    const prev = products;

    // 2) Optimistic UI: voltear available SOLO en esa fila
    setProducts(p =>
      p.map(x => x.id === productId ? { ...x, available: x.available ? 0 : 1 } : x)
    );

    setTogglingId(productId);
    try {
      // 3) llamada a la API (sin tocar "loading")
      await apiService.toggleProductAvailability(productId);
      // listo. si quieres sincronizar silenciosamente, puedes volver a leer sin setLoading:
      // const fresh = await apiService.getAllProducts(); setProducts(fresh);
    } catch (err) {
      console.error('Error al cambiar disponibilidad:', err);
      // 4) rollback si falla
      setProducts(prev);
      setError(err.message || 'Error al cambiar la disponibilidad');
    } finally {
      setTogglingId(null);
    }
  };
  // Funcion para Habilitar todos los productos
  const handleActiveAllProducts = async () => {
    setActivatingAll(true);
    const previousProducts = [...products];
    
    try {
      setError(null);
      
      // Optimistic UI: habilitar todos los productos no disponibles
      setProducts(prev => prev.map(product => 
        !product.available ? { ...product, available: 1 } : product
      ));
      
      // Obtener todos los productos no disponibles
      const notAvailableProducts = previousProducts.filter(product => !product.available);
      
      // Habilitar cada producto no disponible
      const promises = notAvailableProducts.map(product => 
        apiService.toggleProductAvailability(product.id)
      );
      
      await Promise.all(promises);
      
      // Cerrar modal correcto
      setShowActiveAllModal(false);
      
    } catch (err) {
      console.error('Error al habilitar productos:', err);
      // Rollback en caso de error
      setProducts(previousProducts);
      setError(err.message || 'Error al habilitar los productos');
    } finally {
      setActivatingAll(false);
    }
  };
  // Función para deshabilitar todos los productos
  const handleDisableAllProducts = async () => {
    setDisablingAll(true);
    const previousProducts = [...products];
    
    try {
      setError(null);
      
      // Optimistic UI: deshabilitar todos los productos
      setProducts(prev => prev.map(product => ({ ...product, available: 0 })));
      
      // Obtener todos los productos disponibles
      const availableProducts = previousProducts.filter(product => product.available);
      
      // Deshabilitar cada producto disponible
      const promises = availableProducts.map(product => 
        apiService.toggleProductAvailability(product.id)
      );
      
      await Promise.all(promises);
      
      // Cerrar modal
      setShowDisableAllModal(false);
      
    } catch (err) {
      console.error('Error al deshabilitar productos:', err);
      // Rollback en caso de error
      setProducts(previousProducts);
      setError(err.message || 'Error al deshabilitar los productos');
    } finally {
      setDisablingAll(false);
    }
  };

  // Función para manejar la búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Función para limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
  };


  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'burgers',
      image: '',
      available: true
    });
    setEditingProduct(null);
    setShowForm(false);
    setSelectedFile(null);
    setImagePreview(null);
    setUploadingImage(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center text-white">
          <div className="text-2xl mb-2">⏳</div>
          <div>Cargando productos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestión de Productos</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowActiveAllModal(true)}
            disabled={activatingAll || products.filter(p => !p.available).length === 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
          >
            {activatingAll ? 'Habilitando...' : 'Habilitar Todos'}
          </button>
          <button
            onClick={() => setShowDisableAllModal(true)}
            disabled={disablingAll || products.filter(p => p.available).length === 0}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
          >
            {disablingAll ? 'Deshabilitando...' : 'Deshabilitar Todos'}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Agregar Producto
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar productos por nombre, descripción o categoría..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-400">
            Mostrando {filteredProducts.length} de {products.length} productos
          </div>
        )}
      </div>

      {/* Modal de confirmación para deshabilitar todos */}
      {showDisableAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-white">Confirmar Acción</h3>
            <p className="text-gray-300 mb-6">
              ¿Estás seguro de que quieres deshabilitar todos los productos disponibles? 
              Esta acción afectará a {products.filter(p => p.available).length} productos.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDisableAllProducts}
                disabled={disablingAll}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
              >
                {disablingAll ? 'Deshabilitando...' : 'Sí, Deshabilitar Todos'}
              </button>
              <button
                onClick={() => setShowDisableAllModal(false)}
                disabled={disablingAll}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white px-4 py-2 rounded transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para activar todos */}
      {showActiveAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-white">Confirmar Acción</h3>
            <p className="text-gray-300 mb-6">
              ¿Estás seguro de que quieres habilitar todos los productos no disponibles? 
              Esta acción afectará a {products.filter(p => !p.available).length} productos.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleActiveAllProducts}
                disabled={activatingAll}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
              >
                {activatingAll ? 'Habilitando...' : 'Sí, Habilitar Todos'}
              </button>
              <button
                onClick={() => setShowActiveAllModal(false)}
                disabled={activatingAll}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white px-4 py-2 rounded transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de producto */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Precio</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Imagen del Producto</label>
                
                {/* Opción de URL */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-400 mb-1">URL de Imagen</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Separador */}
                <div className="text-center text-gray-400 text-sm mb-3">o</div>

                {/* Opción de subir archivo */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-400 mb-1">Subir Imagen desde Computadora</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                </div>

                {/* Vista previa de imagen */}
                {imagePreview && (
                  <div className="mb-3">
                    <label className="block text-xs text-gray-400 mb-1">Vista Previa</label>
                    <img 
                      src={imagePreview} 
                      alt="Vista previa" 
                      className="w-32 h-32 object-cover rounded border border-gray-600"
                    />
                  </div>
                )}

                {/* Estado de subida */}
                {uploadingImage && (
                  <div className="text-blue-400 text-sm">
                    Subiendo imagen...
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Disponible</label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
                >
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de productos */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-white">Nombre</th>
                <th className="px-4 py-3 text-left text-white">Categoría</th>
                <th className="px-4 py-3 text-left text-white">Precio</th>
                <th className="px-4 py-3 text-left text-white">Estado</th>
                <th className="px-4 py-3 text-left text-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-white">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-gray-400 truncate max-w-xs">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="capitalize text-white">{product.category}</span>
                  </td>
                  <td className="px-4 py-3 text-white">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.available 
                        ? 'bg-green-900 text-green-200' 
                        : 'bg-red-900 text-red-200'
                    }`}>
                      {product.available ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleAvailability(product.id)}
                        disabled={togglingId === product.id}   // ← evita doble clic, sin overlay global
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          product.available
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {product.available ? 'Deshabilitar' : 'Habilitar'}
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-400">
            {searchTerm ? 'No se encontraron productos que coincidan con la búsqueda' : 'No hay productos registrados'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;