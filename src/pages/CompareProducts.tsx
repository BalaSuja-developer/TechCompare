import React, { useState } from 'react';
import { mockProducts, Product } from '../data/mockData';
import { Plus, X, ArrowRight, Star, Check, Minus } from 'lucide-react';

const CompareProducts = () => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const addProduct = (product: Product) => {
    if (selectedProducts.length < 3 && !selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getComparisonIcon = (value: string | number, allValues: (string | number)[]) => {
    if (typeof value === 'number') {
      const numValues = allValues.filter(v => typeof v === 'number') as number[];
      const max = Math.max(...numValues);
      const min = Math.min(...numValues);
      
      if (value === max && numValues.length > 1) return <Check className="h-4 w-4 text-emerald-500" />;
      if (value === min && numValues.length > 1) return <Minus className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Compare Products</h1>
          <p className="text-gray-600">Select up to 3 products to compare side by side</p>
        </div>

        {/* Product Selection */}
        {selectedProducts.length < 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Products to Compare</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockProducts
                .filter(product => !selectedProducts.find(p => p.id === product.id))
                .slice(0, 6)
                .map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => addProduct(product)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600">{formatPrice(product.price)}</p>
                    </div>
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {selectedProducts.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-6 font-semibold text-gray-900 bg-gray-50">Specifications</th>
                    {selectedProducts.map((product) => (
                      <th key={product.id} className="text-center p-6 min-w-64">
                        <div className="relative">
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-24 h-24 object-cover rounded-lg mx-auto mb-3"
                          />
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.brand}</p>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Price */}
                  <tr className="border-b border-gray-100">
                    <td className="p-6 font-medium text-gray-900">Price</td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                          {getComparisonIcon(product.price, selectedProducts.map(p => p.price))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Rating */}
                  <tr className="border-b border-gray-100">
                    <td className="p-6 font-medium text-gray-900">Rating</td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-6 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{product.rating}</span>
                          {getComparisonIcon(product.rating, selectedProducts.map(p => p.rating))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Specifications */}
                  {Object.keys(selectedProducts[0].specs).map((specKey) => (
                    <tr key={specKey} className="border-b border-gray-100">
                      <td className="p-6 font-medium text-gray-900 capitalize">
                        {specKey.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      {selectedProducts.map((product) => (
                        <td key={product.id} className="p-6 text-center text-gray-700">
                          {product.specs[specKey as keyof typeof product.specs]}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Features */}
                  <tr>
                    <td className="p-6 font-medium text-gray-900">Key Features</td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-6">
                        <div className="space-y-1">
                          {product.features.map((feature, index) => (
                            <div key={index} className="flex items-center justify-center space-x-1 text-sm">
                              <Check className="h-3 w-3 text-emerald-500" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products selected</h3>
            <p className="text-gray-600">Add some products to start comparing</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareProducts;