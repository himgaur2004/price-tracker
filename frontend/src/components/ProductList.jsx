import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TrashIcon } from '@heroicons/react/24/outline';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('/api/products');
            setProducts(data);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await axios.delete(`/api/products/${productId}`);
            setProducts(products.filter(p => p._id !== productId));
            toast.success('Product deleted successfully');
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const getPriceChange = (product) => {
        const history = product.historicalPrices;
        if (history.length < 2) return null;

        const currentPrice = history[history.length - 1].price;
        const previousPrice = history[history.length - 2].price;
        const change = ((currentPrice - previousPrice) / previousPrice) * 100;

        return {
            value: change.toFixed(2),
            isPositive: change > 0,
        };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Your Products</h1>
                <Link to="/products/add" className="btn-primary">
                    Add New Product
                </Link>
            </div>

            {products.length > 0 ? (
                <div className="grid gap-6">
                    {products.map(product => {
                        const priceChange = getPriceChange(product);

                        return (
                            <div key={product._id} className="card hover:shadow-lg transition-shadow">
                                <div className="flex justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                                        <p className="text-gray-600 text-sm mb-2">
                                            From: {product.website.charAt(0).toUpperCase() + product.website.slice(1)}
                                        </p>
                                        <div className="flex items-center space-x-4">
                                            <p className="font-medium">${product.currentPrice}</p>
                                            {priceChange && (
                                                <span className={`text-sm ${priceChange.isPositive ? 'text-red-600' : 'text-green-600'}`}>
                                                    {priceChange.isPositive ? '↑' : '↓'} {Math.abs(priceChange.value)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <a
                                            href={product.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline text-sm"
                                        >
                                            View on Site
                                        </a>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">
                                            Last checked: {new Date(product.lastChecked).toLocaleString()}
                                        </span>
                                        <Link
                                            to={`/alerts/add?productId=${encodeURIComponent(product._id)}`}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            Set Price Alert
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">You haven't added any products yet</p>
                    <Link to="/products/add" className="btn-primary">
                        Add Your First Product
                    </Link>
                </div>
            )}
        </div>
    );
}

export default ProductList; 