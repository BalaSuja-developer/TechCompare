import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, Star, Check, Minus, ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  image_url: string;
  rating: string;
  reviews: number;
  specs: {
    display: string;
    processor: string;
    ram: string;
    storage: string;
    camera: string;
    battery: string;
    os: string;
  };
  features: string[];
}

const CompareProducts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  // Get selected products from navigation state
  useEffect(() => {
    if (location.state?.selectedProductIds) {
      const productIds = location.state.selectedProductIds;
      // Fetch full product details using these IDs
      fetchSelectedProducts(productIds);
    }
  }, [location.state]);

  // Fetch full product details for comparison
const fetchSelectedProducts = async (productIds: (string | number)[]) => {
  try {
    const token = localStorage.getItem('token'); // Replace 'token' with your key
    if (!token) {
      console.error('No auth token found');
      return;
    }

    const response = await fetch('http://localhost:3001/api/products/compare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Send the token
      },
      body: JSON.stringify({ productIds }),
    });

    const data = await response.json();
    if (data.success) {
      setSelectedProducts(data.data);
    } else {
      console.error('API error:', data.message);
    }
  } catch (error) {
    console.error('Error fetching selected products:', error);
  }
};

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const clearAllProducts = () => {
    setSelectedProducts([]);
  };

  const handleCompareNow = () => {
    navigate('/products');
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
    }).format(numPrice);
  };

  const getComparisonIcon = (value: string | number, allValues: (string | number)[]) => {
    if (typeof value === 'string' && !isNaN(parseFloat(value))) {
      const numValue = parseFloat(value);
      const numValues = allValues
        .map(v => typeof v === 'string' ? parseFloat(v) : v)
        .filter(v => !isNaN(v));

      const max = Math.max(...numValues);
      const min = Math.min(...numValues);

      if (numValue === max && numValues.length > 1) return <Check className="h-4 w-4 text-emerald-500" />;
      if (numValue === min && numValues.length > 1) return <Minus className="h-4 w-4 text-red-500" />;
    }

    if (typeof value === 'number') {
      const numValues = allValues.filter(v => typeof v === 'number') as number[];
      const max = Math.max(...numValues);
      const min = Math.min(...numValues);

      if (value === max && numValues.length > 1) return <Check className="h-4 w-4 text-emerald-500" />;
      if (value === min && numValues.length > 1) return <Minus className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  if (selectedProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <center><ShoppingCart className="h-16 w-16 text-gray-400 mb-4" /></center>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products selected for comparison</h3>
          <p className="text-gray-600 mb-6">
            Start comparing smartphones by selecting multiple products from our collection. 
            Compare specs, prices, and features side-by-side to find your perfect match.
          </p>
          <button
            onClick={handleCompareNow}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Compare Now</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Compare Products</h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Compare the specifications of your selected products to make an informed decision
            </p>
            <button
              onClick={handleCompareNow}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Compare More</span>
            </button>
          </div>
        </div>

        {/* Selected Products Summary */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected for comparison
                </h3>
                <p className="text-sm text-blue-700">
                  {selectedProducts.map(p => p.name).join(', ')}
                </p>
              </div>
              <button
                onClick={clearAllProducts}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {selectedProducts.length > 0 && (
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
                            className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 transition-colors z-10"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-24 h-24 object-cover rounded-lg mx-auto mb-3"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96x96?text=No+Image';
                            }}
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
                          {product.reviews && <span className="text-sm text-gray-500">({product.reviews})</span>}
                          {getComparisonIcon(product.rating, selectedProducts.map(p => p.rating))}
                        </div>
                      </td>
                    ))}
                  </tr>
                  {/* Specifications */}
                  {selectedProducts.length > 0 && selectedProducts[0].specs && Object.keys(selectedProducts[0].specs).map((specKey) => (
                    <tr key={specKey} className="border-b border-gray-100">
                      <td className="p-6 font-medium text-gray-900 capitalize">
                        {specKey.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      {selectedProducts.map((product) => (
                        <td key={product.id} className="p-6 text-center text-gray-700">
                          {product.specs?.[specKey as keyof typeof product.specs] || 'N/A'}
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
                          {product.features?.map((feature, index) => (
                            <div key={index} className="flex items-center justify-center space-x-1 text-sm">
                              <Check className="h-3 w-3 text-emerald-500" />
                              <span>{feature}</span>
                            </div>
                          )) || <span className="text-gray-500 text-sm">No features listed</span>}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareProducts;