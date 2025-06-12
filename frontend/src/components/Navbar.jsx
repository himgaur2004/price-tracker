import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Navbar() {
    const { isAuthenticated, logout } = useAuth();

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-xl font-bold text-blue-600">
                        Price Tracker
                    </Link>

                    <div className="flex items-center space-x-4">
                        <Link to="/lowest-prices" className="text-gray-700 hover:text-blue-600">
                            Lowest Prices
                        </Link>
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                                    Dashboard
                                </Link>
                                <Link to="/products" className="text-gray-700 hover:text-blue-600">
                                    Products
                                </Link>
                                <Link to="/alerts" className="text-gray-700 hover:text-blue-600">
                                    Alerts
                                </Link>
                                <Link to="/settings" className="text-gray-700 hover:text-blue-600">
                                    Settings
                                </Link>
                                <button
                                    onClick={logout}
                                    className="text-gray-700 hover:text-blue-600"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-700 hover:text-blue-600">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar; 