from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.svm import SVR
from sklearn.preprocessing import LabelEncoder, StandardScaler, MinMaxScaler, RobustScaler
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_selection import SelectKBest, f_regression
from sklearn.pipeline import Pipeline
import joblib
import os
import logging
from datetime import datetime
import json
import re
from difflib import SequenceMatcher
import psycopg2
from psycopg2.extras import RealDictCursor
import uuid
import warnings
warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
MODEL_PATH = 'model/specification_matching_models.joblib'
SCALER_PATH = 'model/feature_scaler.joblib'
ENCODERS_PATH = 'model/label_encoders.joblib'
FEATURE_SELECTOR_PATH = 'model/feature_selector.joblib'
MODEL_VERSION = '3.0.0'
MIN_TRAINING_SAMPLES = 25000

# Database Configuration
DATABASE_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'techcompare_db'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', '1234'),
    'port': os.getenv('DB_PORT', 5432)
}

class DatabaseManager:
    """Handle PostgreSQL database operations"""
    
    def __init__(self):
        self.connection = None
    
    def connect(self):
        """Connect to PostgreSQL database"""
        try:
            self.connection = psycopg2.connect(**DATABASE_CONFIG)
            logger.info("Database connected successfully")
            return True
        except Exception as e:
            logger.error(f"Database connection error: {str(e)}")
            return False
    
    def disconnect(self):
        """Disconnect from database"""
        if self.connection:
            self.connection.close()
            logger.info("Database disconnected")
    
    def execute_query(self, query, params=None, fetch=True):
        """Execute SQL query"""
        try:
            if not self.connection:
                self.connect()
            
            cursor = self.connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute(query, params)
            
            if fetch:
                result = cursor.fetchall()
            else:
                self.connection.commit()
                result = cursor.rowcount
            
            cursor.close()
            return result
            
        except Exception as e:
            logger.error(f"Query execution error: {str(e)}")
            if self.connection:
                self.connection.rollback()
            return None

class SpecificationParser:
    """Parse natural language specifications into structured data"""
    
    def __init__(self):
        # Enhanced brand patterns
        self.brand_patterns = {
            'apple': ['apple', 'iphone', 'ios'],
            'samsung': ['samsung', 'galaxy'],
            'google': ['google', 'pixel'],
            'oneplus': ['oneplus', 'one plus', '1+'],
            'xiaomi': ['xiaomi', 'mi', 'redmi', 'poco'],
            'huawei': ['huawei', 'honor'],
            'oppo': ['oppo', 'realme'],
            'vivo': ['vivo', 'iqoo'],
            'motorola': ['motorola', 'moto'],
            'nokia': ['nokia', 'hmd'],
            'nothing': ['nothing'],
            'asus': ['asus', 'rog'],
            'sony': ['sony', 'xperia'],
            'lg': ['lg'],
            'htc': ['htc']
        }
        
        # Enhanced specification patterns with more variations
        self.spec_patterns = {
            'ram': r'(\d+)\s*gb\s*ram|ram\s*(\d+)\s*gb|(\d+)\s*gb\s*memory|(\d+)gb\s*lpddr|lpddr\d+\s*(\d+)gb',
            'storage': r'(\d+)\s*gb\s*storage|storage\s*(\d+)\s*gb|(\d+)\s*gb\s*internal|(\d+)gb\s*ufs|ufs\s*(\d+)gb|(\d+)\s*tb',
            'display_size': r'(\d+\.?\d*)\s*inch|(\d+\.?\d*)\s*"|(\d+\.?\d*)\s*′|(\d+\.?\d*)"',
            'camera': r'(\d+)\s*mp\s*camera|camera\s*(\d+)\s*mp|(\d+)\s*megapixel|(\d+)mp\s*main|main\s*(\d+)mp',
            'battery': r'(\d+)\s*mah|battery\s*(\d+)\s*mah|(\d+)\s*milliampere|(\d+)mah\s*battery',
            'price': r'\$(\d+)|price\s*(\d+)|(\d+)\s*dollars?|₹(\d+)|rs\.?\s*(\d+)|(\d+)\s*usd',
            'processor': r'snapdragon\s*(\d+)|mediatek\s*(\d+)|exynos\s*(\d+)|a(\d+)\s*bionic|kirin\s*(\d+)'
        }
    
    def parse_specification(self, text):
        """Parse specification text into structured format"""
        text = text.lower().strip()
        parsed_spec = {}
        
        # Extract brand
        brand_found = None
        for brand, patterns in self.brand_patterns.items():
            for pattern in patterns:
                if pattern in text:
                    brand_found = brand
                    break
            if brand_found:
                break
        
        parsed_spec['brand'] = brand_found or 'unknown'
        
        # Extract specifications
        for spec_type, pattern in self.spec_patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                # Get the first non-None group
                value = next((g for g in match.groups() if g is not None), None)
                if value:
                    # Handle TB to GB conversion for storage
                    if spec_type == 'storage' and 'tb' in text.lower():
                        parsed_spec[spec_type] = float(value) * 1000
                    else:
                        parsed_spec[spec_type] = float(value) if '.' in value else int(value)
        
        return parsed_spec

class AdvancedMobileSpecificationMatcher:
    def __init__(self):
        self.models = {}
        self.best_model_name = None
        self.scaler = None
        self.feature_selector = None
        self.encoders = {}
        self.db_manager = DatabaseManager()
        self.parser = SpecificationParser()
        
        # Enhanced feature columns
        self.feature_columns = [
            'brand_encoded', 'display_size_numeric', 'ram_numeric', 'storage_numeric', 
            'camera_numeric', 'battery_numeric', 'price_range', 'processor_score',
            'rating', 'reviews_count_log', 'brand_popularity'
        ]
        
        self.model_info = {
            'version': MODEL_VERSION,
            'trained_at': None,
            'best_model': None,
            'models_performance': {},
            'training_samples': 0,
            'feature_importance': {}
        }
        
        # Connect to database
        self.db_manager.connect()
    
    def get_products_from_db(self):
        """Fetch products with specifications from PostgreSQL database"""
        try:
            query = """
            SELECT 
                p.id,
                p.name as model,
                p.brand,
                p.price,
                p.rating,
                p.reviews,
                p.description,
                p.image_url,
                ps.display_size,
                ps.processor,
                ps.ram,
                ps.storage,
                ps.camera,
                ps.battery,
                ps.operating_system,
                ARRAY_AGG(pf.feature_name) as features
            FROM products p
            LEFT JOIN product_specs ps ON p.id = ps.product_id
            LEFT JOIN product_features pf ON p.id = pf.product_id
            GROUP BY p.id, ps.id
            ORDER BY p.created_at DESC
            """
            
            results = self.db_manager.execute_query(query)
            
            if results:
                products = []
                for row in results:
                    # Extract numeric values from specifications
                    display_size_numeric = self.extract_numeric_value(row['display_size'], 6.0)
                    ram_numeric = self.extract_numeric_value(row['ram'], 4)
                    storage_numeric = self.extract_numeric_value(row['storage'], 64)
                    camera_numeric = self.extract_numeric_value(row['camera'], 12)
                    battery_numeric = self.extract_numeric_value(row['battery'], 3000)
                    
                    # Enhanced features
                    processor_score = self.calculate_processor_score(row['processor'])
                    price_range = self.determine_price_range(row['price']) if row['price'] else 2
                    reviews_count_log = np.log1p(row['reviews'] or 0)
                    
                    product = {
                        'id': str(row['id']),
                        'brand': row['brand'].lower() if row['brand'] else 'unknown',
                        'model': row['model'],
                        'price': float(row['price']) if row['price'] else 0.0,
                        'rating': float(row['rating']) if row['rating'] else 0.0,
                        'reviews': row['reviews'] or 0,
                        'description': row['description'] or '',
                        'image_url': row['image_url'] or '',
                        'display_size': row['display_size'] or '',
                        'display_size_numeric': display_size_numeric,
                        'processor': row['processor'] or '',
                        'processor_score': processor_score,
                        'ram': row['ram'] or '',
                        'ram_numeric': ram_numeric,
                        'storage': row['storage'] or '',
                        'storage_numeric': storage_numeric,
                        'camera': row['camera'] or '',
                        'camera_numeric': camera_numeric,
                        'battery': row['battery'] or '',
                        'battery_numeric': battery_numeric,
                        'operating_system': row['operating_system'] or '',
                        'price_range': price_range,
                        'reviews_count_log': reviews_count_log,
                        'features': [f for f in (row['features'] or []) if f is not None],
                        'specifications': f"{row['brand']} {row['model']} with {row['display_size']} {row['ram']} {row['storage']} {row['camera']} {row['battery']}"
                    }
                    products.append(product)
                
                logger.info(f"Loaded {len(products)} products from database")
                return products
            else:
                logger.warning("No products found in database")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching products from database: {str(e)}")
            return []
    
    def calculate_processor_score(self, processor_text):
        """Calculate processor performance score based on processor name"""
        if not processor_text:
            return 50  # Default mid-range score
        
        processor_text = processor_text.lower()
        
        # Snapdragon scores
        if 'snapdragon' in processor_text:
            numbers = re.findall(r'\d+', processor_text)
            if numbers:
                num = int(numbers[0])
                if num >= 8000: return 95
                elif num >= 7000: return 85
                elif num >= 6000: return 75
                elif num >= 4000: return 60
                else: return 40
        
        # Apple A-series scores
        elif 'a1' in processor_text and 'bionic' in processor_text:
            numbers = re.findall(r'a(\d+)', processor_text)
            if numbers:
                num = int(numbers[0])
                if num >= 17: return 100
                elif num >= 15: return 95
                elif num >= 13: return 85
                elif num >= 12: return 75
                else: return 65
        
        # MediaTek scores
        elif 'mediatek' in processor_text or 'dimensity' in processor_text:
            numbers = re.findall(r'\d+', processor_text)
            if numbers:
                num = int(numbers[0])
                if num >= 9000: return 90
                elif num >= 8000: return 80
                elif num >= 1000: return 70
                else: return 50
        
        # Exynos scores
        elif 'exynos' in processor_text:
            numbers = re.findall(r'\d+', processor_text)
            if numbers:
                num = int(numbers[0])
                if num >= 2200: return 85
                elif num >= 2100: return 80
                elif num >= 1000: return 70
                else: return 55
        
        return 50  # Default score
    
    def generate_synthetic_data(self, base_products, target_count=25000):
        """Generate synthetic data to reach minimum training samples"""
        if len(base_products) >= target_count:
            return base_products
        
        logger.info(f"Generating synthetic data to reach {target_count} samples from {len(base_products)} base products")
        
        synthetic_products = []
        needed_samples = target_count - len(base_products)
        
        # Define realistic ranges for each specification
        spec_ranges = {
            'ram_numeric': [3, 4, 6, 8, 12, 16, 24],
            'storage_numeric': [32, 64, 128, 256, 512, 1024],
            'display_size_numeric': [4.0, 4.7, 5.0, 5.5, 6.0, 6.1, 6.4, 6.7, 6.8],
            'camera_numeric': [8, 12, 13, 16, 20, 24, 32, 48, 50, 64, 108],
            'battery_numeric': [2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000],
            'processor_score': list(range(30, 101, 5))
        }
        
        brands = list(self.parser.brand_patterns.keys())
        
        for i in range(needed_samples):
            # Select a base product to modify
            base_product = base_products[i % len(base_products)].copy()
            
            # Add some variation to create synthetic sample
            noise_factor = 0.15  # 15% variation
            
            synthetic_product = base_product.copy()
            synthetic_product['id'] = f"synthetic_{i}"
            
            # Randomly select from realistic ranges instead of adding noise
            for spec, possible_values in spec_ranges.items():
                if spec in synthetic_product:
                    # 70% chance to keep original, 30% chance to change
                    if np.random.random() < 0.3:
                        synthetic_product[spec] = np.random.choice(possible_values)
            
            # Adjust price based on specifications
            price_factors = {
                'ram_numeric': 10,
                'storage_numeric': 0.5,
                'camera_numeric': 5,
                'processor_score': 8,
                'battery_numeric': 0.05
            }
            
            base_price = 200  # Base price
            for spec, factor in price_factors.items():
                if spec in synthetic_product:
                    base_price += synthetic_product[spec] * factor
            
            # Add brand premium
            brand_premiums = {
                'apple': 200, 'samsung': 100, 'google': 50, 
                'oneplus': 30, 'sony': 80, 'lg': 20
            }
            
            brand_premium = brand_premiums.get(synthetic_product['brand'], 0)
            synthetic_product['price'] = base_price + brand_premium + np.random.normal(0, 50)
            synthetic_product['price'] = max(100, synthetic_product['price'])  # Minimum price
            
            # Recalculate price range
            synthetic_product['price_range'] = self.determine_price_range(synthetic_product['price'])
            
            # Generate realistic rating and reviews
            synthetic_product['rating'] = np.clip(np.random.normal(4.0, 0.5), 1.0, 5.0)
            synthetic_product['reviews'] = max(0, int(np.random.exponential(100)))
            synthetic_product['reviews_count_log'] = np.log1p(synthetic_product['reviews'])
            
            synthetic_products.append(synthetic_product)
        
        all_products = base_products + synthetic_products
        logger.info(f"Generated {len(synthetic_products)} synthetic products. Total: {len(all_products)}")
        
        return all_products
    
    def calculate_brand_popularity(self, products_df):
        """Calculate brand popularity score based on number of products"""
        brand_counts = products_df['brand'].value_counts()
        max_count = brand_counts.max()
        brand_popularity_map = (brand_counts / max_count * 100).to_dict()
        return products_df['brand'].map(brand_popularity_map).fillna(10)  # Default popularity
    
    def extract_numeric_value(self, text, default=0):
        """Extract numeric value from text (e.g., '8GB' -> 8, '6.1 inches' -> 6.1)"""
        if not text or pd.isna(text):
            return default
        
        text_str = str(text).lower()
        numbers = re.findall(r'\d+\.?\d*', text_str)
        
        if numbers:
            return float(numbers[0])
        return default
    
    def determine_price_range(self, price):
        """Determine price range category"""
        if price < 300:
            return 1  # Budget
        elif price < 700:
            return 2  # Mid-range
        elif price < 1000:
            return 3  # Premium
        else:
            return 4  # Flagship
    
    def preprocess_features(self, phones):
        """Enhanced preprocessing with feature engineering"""
        df = pd.DataFrame(phones)
        
        # Calculate brand popularity
        df['brand_popularity'] = self.calculate_brand_popularity(df)
        
        # Encode categorical variables
        if 'brand' not in self.encoders:
            self.encoders['brand'] = LabelEncoder()
            unique_brands = df['brand'].unique()
            self.encoders['brand'].fit(unique_brands)
        
        # Handle unseen brands
        df['brand'] = df['brand'].apply(
            lambda x: x if x in self.encoders['brand'].classes_ else 'unknown'
        )
        
        if 'unknown' not in self.encoders['brand'].classes_:
            self.encoders['brand'].classes_ = np.append(self.encoders['brand'].classes_, 'unknown')
        
        df['brand_encoded'] = self.encoders['brand'].transform(df['brand'])
        
        # Select and return features
        feature_df = df[self.feature_columns].fillna(0)
        
        # Handle infinite values
        feature_df = feature_df.replace([np.inf, -np.inf], 0)
        
        return feature_df
    
    def train_multiple_models(self):
        """Train multiple ML models and select the best one"""
        try:
            logger.info("Training multiple models for specification matching...")
            
            # Get products from database
            base_products = self.get_products_from_db()
            if not base_products:
                logger.error("No training data available from database")
                return False
            
            # Generate synthetic data if needed
            all_products = self.generate_synthetic_data(base_products, MIN_TRAINING_SAMPLES)
            
            # Prepare training data
            X = self.preprocess_features(all_products)
            y = np.array([phone.get('price', 0) for phone in all_products])
            
            # Remove products with no price data
            valid_indices = y > 0
            X = X[valid_indices]
            y = y[valid_indices]
            
            if len(X) < 1000:  # Minimum viable dataset
                logger.error(f"Insufficient training data: {len(X)} samples")
                return False
            
            logger.info(f"Training with {len(X)} samples")
            
            # Split data with stratification on price ranges
            price_ranges = [self.determine_price_range(price) for price in y]
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=price_ranges
            )
            
            # Feature scaling with multiple scalers
            scalers = {
                'standard': StandardScaler(),
                'minmax': MinMaxScaler(),
                'robust': RobustScaler()
            }
            
            # Feature selection
            self.feature_selector = SelectKBest(score_func=f_regression, k=min(10, X_train.shape[1]))
            
            # Define models with hyperparameters
            models_config = {
                'linear_regression': {
                    'model': LinearRegression(),
                    'scaler': 'standard'
                },
                'ridge': {
                    'model': Ridge(alpha=1.0),
                    'scaler': 'standard'
                },
                'lasso': {
                    'model': Lasso(alpha=1.0),
                    'scaler': 'standard'
                },
                'random_forest': {
                    'model': RandomForestRegressor(
                        n_estimators=100,
                        max_depth=15,
                        min_samples_split=5,
                        min_samples_leaf=2,
                        random_state=42,
                        n_jobs=-1
                    ),
                    'scaler': 'robust'
                },
                'gradient_boosting': {
                    'model': GradientBoostingRegressor(
                        n_estimators=100,
                        learning_rate=0.1,
                        max_depth=6,
                        random_state=42
                    ),
                    'scaler': 'standard'
                },
                'decision_tree': {
                    'model': DecisionTreeRegressor(
                        max_depth=15,
                        min_samples_split=10,
                        min_samples_leaf=5,
                        random_state=42
                    ),
                    'scaler': 'minmax'
                }
            }
            
            # Train and evaluate models
            model_results = {}
            
            for model_name, config in models_config.items():
                try:
                    logger.info(f"Training {model_name}...")
                    
                    # Select scaler
                    scaler = scalers[config['scaler']]
                    X_train_scaled = scaler.fit_transform(X_train)
                    X_test_scaled = scaler.transform(X_test)
                    
                    # Feature selection for linear models
                    if model_name in ['linear_regression', 'ridge', 'lasso']:
                        X_train_selected = self.feature_selector.fit_transform(X_train_scaled, y_train)
                        X_test_selected = self.feature_selector.transform(X_test_scaled)
                    else:
                        X_train_selected = X_train_scaled
                        X_test_selected = X_test_scaled
                    
                    # Train model
                    model = config['model']
                    model.fit(X_train_selected, y_train)
                    
                    # Predictions
                    y_pred_train = model.predict(X_train_selected)
                    y_pred_test = model.predict(X_test_selected)
                    
                    # Evaluation metrics
                    train_r2 = r2_score(y_train, y_pred_train)
                    test_r2 = r2_score(y_test, y_pred_test)
                    train_mae = mean_absolute_error(y_train, y_pred_train)
                    test_mae = mean_absolute_error(y_test, y_pred_test)
                    train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train))
                    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
                    
                    # MAPE calculation
                    test_mape = np.mean(np.abs((y_test - y_pred_test) / y_test)) * 100
                    
                    # Cross-validation score
                    cv_scores = cross_val_score(model, X_train_selected, y_train, cv=5, scoring='r2')
                    
                    # Calculate composite score (higher is better)
                    composite_score = (
                        test_r2 * 0.4 +  # R2 score weight
                        (1 - test_mape/100) * 0.3 +  # MAPE weight (inverted)
                        cv_scores.mean() * 0.3  # CV score weight
                    )
                    
                    model_results[model_name] = {
                        'model': model,
                        'scaler': scaler,
                        'train_r2': train_r2,
                        'test_r2': test_r2,
                        'train_mae': train_mae,
                        'test_mae': test_mae,
                        'train_rmse': train_rmse,
                        'test_rmse': test_rmse,
                        'test_mape': test_mape,
                        'cv_score_mean': cv_scores.mean(),
                        'cv_score_std': cv_scores.std(),
                        'composite_score': composite_score,
                        'feature_selected': model_name in ['linear_regression', 'ridge', 'lasso']
                    }
                    
                    logger.info(f"{model_name} - Test R2: {test_r2:.3f}, Test MAE: {test_mae:.2f}, MAPE: {test_mape:.1f}%")
                    
                except Exception as e:
                    logger.error(f"Error training {model_name}: {str(e)}")
                    continue
            
            if not model_results:
                logger.error("No models trained successfully")
                return False
            
            # Select best model based on composite score
            best_model_name = max(model_results.keys(), key=lambda k: model_results[k]['composite_score'])
            best_result = model_results[best_model_name]
            
            self.best_model_name = best_model_name
            self.models = {name: result['model'] for name, result in model_results.items()}
            self.scaler = best_result['scaler']
            
            # Store performance metrics
            self.model_info.update({
                'trained_at': datetime.now().isoformat(),
                'best_model': best_model_name,
                'models_performance': {
                    name: {
                        'test_r2': result['test_r2'],
                        'test_mae': result['test_mae'],
                        'test_mape': result['test_mape'],
                        'cv_score_mean': result['cv_score_mean'],
                        'composite_score': result['composite_score']
                    }
                    for name, result in model_results.items()
                },
                'training_samples': len(X),
                'original_samples': len(base_products),
                'synthetic_samples': len(all_products) - len(base_products)
            })
            
            # Feature importance for tree-based models
            if hasattr(best_result['model'], 'feature_importances_'):
                feature_importance = dict(zip(
                    self.feature_columns,
                    best_result['model'].feature_importances_
                ))
                self.model_info['feature_importance'] = feature_importance
            
            # Save models
            self.save_models()
            
            logger.info(f"Best model: {best_model_name} with composite score: {best_result['composite_score']:.3f}")
            logger.info(f"Best model performance - R2: {best_result['test_r2']:.3f}, MAE: ${best_result['test_mae']:.2f}, MAPE: {best_result['test_mape']:.1f}%")
            
            return True
            
        except Exception as e:
            logger.error(f"Training error: {str(e)}")
            return False
    
    def predict_with_best_model(self, features):
        """Make prediction using the best performing model"""
        if not self.best_model_name or self.best_model_name not in self.models:
            return None
        
        # Scale features
        features_scaled = self.scaler.transform(features)
        
        # Apply feature selection if needed
        if self.best_model_name in ['linear_regression', 'ridge', 'lasso'] and self.feature_selector:
            features_scaled = self.feature_selector.transform(features_scaled)
        
        # Make prediction
        prediction = self.models[self.best_model_name].predict(features_scaled)
        return prediction
    
    def find_matching_phones(self, specification_text, top_k=10):
        """Find matching phones based on specification text"""
        try:
            # Parse the specification text
            parsed_spec = self.parser.parse_specification(specification_text)
            logger.info(f"Parsed specification: {parsed_spec}")
            
            # Get products from database
            mobile_dataset = self.get_products_from_db()
            if not mobile_dataset:
                return []
            
            matches = []
            
            for phone in mobile_dataset:
                similarity_score = self.calculate_similarity(parsed_spec, phone, specification_text)
                
                if similarity_score > 0.1:  # Minimum similarity threshold
                    match = {
                        'phone': phone,
                        'similarity_score': similarity_score,
                        'matched_features': self.get_matched_features(parsed_spec, phone)
                    }
                    matches.append(match)
            
            # Sort by similarity score
            matches.sort(key=lambda x: x['similarity_score'], reverse=True)
            
            # Return top K matches
            return matches[:top_k]
            
        except Exception as e:
            logger.error(f"Error finding matches: {str(e)}")
            return []
    
    def calculate_similarity(self, parsed_spec, phone, specification_text):
        """Calculate similarity between parsed specification and phone"""
        similarity = 0.0
        total_weight = 0.0
        
        # Weight factors for different specifications
        weights = {
            'brand': 0.25,
            'ram': 0.20,
            'storage': 0.15,
            'camera': 0.15,
            'battery': 0.10,
            'display_size': 0.10,
            'price': 0.05
        }
        
        # Brand matching (exact match)
        if 'brand' in parsed_spec and parsed_spec['brand'] != 'unknown':
            if phone['brand'].lower() == parsed_spec['brand'].lower():
                similarity += weights['brand']
            total_weight += weights['brand']
        
        # Numeric specifications matching (with tolerance)
        numeric_specs = {
            'ram': 'ram_numeric',
            'storage': 'storage_numeric', 
            'camera': 'camera_numeric',
            'battery': 'battery_numeric',
            'display_size': 'display_size_numeric',
            'price': 'price'
        }
        
        for spec, phone_key in numeric_specs.items():
            if spec in parsed_spec:
                phone_value = phone.get(phone_key, 0)
                parsed_value = parsed_spec[spec]
                
                if phone_value > 0 and parsed_value > 0:
                    # Calculate similarity based on relative difference
                    diff_ratio = abs(phone_value - parsed_value) / max(phone_value, parsed_value)
                    spec_similarity = max(0, 1 - diff_ratio)
                    
                    similarity += weights[spec] * spec_similarity
                    total_weight += weights[spec]
        
        # Text similarity for model names
        text_similarity = SequenceMatcher(None, 
            specification_text.lower(), 
            phone.get('specifications', '').lower()
        ).ratio()
        
        similarity += 0.1 * text_similarity
        total_weight += 0.1
        
        # Normalize similarity
        return similarity / total_weight if total_weight > 0 else 0
    
    def get_matched_features(self, parsed_spec, phone):
        """Get list of matched features between specification and phone"""
        matched = []
        
        if 'brand' in parsed_spec and phone['brand'].lower() == parsed_spec['brand'].lower():
            matched.append('brand')
        
        numeric_specs = {
            'ram': 'ram_numeric',
            'storage': 'storage_numeric',
            'camera': 'camera_numeric',
            'battery': 'battery_numeric',
            'display_size': 'display_size_numeric'
        }
        
        for spec, phone_key in numeric_specs.items():
            if spec in parsed_spec:
                phone_value = phone.get(phone_key, 0)
                parsed_value = parsed_spec[spec]
                
                # Consider it matched if within 20% tolerance
                if phone_value > 0 and abs(phone_value - parsed_value) / max(phone_value, parsed_value) <= 0.2:
                    matched.append(spec)
        
        return matched
    
    def save_prediction_to_db(self, user_id, prediction_data):
        """Save prediction result to database"""
        try:
            query = """
            INSERT INTO predictions (
                user_id, brand, display_size, processor, ram, storage, camera, battery,
                predicted_price, confidence_score, model_version
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """
            
            params = (
                user_id,
                prediction_data.get('brand'),
                prediction_data.get('display_size'),
                prediction_data.get('processor'),
                prediction_data.get('ram'),
                prediction_data.get('storage'),
                prediction_data.get('camera'),
                prediction_data.get('battery'),
                prediction_data.get('predicted_price'),
                prediction_data.get('confidence_score'),
                MODEL_VERSION
            )
            
            result = self.db_manager.execute_query(query, params)
            if result:
                logger.info(f"Prediction saved to database with ID: {result[0]['id']}")
                return str(result[0]['id'])
            return None
            
        except Exception as e:
            logger.error(f"Error saving prediction: {str(e)}")
            return None
    
    def get_user_predictions(self, user_id, limit=10):
        """Get user's prediction history"""
        try:
            query = """
            SELECT * FROM predictions 
            WHERE user_id = %s 
            ORDER BY created_at DESC 
            LIMIT %s
            """
            
            results = self.db_manager.execute_query(query, (user_id, limit))
            return [dict(row) for row in results] if results else []
            
        except Exception as e:
            logger.error(f"Error fetching user predictions: {str(e)}")
            return []
    
    def save_model(self):
        """Save the trained model"""
        os.makedirs('model', exist_ok=True)
        
        if self.model:
            joblib.dump(self.model, MODEL_PATH)
        if self.scaler:
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
                
                if os.path.exists('model/model_info.json'):
                    with open('model/model_info.json', 'r') as f:
                        self.model_info = json.load(f)
                
                logger.info("Model loaded successfully")
                return True
            else:
                logger.warning("No trained model found, training new model...")
                return self.train_multiple_models()
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            return self.train_multiple_models()

# Initialize the matcher
matcher = AdvancedMobileSpecificationMatcher()

# API Endpoints

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    db_status = "connected" if matcher.db_manager.connection else "disconnected"
    products_count = len(matcher.get_products_from_db())
    
    return jsonify({
        'status': 'healthy',
        'service': 'Mobile Specification Matching API with PostgreSQL',
        'version': MODEL_VERSION,
        'timestamp': datetime.now().isoformat(),
        'database_status': db_status,
        'products_count': products_count
    })

@app.route('/api/search', methods=['POST'])
def search_phones():
    """Search for phones based on specification text"""
    try:
        data = request.get_json()
        
        if not data or 'specification' not in data:
            return jsonify({
                'success': False,
                'error': 'Specification text is required'
            }), 400
        
        specification_text = data['specification'].strip()
        top_k = data.get('top_k', 10)
        user_id = data.get('user_id')  # Optional user tracking
        
        if not specification_text:
            return jsonify({
                'success': False,
                'error': 'Specification text cannot be empty'
            }), 400
        
        # Find matching phones
        matches = matcher.find_matching_phones(specification_text, top_k)
        
        # Format response
        results = []
        for match in matches:
            phone = match['phone'].copy()
            phone['similarity_score'] = match['similarity_score']
            phone['matched_features'] = match['matched_features']
            results.append(phone)
        
        # Save search query if user_id provided
        if user_id and results:
            search_data = {
                'brand': matcher.parser.parse_specification(specification_text).get('brand'),
                'predicted_price': results[0]['price'] if results else 0,
                'confidence_score': results[0]['similarity_score'] if results else 0
            }
            matcher.save_prediction_to_db(user_id, search_data)
        
        return jsonify({
            'success': True,
            'query': specification_text,
            'parsed_specification': matcher.parser.parse_specification(specification_text),
            'total_matches': len(results),
            'results': results
        })
        
    except Exception as e:
        logger.error(f"Search endpoint error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Search failed'
        }), 500

@app.route('/api/products', methods=['GET'])
def get_all_products():
    """Get all products from database"""
    try:
        products = matcher.get_products_from_db()
        return jsonify({
            'success': True,
            'total_products': len(products),
            'products': products
        })
    except Exception as e:
        logger.error(f"Get products error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch products'
        }), 500

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product_details(product_id):
    """Get detailed information about a specific product"""
    try:
        query = """
        SELECT 
            p.*,
            ps.*,
            ARRAY_AGG(pf.feature_name) as features
        FROM products p
        LEFT JOIN product_specs ps ON p.id = ps.product_id
        LEFT JOIN product_features pf ON p.id = pf.product_id
        WHERE p.id = %s
        GROUP BY p.id, ps.id
        """
        
        result = matcher.db_manager.execute_query(query, (product_id,))
        
        if result:
            product = dict(result[0])
            return jsonify({
                'success': True,
                'product': product
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Product not found'
            }), 404
            
    except Exception as e:
        logger.error(f"Get product details error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch product details'
        }), 500

@app.route('/api/brands', methods=['GET'])
def get_brands():
    """Get all unique brands from database"""
    try:
        query = "SELECT DISTINCT brand FROM products ORDER BY brand"
        results = matcher.db_manager.execute_query(query)
        
        brands = [row['brand'] for row in results] if results else []
        
        return jsonify({
            'success': True,
            'brands': brands,
            'total_brands': len(brands)
        })
        
    except Exception as e:
        logger.error(f"Get brands error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch brands'
        }), 500

@app.route('/api/price-range/<int:min_price>/<int:max_price>', methods=['GET'])
def get_products_by_price_range(min_price, max_price):
    """Get products within a specific price range"""
    try:
        query = """
        SELECT p.*, ps.*, ARRAY_AGG(pf.feature_name) as features
        FROM products p
        LEFT JOIN product_specs ps ON p.id = ps.product_id
        LEFT JOIN product_features pf ON p.id = pf.product_id
        WHERE p.price BETWEEN %s AND %s
        GROUP BY p.id, ps.id
        ORDER BY p.price ASC
        """
        
        results = matcher.db_manager.execute_query(query, (min_price, max_price))
        
        products = [dict(row) for row in results] if results else []
        
        return jsonify({
            'success': True,
            'price_range': {'min': min_price, 'max': max_price},
            'total_products': len(products),
            'products': products
        })
        
    except Exception as e:
        logger.error(f"Get products by price range error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch products by price range'
        }), 500

@app.route('/api/predictions/<user_id>', methods=['GET'])
def get_user_predictions(user_id):
    """Get user's prediction history"""
    try:
        limit = request.args.get('limit', 10, type=int)
        predictions = matcher.get_user_predictions(user_id, limit)
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'total_predictions': len(predictions),
            'predictions': predictions
        })
        
    except Exception as e:
        logger.error(f"Get user predictions error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch user predictions'
        }), 500

@app.route('/api/train', methods=['POST'])
def retrain_model():
    """Retrain model with latest database data"""
    try:
        success = matcher.train_multiple_models()
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Model retrained successfully with database data',
                'model_info': matcher.model_info
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Model retraining failed'
            }), 500
            
    except Exception as e:
        logger.error(f"Retrain endpoint error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Retraining failed'
        }), 500

@app.route('/api/model/status', methods=['GET'])
def get_model_status():
    """Get model status and information"""
    products_count = len(matcher.get_products_from_db())
    
    return jsonify({
        'success': True,
        'model_info': matcher.model_info,
        'model_loaded': matcher.model is not None,
        'database_products': products_count,
        'supported_brands': list(matcher.parser.brand_patterns.keys())
    })

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Get database statistics"""
    try:
        stats_queries = {
            'total_products': "SELECT COUNT(*) as count FROM products",
            'total_brands': "SELECT COUNT(DISTINCT brand) as count FROM products",
            'avg_price': "SELECT AVG(price) as avg_price FROM products WHERE price > 0",
            'price_ranges': """
                SELECT 
                    CASE 
                        WHEN price < 300 THEN 'Budget (<$300)'
                        WHEN price < 700 THEN 'Mid-range ($300-700)'
                        WHEN price < 1000 THEN 'Premium ($700-1000)'
                        ELSE 'Flagship (>$1000)'
                    END as price_range,
                    COUNT(*) as count
                FROM products 
                WHERE price > 0
                GROUP BY price_range
            """,
            'brand_distribution': """
                SELECT brand, COUNT(*) as count 
                FROM products 
                GROUP BY brand 
                ORDER BY count DESC
            """
        }
        
        statistics = {}
        
        for stat_name, query in stats_queries.items():
            result = matcher.db_manager.execute_query(query)
            if result:
                if stat_name in ['total_products', 'total_brands']:
                    statistics[stat_name] = result[0]['count']
                elif stat_name == 'avg_price':
                    statistics[stat_name] = float(result[0]['avg_price']) if result[0]['avg_price'] else 0.0
                else:
                    statistics[stat_name] = [dict(row) for row in result]
        
        return jsonify({
            'success': True,
            'statistics': statistics
        })
        
    except Exception as e:
        logger.error(f"Get statistics error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch statistics'
        }), 500

@app.route('/api/compare', methods=['POST'])
def compare_products():
    """Compare multiple products by their IDs"""
    try:
        data = request.get_json()
        
        if not data or 'product_ids' not in data:
            return jsonify({
                'success': False,
                'error': 'Product IDs are required'
            }), 400
        
        product_ids = data['product_ids']
        
        if not isinstance(product_ids, list) or len(product_ids) < 2:
            return jsonify({
                'success': False,
                'error': 'At least 2 product IDs are required for comparison'
            }), 400
        
        placeholders = ', '.join(['%s'] * len(product_ids))
        query = f"""
        SELECT 
            p.*,
            ps.*,
            ARRAY_AGG(pf.feature_name) as features
        FROM products p
        LEFT JOIN product_specs ps ON p.id = ps.product_id
        LEFT JOIN product_features pf ON p.id = pf.product_id
        WHERE p.id IN ({placeholders})
        GROUP BY p.id, ps.id
        ORDER BY p.price DESC
        """
        
        results = matcher.db_manager.execute_query(query, product_ids)
        
        if results:
            products = [dict(row) for row in results]
            
            # Generate comparison insights
            comparison_insights = {
                'price_comparison': {
                    'cheapest': min(products, key=lambda x: x['price'] or 0),
                    'most_expensive': max(products, key=lambda x: x['price'] or 0)
                },
                'rating_comparison': {
                    'highest_rated': max(products, key=lambda x: x['rating'] or 0),
                    'lowest_rated': min(products, key=lambda x: x['rating'] or 0)
                }
            }
            
            return jsonify({
                'success': True,
                'total_products': len(products),
                'products': products,
                'comparison_insights': comparison_insights
            })
        else:
            return jsonify({
                'success': False,
                'error': 'No products found with provided IDs'
            }), 404
            
    except Exception as e:
        logger.error(f"Compare products error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Product comparison failed'
        }), 500

@app.route('/api/recommendations/<product_id>', methods=['GET'])
def get_recommendations(product_id):
    """Get product recommendations based on a specific product"""
    try:
        # Get the base product
        base_product_query = """
        SELECT p.*, ps.* FROM products p
        LEFT JOIN product_specs ps ON p.id = ps.product_id
        WHERE p.id = %s
        """
        
        base_result = matcher.db_manager.execute_query(base_product_query, (product_id,))
        
        if not base_result:
            return jsonify({
                'success': False,
                'error': 'Product not found'
            }), 404
        
        base_product = dict(base_result[0])
        
        # Find similar products based on brand, price range, and specifications
        price_min = (base_product['price'] or 0) * 0.8  # 20% below
        price_max = (base_product['price'] or 1000) * 1.2  # 20% above
        
        recommendations_query = """
        SELECT p.*, ps.*, 
               ABS(p.price - %s) as price_diff,
               CASE WHEN p.brand = %s THEN 1 ELSE 0 END as same_brand
        FROM products p
        LEFT JOIN product_specs ps ON p.id = ps.product_id
        WHERE p.id != %s 
        AND p.price BETWEEN %s AND %s
        ORDER BY same_brand DESC, price_diff ASC
        LIMIT 5
        """
        
        recommendations_result = matcher.db_manager.execute_query(
            recommendations_query, 
            (base_product['price'], base_product['brand'], product_id, price_min, price_max)
        )
        
        recommendations = [dict(row) for row in recommendations_result] if recommendations_result else []
        
        return jsonify({
            'success': True,
            'base_product': base_product,
            'recommendations': recommendations,
            'recommendation_count': len(recommendations)
        })
        
    except Exception as e:
        logger.error(f"Get recommendations error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get recommendations'
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
    # Load or train model on startup
    matcher.load_model()
    
    # Start Flask app
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting Mobile Specification Matching API with PostgreSQL on port {port}")
    products_count = len(matcher.get_products_from_db())
    logger.info(f"Connected to database with {products_count} products")
    
    app.run(host='0.0.0.0', port=port, debug=debug)