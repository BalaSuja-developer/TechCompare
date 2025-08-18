// import React from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { ArrowLeft, Star, Zap, BarChart3, CheckCircle, Smartphone } from 'lucide-react';
// import { mockProducts } from '../data/mockData';

// const ProductDetails = () => {
//   const { id } = useParams();
//   const product = mockProducts.find(p => p.id === id);

//   if (!product) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <Smartphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
//           <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
//           <Link
//             to="/products"
//             className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Back to Products
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const formatPrice = (price: number) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//     }).format(price);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Back Button */}
//         <Link
//           to="/products"
//           className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8 group"
//         >
//           <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
//           <span>Back to Products</span>
//         </Link>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
//           {/* Product Image */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
//             <img
//               src={product.image}
//               alt={product.name}
//               className="w-full h-96 object-cover rounded-lg"
//             />
//           </div>

//           {/* Product Info */}
//           <div className="space-y-6">
//             <div>
//               <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
//                 {product.brand}
//               </span>
//               <h1 className="text-3xl font-bold text-gray-900 mt-4">{product.name}</h1>
//               <div className="flex items-center space-x-4 mt-4">
//                 <div className="flex items-center space-x-1">
//                   <Star className="h-5 w-5 text-yellow-400 fill-current" />
//                   <span className="text-lg font-medium">{product.rating}</span>
//                   <span className="text-gray-600">({product.reviews} reviews)</span>
//                 </div>
//               </div>
//               <div className="text-4xl font-bold text-gray-900 mt-4">
//                 {formatPrice(product.price)}
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
//               <Link
//                 to="/predict"
//                 className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 flex-1"
//               >
//                 <Zap className="h-5 w-5" />
//                 <span>Predict Price</span>
//               </Link>
//               <Link
//                 to="/compare"
//                 className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 flex-1"
//               >
//                 <BarChart3 className="h-5 w-5" />
//                 <span>Compare</span>
//               </Link>
//             </div>

//             {/* Features */}
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
//               <div className="grid grid-cols-2 gap-2">
//                 {product.features.map((feature, index) => (
//                   <div key={index} className="flex items-center space-x-2">
//                     <CheckCircle className="h-4 w-4 text-emerald-500" />
//                     <span className="text-gray-700">{feature}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Specifications */}
//         <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
//           <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {Object.entries(product.specs).map(([key, value]) => (
//               <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                 <span className="font-medium text-gray-900 capitalize">
//                   {key.replace(/([A-Z])/g, ' $1').trim()}
//                 </span>
//                 <span className="text-gray-600">{value}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Similar Products */}
//         <div className="mt-12">
//           <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {mockProducts
//               .filter(p => p.id !== product.id && p.brand === product.brand)
//               .slice(0, 3)
//               .map((similarProduct) => (
//                 <Link
//                   key={similarProduct.id}
//                   to={`/products/${similarProduct.id}`}
//                   className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200"
//                 >
//                   <img
//                     src={similarProduct.image}
//                     alt={similarProduct.name}
//                     className="w-full h-48 object-cover"
//                   />
//                   <div className="p-4">
//                     <h3 className="font-semibold text-gray-900">{similarProduct.name}</h3>
//                     <p className="text-blue-600 font-bold mt-2">{formatPrice(similarProduct.price)}</p>
//                   </div>
//                 </Link>
//               ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductDetails;


import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Zap, BarChart3, CheckCircle, Smartphone } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
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
  rating: number;
  reviews: number;
}

const BASE_URL = "http://localhost:3001/api"; // 🔥 change to your API base URL

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

  useEffect(() => {
    if (!id) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch product by ID
        const res = await fetch(`${BASE_URL}/products/${id}`);
        const productData = await res.json();

        if (res.ok && productData) {
          setProduct(productData);

          // 2. Fetch all for similar products
          const resAll = await fetch(`${BASE_URL}/products`);
          const allData = await resAll.json();

          if (resAll.ok && Array.isArray(allData)) {
            const others = allData
              .filter((p: Product) => p.id !== id && p.brand === productData.brand)
              .slice(0, 3);
            setSimilarProducts(others);
          }
        } else {
          setError(productData?.error || "Failed to fetch product details.");
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong fetching product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  // Loading state
  if (loading) return <p className="text-center mt-20">Loading product details...</p>;

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
              src={product.image}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
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
                  <span className="text-gray-600">({product.reviews} reviews)</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mt-4">{formatPrice(product.price)}</div>
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
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
              <div className="grid grid-cols-2 gap-2">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
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
                  <img src={sp.image} alt={sp.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{sp.name}</h3>
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
