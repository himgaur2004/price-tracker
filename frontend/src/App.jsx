import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import AddProduct from './components/AddProduct';
import AlertList from './components/AlertList';
import UserSettings from './components/UserSettings';
import LowestPriceProducts from './components/LowestPriceProducts';
import { useAuth } from './hooks/useAuth';

function App() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <Routes>
                    <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
                    <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
                    <Route path="/products" element={isAuthenticated ? <ProductList /> : <Navigate to="/login" />} />
                    <Route path="/products/add" element={isAuthenticated ? <AddProduct /> : <Navigate to="/login" />} />
                    <Route path="/alerts" element={isAuthenticated ? <AlertList /> : <Navigate to="/login" />} />
                    <Route path="/settings" element={isAuthenticated ? <UserSettings /> : <Navigate to="/login" />} />
                    <Route path="/lowest-prices" element={<LowestPriceProducts />} />
                    <Route path="/" element={<Navigate to="/lowest-prices" />} />
                </Routes>
            </main>
        </div>
    );
}

export default App; 