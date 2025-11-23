'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product, ApiResponse } from '@/types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Category {
  id: number;
  nombre: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);

      if (!res.ok) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const data: ApiResponse<Product[]> = await res.json();
      if (data.success) {
        setProducts(data.data);
        extractCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const extractCategories = (products: Product[]) => {
    const categoryMap = new Map<number, string>();
    
    products.forEach((product) => {
      if (product.category) {
        categoryMap.set(product.category.id, product.category.nombre);
      }
    });

    const uniqueCategories = Array.from(categoryMap, ([id, nombre]) => ({
      id,
      nombre,
    }));

    setCategories(uniqueCategories);
  };

  const filterProducts = () => {
    if (selectedCategory === null) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) => product.category?.id === selectedCategory
      );
      setFilteredProducts(filtered);
    }
  };

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, products]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-500">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Productos</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filtro de Categorías */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Categorías
            </h2>
            <div className="space-y-2">
              <button
                onClick={() => handleCategoryClick(null)}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  selectedCategory === null
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Todas ({products.length})
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.nombre} (
                  {
                    products.filter((p) => p.category?.id === category.id)
                      .length
                  }
                  )
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Lista de Productos */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">
                {products.length === 0
                  ? 'No hay productos disponibles'
                  : 'No hay productos en esta categoría'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {product.nombre}
                  </h2>
                  <p className="text-2xl font-bold text-gray-900 mb-3">
                    ${product.precio}
                  </p>
                  {product.category && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded mb-2">
                      {product.category.nombre}
                    </span>
                  )}
                  {product.descripcion && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {product.descripcion}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}