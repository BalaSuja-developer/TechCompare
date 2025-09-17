import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import CompareProducts from './pages/CompareProducts';
import PricePrediction from './pages/PricePrediction';
import AdminDashboard from './pages/AdminDashboard';

function AppLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show Navbar only if logged in */}
      {isAuthenticated && <Navbar />}
      
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected user routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/products" element={
          <ProtectedRoute>
            <ProductList />
          </ProtectedRoute>
        } />
        <Route path="/products/:id" element={
          <ProtectedRoute>
            <ProductDetails />
          </ProtectedRoute>
        } />
        <Route path="/compare" element={
          <ProtectedRoute>
            <CompareProducts />
          </ProtectedRoute>
        } />
        <Route path="/predict" element={
          <ProtectedRoute>
            <PricePrediction />
          </ProtectedRoute>
        } />
        
        {/* Admin route */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;