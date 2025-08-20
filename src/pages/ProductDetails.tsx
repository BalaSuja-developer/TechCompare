import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Zap, BarChart3, CheckCircle, Smartphone } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: string; // API returns string, not number
  image_url: string;
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
  rating: string; // API returns string, not number
  reviews: number;
  description: string;
  created_at: string;
  updated_at: string;
}

const BASE_URL = "http://localhost:3001/api";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numPrice);
  };

  useEffect(() => {
    if (!id) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch product by ID
        const res = await fetch(`${BASE_URL}/products/${id}`);
        const productResponse = await res.json();

        if (res.ok && productResponse.success && productResponse.data) {
          const productData = productResponse.data; // Extract data from API response
          setProduct(productData);

          // 2. Fetch similar products (same brand)
          const resAll = await fetch(`${BASE_URL}/products/filter?brand=${encodeURIComponent(productData.brand)}&limit=4`);
          const allResponse = await resAll.json();

          if (resAll.ok && allResponse.success && Array.isArray(allResponse.data)) {
            const others = allResponse.data
              .filter((p: Product) => p.id !== id) // Exclude current product
              .slice(0, 3); // Get first 3
            setSimilarProducts(others);
          }
        } else {
          setError(productResponse?.error || "Failed to fetch product details.");
        }
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || "Something went wrong fetching product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error or 404 state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Smartphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The product you're looking for doesn't exist."}</p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Success UI
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Products</span>
        </Link>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
              onError={(e) => {
                // Fallback image if the main image fails to load
                e.currentTarget.src = 'https://via.placeholder.com/400x400?text=No+Image';
              }}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {product.brand}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mt-4">{product.name}</h1>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-medium">{product.rating}</span>
                  <span className="text-gray-600">({product.reviews.toLocaleString()} reviews)</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mt-4">
                {formatPrice(product.price)}
              </div>
              {/* Description */}
              {product.description && (
                <p className="text-gray-600 mt-4">{product.description}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Link
                to="/predict"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 flex-1"
              >
                <Zap className="h-5 w-5" />
                <span>Predict Price</span>
              </Link>
              <Link
                to="/compare"
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 flex-1"
              >
                <BarChart3 className="h-5 w-5" />
                <span>Compare</span>
              </Link>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Specifications */}
        {product.specs && (
          <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-gray-600">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarProducts.map((sp) => (
                <Link
                  key={sp.id}
                  to={`/products/${sp.id}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200"
                >
                  <img 
                    src={sp.image_url} 
                    alt={sp.name} 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{sp.name}</h3>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{sp.rating}</span>
                    </div>
                    <p className="text-blue-600 font-bold mt-2">{formatPrice(sp.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetails;