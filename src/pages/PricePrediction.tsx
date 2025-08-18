import React, { useState } from 'react';
import { Zap, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface PredictionForm {
  brand: string;
  display: string;
  processor: string;
  ram: string;
  storage: string;
  camera: string;
  battery: string;
}

const PricePrediction = () => {
  const [formData, setFormData] = useState<PredictionForm>({
    brand: '',
    display: '',
    processor: '',
    ram: '',
    storage: '',
    camera: '',
    battery: ''
  });
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confidence, setConfidence] = useState<number>(0);

  const brands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Nothing'];
  const ramOptions = ['4GB', '6GB', '8GB', '12GB', '16GB'];
  const storageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];

  const handleInputChange = (field: keyof PredictionForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call to ML backend
    setTimeout(() => {
      // Mock prediction based on form data
      let basePrice = 500;
      
      // Brand multiplier
      const brandMultipliers: { [key: string]: number } = {
        'Apple': 1.8,
        'Samsung': 1.5,
        'Google': 1.3,
        'OnePlus': 1.2,
        'Xiaomi': 1.0,
        'Nothing': 0.9
      };
      
      basePrice *= brandMultipliers[formData.brand] || 1.0;
      
      // RAM multiplier
      const ramValue = parseInt(formData.ram);
      basePrice += ramValue * 50;
      
      // Storage multiplier
      const storageValue = parseInt(formData.storage);
      basePrice += storageValue * 2;
      
      // Add some randomness for realism
      const finalPrice = Math.round(basePrice * (0.8 + Math.random() * 0.4));
      
      setPrediction(finalPrice);
      setConfidence(85 + Math.random() * 10);
      setIsLoading(false);
    }, 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Price Prediction</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get accurate price predictions powered by machine learning algorithms trained on market data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Specifications</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <select
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Brand</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Size</label>
                <input
                  type="text"
                  value={formData.display}
                  onChange={(e) => handleInputChange('display', e.target.value)}
                  placeholder="e.g., 6.1 inches"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* RAM */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RAM</label>
                <select
                  value={formData.ram}
                  onChange={(e) => handleInputChange('ram', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select RAM</option>
                  {ramOptions.map(ram => (
                    <option key={ram} value={ram}>{ram}</option>
                  ))}
                </select>
              </div>

              {/* Storage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Storage</label>
                <select
                  value={formData.storage}
                  onChange={(e) => handleInputChange('storage', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Storage</option>
                  {storageOptions.map(storage => (
                    <option key={storage} value={storage}>{storage}</option>
                  ))}
                </select>
              </div>

              {/* Camera */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Camera</label>
                <input
                  type="text"
                  value={formData.camera}
                  onChange={(e) => handleInputChange('camera', e.target.value)}
                  placeholder="e.g., 48MP Triple Camera"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Battery */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Battery</label>
                <input
                  type="text"
                  value={formData.battery}
                  onChange={(e) => handleInputChange('battery', e.target.value)}
                  placeholder="e.g., 4000mAh"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Predicting...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    <span>Predict Price</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Prediction Result */}
            {prediction && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-blue-100 to-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Predicted Price</h3>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                    {formatPrice(prediction)}
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Confidence: {confidence.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* How It Works */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-1 mt-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Linear Regression Model</h4>
                    <p className="text-sm text-gray-600">Trained on thousands of smartphone specifications and market prices</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-emerald-100 rounded-full p-1 mt-1">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Real-time Analysis</h4>
                    <p className="text-sm text-gray-600">Considers brand value, specifications, and market trends</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-amber-100 rounded-full p-1 mt-1">
                    <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Confidence Score</h4>
                    <p className="text-sm text-gray-600">Statistical measure of prediction accuracy</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 mb-1">Prediction Disclaimer</h4>
                  <p className="text-sm text-amber-700">
                    Prices are estimates based on specifications and market data. Actual prices may vary based on retailer, promotions, and market conditions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricePrediction;