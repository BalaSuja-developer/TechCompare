import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Download,
  BarChart3,
  Users,
  Smartphone,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ProductSpecs {
  display_size: string;
  processor: string;
  ram: string;
  storage: string;
  camera: string;
  battery: string;
  operating_system: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image_url: string;
  rating: number;
  reviews: number;
  description: string;
  specs: ProductSpecs;
  features: string[];
  created_at?: string;
  updated_at?: string;
}

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [featuresInput, setFeaturesInput] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: 0,
    image_url: "",
    rating: 0,
    reviews: 0,
    description: "",
    specs: {
      display_size: "",
      processor: "",
      ram: "",
      storage: "",
      camera: "",
      battery: "",
      operating_system: "",
    },
    features: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    null
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalProducts: 0,
  });

  // Add this function
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        setStatsData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/admin/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      const result = await response.json();
      // Extract the 'data' array from the response
      setProducts(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = "Product name is required";
    if (!formData.brand) errors.brand = "Brand is required";
    if (formData.price <= 0) errors.price = "Price must be greater than 0";
    if (!formData.image_url) errors.image_url = "Image URL is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        specs: formData.specs,
        features: formData.features,
      };
      const url = editingProduct
        ? `http://localhost:3001/api/admin/products/${editingProduct.id}`
        : "http://localhost:3001/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok)
        throw new Error(
          `Failed to ${editingProduct ? "update" : "create"} product`
        );
      await fetchProducts();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setCurrentStep(1);
    setFormData({
      name: "",
      brand: "",
      price: 0,
      image_url: "",
      rating: 0,
      reviews: 0,
      description: "",
      specs: {
        display_size: "",
        processor: "",
        ram: "",
        storage: "",
        camera: "",
        battery: "",
        operating_system: "",
      },
      features: [],
    });
    setEditingProduct(null);
    setFormErrors({});
    setFeaturesInput("");
  };

  const deleteProduct = async (productId: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/admin/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete product");
      await fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const toggleExpand = (productId: string) => {
    setExpandedProductId(expandedProductId === productId ? null : productId);
  };

  const statsArray = [
    {
      label: "Total Products",
      value: products.length,
      icon: Smartphone,
      color: "blue" as const,
    },
    {
      label: "Total Users",
      value: statsData.totalUsers || "0",
      icon: Users,
      color: "emerald" as const,
    },
    {
      label: "Add Product",
      value: "+",
      icon: Plus,
      color: "purple" as const,
      isAction: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage products, view analytics, and control the ML model
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statsArray.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: "bg-blue-100 text-blue-600",
              emerald: "bg-emerald-100 text-emerald-600",
              amber: "bg-amber-100 text-amber-600",
              purple: "bg-purple-100 text-purple-600",
            };

            const CardContent = (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      colorClasses[stat.color]
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );

            if (stat.isAction) {
              return (
                <button
                  key={index}
                  onClick={() => {
                    setShowAddForm(true);
                    setEditingProduct(null);
                    setCurrentStep(1);
                  }}
                  className="hover:scale-105 transition-transform cursor-pointer"
                >
                  {CardContent}
                </button>
              );
            }

            return <div key={index}>{CardContent}</div>;
          })}
        </div>

        {/* ML Model Status */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ML Model Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Model Accuracy</h3>
              <p className="text-2xl font-bold text-emerald-600">94.2%</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Training Data</h3>
              <p className="text-2xl font-bold text-blue-600">15,240</p>
            </div>
            <div className="text-center">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Smartphone className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Last Updated</h3>
              <p className="text-sm font-medium text-gray-600">2 hours ago</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-emerald-700 transition-all duration-200">
              Retrain Model
            </button>
          </div>
        </div> */}

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Product Management
            </h2>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6 text-center">Loading products...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-600">{error}</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <React.Fragment key={product.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {product.specs?.display_size || "N/A"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {product.brand || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-medium">
                          {formatPrice(product.price || 0)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-900">
                              {product.rating || 0}
                            </span>
                            <span className="text-gray-500">
                              ({product.reviews || 0})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setFormData({
                                  name: product.name || "",
                                  brand: product.brand || "",
                                  price: product.price || 0,
                                  image_url: product.image_url || "",
                                  rating: product.rating || 0,
                                  reviews: product.reviews || 0,
                                  description: product.description || "",
                                  specs: {
                                    display_size:
                                      product.specs?.display_size || "",
                                    processor: product.specs?.processor || "",
                                    ram: product.specs?.ram || "",
                                    storage: product.specs?.storage || "",
                                    camera: product.specs?.camera || "",
                                    battery: product.specs?.battery || "",
                                    operating_system:
                                      product.specs?.operating_system || "", // Make sure this is included
                                  },
                                  features: product.features || [],
                                });
                                setShowAddForm(true);
                                setCurrentStep(1);
                                setFeaturesInput(
                                  product.features
                                    ? product.features.join(", ")
                                    : ""
                                );
                              }}
                              className="text-blue-600 hover:text-blue-700 p-1"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => toggleExpand(product.id)}
                              className="text-gray-600 hover:text-gray-700 p-1"
                            >
                              {expandedProductId === product.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedProductId === product.id && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">
                                  Specifications:
                                </h4>
                                {product.specs ? (
                                  <ul className="list-disc pl-5 text-sm space-y-1">
                                    {Object.entries(product.specs).map(
                                      ([key, value]) => (
                                        <li key={key}>
                                          <span className="font-medium">
                                            {key.replace("_", " ")}:
                                          </span>{" "}
                                          {value}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-500">
                                    No specifications available.
                                  </p>
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Features:</h4>
                                {product.features &&
                                product.features.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {product.features.map((feature, i) => (
                                      <span
                                        key={i}
                                        className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded"
                                      >
                                        {feature}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">
                                    No features available.
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add/Edit Product Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="px-6 pb-6">
                  {/* Step Indicator */}
                  <div className="flex mb-6">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 text-center py-2 border-b-2 ${
                          currentStep === step
                            ? "border-blue-600 text-blue-600"
                            : "border-gray-200 text-gray-500"
                        }`}
                      >
                        Step {step}
                      </div>
                    ))}
                  </div>
                  {/* Form Steps */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Product Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (formErrors.name)
                              setFormErrors({ ...formErrors, name: "" });
                          }}
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
                            formErrors.name ? "border-red-500" : ""
                          }`}
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Brand
                        </label>
                        <input
                          type="text"
                          value={formData.brand}
                          onChange={(e) => {
                            setFormData({ ...formData, brand: e.target.value });
                            if (formErrors.brand)
                              setFormErrors({ ...formErrors, brand: "" });
                          }}
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
                            formErrors.brand ? "border-red-500" : ""
                          }`}
                        />
                        {formErrors.brand && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.brand}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Price
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              price: parseFloat(e.target.value),
                            });
                            if (formErrors.price)
                              setFormErrors({ ...formErrors, price: "" });
                          }}
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
                            formErrors.price ? "border-red-500" : ""
                          }`}
                        />
                        {formErrors.price && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.price}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Image URL
                        </label>
                        <input
                          type="text"
                          value={formData.image_url}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              image_url: e.target.value,
                            });
                            if (formErrors.image_url)
                              setFormErrors({ ...formErrors, image_url: "" });
                          }}
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
                            formErrors.image_url ? "border-red-500" : ""
                          }`}
                        />
                        {formErrors.image_url && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.image_url}
                          </p>
                        )}
                        {formData.image_url && (
                          <div className="mt-2">
                            <img
                              src={formData.image_url}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded"
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Rating
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          value={formData.rating}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rating: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          placeholder="0.0 - 5.0"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Rating out of 5.0
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Number of Reviews
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.reviews}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              reviews: parseInt(e.target.value) || 0,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          placeholder="Number of reviews"
                        />
                      </div>
                    </div>
                  )}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900 mb-4">
                        Specifications
                      </h3>
                      {Object.entries(formData.specs).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700">
                            {key.replace("_", " ")}
                          </label>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                specs: {
                                  ...formData.specs,
                                  [key]: e.target.value,
                                },
                              })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900 mb-4">
                        Features
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Add Features (comma separated)
                        </label>
                        <input
                          type="text"
                          value={featuresInput}
                          onChange={(e) => setFeaturesInput(e.target.value)}
                          onBlur={() => {
                            const features = featuresInput
                              .split(",")
                              .map((f) => f.trim())
                              .filter((f) => f);
                            setFormData({ ...formData, features });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const features = featuresInput
                                .split(",")
                                .map((f) => f.trim())
                                .filter((f) => f);
                              setFormData({ ...formData, features });
                            }
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          placeholder="e.g. Water resistant, Fast charging, Wireless charging"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Press Enter or click away to update features
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.features.map((feature, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center gap-1"
                            >
                              {feature}
                              <button
                                type="button"
                                onClick={() => {
                                  const newFeatures = formData.features.filter(
                                    (_, i) => i !== index
                                  );
                                  setFormData({
                                    ...formData,
                                    features: newFeatures,
                                  });
                                  setFeaturesInput(newFeatures.join(", "));
                                }}
                                className="text-blue-600 hover:text-blue-800 ml-1"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8">
                    {currentStep > 1 && (
                      <button
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                    )}
                    {currentStep < 3 ? (
                      <button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isLoading
                          ? "Saving..."
                          : editingProduct
                          ? "Update"
                          : "Create"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
