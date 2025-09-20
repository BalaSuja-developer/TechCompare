# TechCompare - ML-Powered Product Comparison Web Application

A comprehensive product comparison platform with machine learning-powered price predictions, built with React, Node.js, PostgreSQL, and Python.

## 🚀 Features

- **Product Browsing & Search**: Advanced filtering and search capabilities
- **Side-by-Side Comparison**: Compare multiple products with detailed specifications
- **ML Price Prediction**: AI-powered price predictions using Linear Regression
- **User Authentication**: Role-based access (User/Admin)
- **Admin Dashboard**: Product management and ML model control
- **Responsive Design**: Mobile-first approach with modern UI/UX

## 🏗️ Architecture

```
Frontend (React/TypeScript) ↔ Backend API (Node.js/Express) ↔ Database (PostgreSQL)
                                        ↕
                              ML API (Python/Flask/scikit-learn)
```

## 📁 Project Structure

```
/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API integration
│   │   ├── config/         # Configuration files
│   │   └── contexts/       # React contexts
├── backend/                 # Node.js Express API
│   ├── controllers/        # Route controllers
│   ├── routes/            # API routes
│   ├── queries/           # SQL queries
│   ├── middleware/        # Custom middleware
│   └── config/           # Database configuration
├── ml-api/                 # Python ML service
│   ├── app.py            # Flask application
│   ├── model/            # ML model files
│   └── requirements.txt  # Python dependencies
└── db/                    # Database schema
    └── init.sql          # PostgreSQL initialization
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **JWT** authentication
- **bcrypt** for password hashing

### ML Service
- **Python** with Flask
- **scikit-learn** for Linear Regression
- **pandas** for data processing
- **joblib** for model persistence

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- PostgreSQL (v12+)

### 1. Database Setup

```bash
# Create database
createdb techcompare_db

# Run initialization script
psql -d techcompare_db -f db/init.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# Start the server
npm run dev
```

### 3. ML API Setup

```bash
cd ml-api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the ML API
python app.py
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=techcompare_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
ML_API_URL=http://localhost:5000/api
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ML_API_URL=http://localhost:5000/api
```

## 🤖 ML Model

The price prediction model uses **Linear Regression** with the following features:
- Brand (encoded)
- Display size (numeric)
- RAM (numeric)
- Storage (numeric)
- Camera (numeric)
- Battery (numeric)

### Model Training
The model is automatically trained with sample data on startup. For production:

1. Collect real product data
2. Use the `/api/admin/retrain` endpoint
3. Monitor model performance via `/api/model/status`

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Breakpoints for all screen sizes
- Touch-friendly interfaces
- Optimized performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation

---

Built with ❤️ using React, Node.js, PostgreSQL, and Python
