'use client';

import { useState, useEffect } from 'react';
import { Product, ApiResponse, Category } from '@/types/product';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function AdminPage() {
  const { user, token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    categoryId: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data: ApiResponse<Product[]> = await res.json();
      if (data.success) {
        setProducts(data.data);
        extractCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractCategories = (products: Product[]) => {
    const categoryMap = new Map<number, Category>();
    products.forEach((product) => {
      if (product.category) {
        categoryMap.set(product.category.id, product.category);
      }
    });
    setCategories(Array.from(categoryMap.values()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const url = selectedProduct
      ? `${API_URL}/products/${selectedProduct.id}`
      : `${API_URL}/products`;
    const method = selectedProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          precio: parseFloat(formData.precio),
          descripcion: formData.descripcion || undefined,
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
        }),
      });

      if (res.ok) {
        setSuccess(selectedProduct ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
        setFormData({ nombre: '', precio: '', descripcion: '', categoryId: '' });
        setSelectedProduct(null);
        fetchProducts();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Error al guardar el producto');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al guardar el producto');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      nombre: product.nombre,
      precio: product.precio.toString(),
      descripcion: product.descripcion || '',
      categoryId: product.category?.id.toString() || '',
    });
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setSuccess('Producto eliminado exitosamente');
        fetchProducts();
        if (selectedProduct?.id === id) {
          setSelectedProduct(null);
          setFormData({ nombre: '', precio: '', descripcion: '', categoryId: '' });
        }
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Error al eliminar el producto');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al eliminar el producto');
    }
  };

  const handleCancel = () => {
    setSelectedProduct(null);
    setFormData({ nombre: '', precio: '', descripcion: '', categoryId: '' });
    setError('');
    setSuccess('');
  };

  const handleNewProduct = () => {
    handleCancel();
  };

  const filteredProducts = filterCategory
    ? products.filter((p) => p.category?.id.toString() === filterCategory)
    : products;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-center text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Panel de Administración
        </h1>
        <span className="text-sm text-gray-600">
          Usuario: <span className="font-semibold">{user?.nombre}</span>
        </span>
      </div>

      {/* Mensajes de éxito/error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Panel Izquierdo: Filtro y Formulario */}
        <aside className="lg:w-96 shrink-0">
          {/* Filtro de Categoría */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Categoría
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
            >
              <option value="">Todas las categorías ({products.length})</option>
              {categories.map((category) => {
                const count = products.filter((p) => p.category?.id === category.id).length;
                return (
                  <option key={category.id} value={category.id}>
                    {category.nombre} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Formulario */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              {!selectedProduct && (
                <span className="text-xs text-gray-500">CREAR</span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
                  placeholder="Nombre del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio *
                </label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
                  placeholder="Descripción del producto..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 transition-colors font-medium"
                >
                  {selectedProduct ? 'Actualizar' : 'Crear Producto'}
                </button>
                {selectedProduct && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              {selectedProduct && (
                <button
                  type="button"
                  onClick={() => handleDelete(selectedProduct.id)}
                  className="w-full mt-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 transition-colors font-medium"
                >
                  Eliminar Producto
                </button>
              )}
            </form>
          </div>
        </aside>

        {/* Panel Derecho: Tabla de Productos */}
        <main className="flex-1">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Listado de Productos {filterCategory && `(${filteredProducts.length})`}
              </h2>
              <button
                onClick={handleNewProduct}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
              >
                + Nuevo Producto
              </button>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 mb-4">
                  {filterCategory ? 'No hay productos en esta categoría' : 'No hay productos todavía'}
                </p>
                {!filterCategory && (
                  <button
                    onClick={handleNewProduct}
                    className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Crear primer producto
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                          selectedProduct?.id === product.id ? 'bg-gray-50' : ''
                        }`}
                        onClick={() => handleSelectProduct(product)}
                      >
                        <td className="px-6 py-4 text-sm text-gray-500">
                          #{product.id}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {product.nombre}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${product.precio}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {product.category ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {product.category.nombre}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">Sin categoría</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectProduct(product);
                            }}
                            className="text-gray-600 hover:text-gray-900 mr-4 font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(product.id);
                            }}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}