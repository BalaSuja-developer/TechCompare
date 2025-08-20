import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Star, Eye, Plus, Loader } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

// TypeScript interfaces
interface ProductSpecs {
  display_size?: string;
  ram?: string;
  storage?: string;
}

interface Product {
  id: string | number;
  name: string;
  brand: string;
  price: number;
  rating?: number;
  image_url?: string;
  specs?: ProductSpecs;
  display_size?: string;
  ram?: string;
  storage?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface APIResponse {
  success: boolean;
  data: Product[];
  pagination?: PaginationInfo;
}

const ProductList: React.FC = () => {
  // API state
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: Infinity, // This ensures no products are filtered initially
  });

  const [selectedProducts, setSelectedProducts] = useState<(string | number)[]>(
    []
  );

  const location = useLocation();
  const navigate = useNavigate();

  const [receivedProductIds, setReceivedProductIds] = useState<string[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  // Check if we're in development mode (simple browser-compatible check)
  const isDevelopment = () => {
    try {
      return (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "" ||
        window.location.port !== ""
      );
    } catch {
      return false;
    }
  };

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Get API URL from window object or use default
        const apiBaseUrl =
          (window as any).API_BASE_URL || "http://localhost:3001";

        // Try different API URL patterns - prioritize the working localhost:3001
        const possibleUrls = [
          `${apiBaseUrl}/api/products?page=${currentPage}&limit=50`,
          `http://localhost:3001/api/products?page=${currentPage}&limit=50`,
          `/api/products?page=${currentPage}&limit=50`,
          `http://localhost:8000/api/products?page=${currentPage}&limit=50`,
        ];

        let lastError: Error | null = null;
        let success = false;

        for (const url of possibleUrls) {
          try {
            console.log(`Trying API URL: ${url}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(url, {
              method: "GET",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Check if response is HTML (error page)
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("text/html")) {
              throw new Error(
                `API returned HTML instead of JSON. Check if ${url} is the correct endpoint.`
              );
            }

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }

            const data: APIResponse = await response.json();
            console.log("API Response:", data);

            if (data.success && data.data) {
              // Convert price and rating from string to number
              const processedData = data.data.map((product) => ({
                ...product,
                price:
                  typeof product.price === "string"
                    ? parseFloat(product.price)
                    : product.price,
                rating:
                  typeof product.rating === "string"
                    ? parseFloat(product.rating)
                    : product.rating,
              }));

              setProducts(Array.isArray(processedData) ? processedData : []);
              setPagination(data.pagination || null);
              setError(null);
              success = true;
              break;
            }
          } catch (err) {
            lastError = err instanceof Error ? err : new Error("Unknown error");
            console.warn(`Failed to fetch from ${url}:`, err);
          }
        }

        if (!success) {
          throw lastError || new Error("All API endpoints failed");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  useEffect(() => {
    // Check if we received selected product IDs from ProductList
    if (location.state?.selectedProductIds) {
      const ids = location.state.selectedProductIds.map((id: string | number) =>
        String(id)
      );
      setReceivedProductIds(ids);
      fetchSpecificProducts(ids);
    }
    // Remove these lines - they don't exist in ProductList component
    // else {
    //   fetchAvailableProducts();
    //   fetchBrands();
    // }
  }, [location.state]);

  // Get unique brands from fetched products
  const brands = Array.from(
    new Set(products.map((product) => product.brand).filter(Boolean))
  );

  // Filter products client-side
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = !selectedBrand || product.brand === selectedBrand;
      const matchesPrice =
        product.price >= priceRange.min && product.price <= priceRange.max;

      return matchesSearch && matchesBrand && matchesPrice;
    });
  }, [products, searchTerm, selectedBrand, priceRange]);

  const toggleProductSelection = (productId: string | number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };
  const fetchAvailableProducts = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/products");
      const data: APIResponse = await response.json();
      if (data.success) {
        setAvailableProducts(data.data);
      }
    } catch (err) {
      console.error("Error fetching available products:", err);
    }
  };

  const fetchSpecificProducts = async (productIds: string[]) => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:3001/api/products/compare",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setSelectedProducts(data.data);
        setAvailableProducts(data.data);
      }
    } catch (error) {
      console.error("Error fetching selected products:", error);
      fetchAvailableProducts();
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state (only show if no products loaded)
  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error loading products
          </h3>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 block w-full"
            >
              Retry
            </button>
            <p className="text-xs text-gray-500">
              Make sure your API server is running on the correct port
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Smartphone Collection
          </h1>
          <p className="text-gray-600">
            Discover and compare the latest smartphones from top brands
          </p>
          {error && products.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
              <p className="text-yellow-800 text-sm">⚠️ {error}</p>
            </div>
          )}
          {pagination && (
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredProducts.length} of {products.length} products
              {pagination.totalPages > 1 && (
                <>
                  {" "}
                  (Page {pagination.currentPage} of {pagination.totalPages}) -
                  Total: {pagination.totalProducts}
                </>
              )}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Brand Filter */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>

            {/* Price Range */}
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min Price"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange((prev) => ({
                    ...prev,
                    min: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange((prev) => ({
                    ...prev,
                    max: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Compare Button */}
            <button
              onClick={() => {
                if (selectedProducts.length > 0) {
                  navigate("/compare", {
                    state: { selectedProductIds: selectedProducts },
                  });
                }
              }}
              disabled={selectedProducts.length === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                selectedProducts.length > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <span>Compare ({selectedProducts.length})</span>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 group"
            >
              {/* Product Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={
                    product.image_url ||
                    "https://via.placeholder.com/300x200?text=No+Image"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://via.placeholder.com/300x200?text=No+Image";
                  }}
                />
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => toggleProductSelection(product.id)}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      selectedProducts.includes(product.id)
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">
                    {product.brand || "Unknown"}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">
                      {product.rating || "N/A"}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>

                <div className="space-y-1 mb-4 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Display:</span>{" "}
                    {product.specs?.display_size || product.display_size || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">RAM:</span>{" "}
                    {product.specs?.ram || product.ram || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Storage:</span>{" "}
                    {product.specs?.storage || product.storage || "N/A"}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-gray-900">
                    {product.price ? formatPrice(product.price) : "Price N/A"}
                  </div>
                  <Link
                    to={`/products/${product.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No products found */}
        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              {products.length === 0
                ? "No products in database"
                : "Try adjusting your search criteria"}
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={!pagination.hasPrevPage}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                pagination.hasPrevPage
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Previous
            </button>

            <span className="text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, pagination.totalPages)
                )
              }
              disabled={!pagination.hasNextPage}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                pagination.hasNextPage
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
