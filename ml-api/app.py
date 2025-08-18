from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os
import logging
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
MODEL_PATH = 'model/price_prediction_model.joblib'
SCALER_PATH = 'model/feature_scaler.joblib'
ENCODERS_PATH = 'model/label_encoders.joblib'
MODEL_VERSION = '1.0.0'

class PricePredictionModel:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.encoders = {}
        self.feature_columns = [
            'brand', 'display_size_numeric', 'ram_numeric', 
            'storage_numeric', 'camera_numeric', 'battery_numeric'
        ]
        self.categorical_columns = ['brand']
        self.model_info = {
            'version': MODEL_VERSION,
            'trained_at': None,
            'accuracy': None,
            'mae': None,
            'training_samples': 0
        }
        
    def extract_numeric_value(self, text, default=0):
        """Extract numeric value from text (e.g., '8GB' -> 8, '6.1 inches' -> 6.1)"""
        if pd.isna(text) or text == '':
            return default
        
        # Convert to string and extract numbers
        text_str = str(text).lower()
        import re
        numbers = re.findall(r'\d+\.?\d*', text_str)
        
        if numbers:
            return float(numbers[0])
        return default
    
    def preprocess_data(self, data):
        """Preprocess the input data"""
        df = data.copy()
        
        # Extract numeric values from specifications
        df['display_size_numeric'] = df['display_size'].apply(
            lambda x: self.extract_numeric_value(x, 6.0)
        )
        df['ram_numeric'] = df['ram'].apply(
            lambda x: self.extract_numeric_value(x, 4)
        )
        df['storage_numeric'] = df['storage'].apply(
            lambda x: self.extract_numeric_value(x, 64)
        )
        df['camera_numeric'] = df['camera'].apply(
            lambda x: self.extract_numeric_value(x, 12)
        )
        df['battery_numeric'] = df['battery'].apply(
            lambda x: self.extract_numeric_value(x, 3000)
        )
        
        # Handle categorical variables
        for col in self.categorical_columns:
            if col not in self.encoders:
                self.encoders[col] = LabelEncoder()
                df[f'{col}_encoded'] = self.encoders[col].fit_transform(df[col].fillna('Unknown'))
            else:
                # Handle unseen categories
                df[col] = df[col].fillna('Unknown')
                unique_values = df[col].unique()
                for val in unique_values:
                    if val not in self.encoders[col].classes_:
                        # Add new category to encoder
                        self.encoders[col].classes_ = np.append(self.encoders[col].classes_, val)
                df[f'{col}_encoded'] = self.encoders[col].transform(df[col])
        
        # Select features for training
        feature_cols = ['brand_encoded', 'display_size_numeric', 'ram_numeric', 
                       'storage_numeric', 'camera_numeric', 'battery_numeric']
        
        return df[feature_cols]
    
    def train(self, training_data):
        """Train the price prediction model"""
        try:
            logger.info("Starting model training...")
            
            # Convert to DataFrame if needed
            if isinstance(training_data, list):
                df = pd.DataFrame(training_data)
            else:
                df = training_data.copy()
            
            # Preprocess features
            X = self.preprocess_data(df)
            y = df['actual_price'].values
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Scale features
            self.scaler = StandardScaler()
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.model = LinearRegression()
            self.model.fit(X_train_scaled, y_train)
            
            # Evaluate model
            y_pred = self.model.predict(X_test_scaled)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            # Update model info
            self.model_info.update({
                'trained_at': datetime.now().isoformat(),
                'accuracy': float(r2),
                'mae': float(mae),
                'training_samples': len(df)
            })
            
            # Save model
            self.save_model()
            
            logger.info(f"Model trained successfully. R2: {r2:.3f}, MAE: {mae:.2f}")
            
            return {
                'success': True,
                'model_info': self.model_info,
                'message': 'Model trained successfully'
            }
            
        except Exception as e:
            logger.error(f"Training error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def predict(self, features):
        """Make price prediction"""
        try:
            if self.model is None:
                self.load_model()
            
            # Convert to DataFrame
            df = pd.DataFrame([features])
            
            # Preprocess
            X = self.preprocess_data(df)
            
            # Scale features
            X_scaled = self.scaler.transform(X)
            
            # Make prediction
            prediction = self.model.predict(X_scaled)[0]
            
            # Calculate confidence (simplified)
            confidence = min(95.0, max(70.0, 90.0 - abs(prediction - 800) / 50))
            
            return {
                'predicted_price': float(max(100, prediction)),  # Minimum price of $100
                'confidence_score': float(confidence),
                'model_version': MODEL_VERSION
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            raise e
    
    def save_model(self):
        """Save the trained model"""
        os.makedirs('model', exist_ok=True)
        
        joblib.dump(self.model, MODEL_PATH)
        joblib.dump(self.scaler, SCALER_PATH)
        joblib.dump(self.encoders, ENCODERS_PATH)
        
        # Save model info
        with open('model/model_info.json', 'w') as f:
            json.dump(self.model_info, f, indent=2)
    
    def load_model(self):
        """Load the trained model"""
        try:
            if os.path.exists(MODEL_PATH):
                self.model = joblib.load(MODEL_PATH)
                self.scaler = joblib.load(SCALER_PATH)
                self.encoders = joblib.load(ENCODERS_PATH)
                
                # Load model info
                if os.path.exists('model/model_info.json'):
                    with open('model/model_info.json', 'r') as f:
                        self.model_info = json.load(f)
                
                logger.info("Model loaded successfully")
                return True
            else:
                logger.warning("No trained model found, using default model")
                self._create_default_model()
                return False
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            self._create_default_model()
            return False
    
    def _create_default_model(self):
        """Create a simple default model for demo purposes"""
        logger.info("Creating default model...")
        
        # Create sample training data
        sample_data = [
            {'brand': 'Apple', 'display_size': '6.1', 'ram': '8GB', 'storage': '128GB', 
             'camera': '48MP', 'battery': '3274mAh', 'actual_price': 999},
            {'brand': 'Samsung', 'display_size': '6.8', 'ram': '12GB', 'storage': '256GB', 
             'camera': '200MP', 'battery': '5000mAh', 'actual_price': 1199},
            {'brand': 'Google', 'display_size': '6.7', 'ram': '12GB', 'storage': '128GB', 
             'camera': '50MP', 'battery': '5050mAh', 'actual_price': 899},
            {'brand': 'OnePlus', 'display_size': '6.82', 'ram': '16GB', 'storage': '256GB', 
             'camera': '50MP', 'battery': '5400mAh', 'actual_price': 799},
            {'brand': 'Xiaomi', 'display_size': '6.73', 'ram': '12GB', 'storage': '512GB', 
             'camera': '50MP', 'battery': '5300mAh', 'actual_price': 1099},
        ]
        
        self.train(sample_data)

# Initialize model
price_model = PricePredictionModel()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ML Price Prediction API',
        'version': MODEL_VERSION,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/predict', methods=['POST'])
def predict_price():
    """Predict product price"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Validate required fields
        required_fields = ['brand', 'display_size', 'ram', 'storage']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Make prediction
        result = price_model.predict(data)
        
        return jsonify({
            'success': True,
            **result
        })
        
    except Exception as e:
        logger.error(f"Prediction endpoint error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Prediction failed'
        }), 500

@app.route('/api/retrain', methods=['POST'])
def retrain_model():
    """Retrain the model with new data"""
    try:
        data = request.get_json()
        
        if not data or 'training_data' not in data:
            return jsonify({
                'success': False,
                'error': 'Training data is required'
            }), 400
        
        training_data = data['training_data']
        
        if not isinstance(training_data, list) or len(training_data) == 0:
            return jsonify({
                'success': False,
                'error': 'Training data must be a non-empty list'
            }), 400
        
        # Retrain model
        result = price_model.train(training_data)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 500
            
    except Exception as e:
        logger.error(f"Retrain endpoint error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Retraining failed'
        }), 500

@app.route('/api/model/status', methods=['GET'])
def get_model_status():
    """Get model status and information"""
    try:
        return jsonify({
            'success': True,
            'model_info': price_model.model_info,
            'model_loaded': price_model.model is not None
        })
        
    except Exception as e:
        logger.error(f"Model status endpoint error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get model status'
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    # Load or create model on startup
    price_model.load_model()
    
    # Start Flask app
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting ML API server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)