import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function Dashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        activeAlerts: 0,
        priceDrops: 0,
    });
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('lowestPrice'); // 'lowestPrice' or 'highestDiscount'

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [productsRes, alertsRes] = await Promise.all([
                axios.get('/api/products'),
                axios.get('/api/alerts'),
            ]);

            const products = productsRes.data;
            const alerts = alertsRes.data;

            // Calculate price drops in the last 24 hours
            const priceDrops = products.filter(product => {
                const history = product.historicalPrices;
                if (history.length < 2) return false;
                return history[history.length - 1].price < history[history.length - 2].price;
            }).length;

            setStats({
                totalProducts: products.length,
                activeAlerts: alerts.filter(alert => alert.isActive).length,
                priceDrops,
            });

            // Group products by identifier
            const groupedProducts = groupProductsByIdentifier(products);
            setProducts(groupedProducts);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const groupProductsByIdentifier = (products) => {
        const grouped = {};
        products.forEach(product => {
            if (!grouped[product.productIdentifier]) {
                grouped[product.productIdentifier] = {
                    name: product.name,
                    identifier: product.productIdentifier,
                    category: product.category,
                    brand: product.brand,
                    prices: []
                };
            }
            grouped[product.productIdentifier].prices.push({
                website: product.website,
                price: product.currentPrice,
                url: product.url
            });
        });
        return Object.values(grouped);
    };

    const calculateDiscount = (prices) => {
        if (prices.length < 2) return 0;
        const highest = Math.max(...prices.map(p => p.price));
        const lowest = Math.min(...prices.map(p => p.price));
        return ((highest - lowest) / highest) * 100;
    };

    const filterProducts = () => {
        if (!searchQuery) return products;

        return products.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const sortProducts = (products) => {
        return [...products].sort((a, b) => {
            if (sortBy === 'lowestPrice') {
                const aMin = Math.min(...a.prices.map(p => p.price));
                const bMin = Math.min(...b.prices.map(p => p.price));
                return aMin - bMin;
            } else {
                const aDiscount = calculateDiscount(a.prices);
                const bDiscount = calculateDiscount(b.prices);
                return bDiscount - aDiscount;
            }
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    const filteredAndSortedProducts = sortProducts(filterProducts());

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-blue-50">
                    <h3 className="text-lg font-semibold">Total Products</h3>
                    <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
                <div className="card bg-green-50">
                    <h3 className="text-lg font-semibold">Active Alerts</h3>
                    <p className="text-2xl font-bold">{stats.activeAlerts}</p>
                </div>
                <div className="card bg-yellow-50">
                    <h3 className="text-lg font-semibold">Price Drops Today</h3>
                    <p className="text-2xl font-bold">{stats.priceDrops}</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 max-w-xl">
                    <input
                        type="text"
                        placeholder="Search products by name, brand, or category..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <select
                    className="border rounded-lg px-4 py-2"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="lowestPrice">Sort by Lowest Price</option>
                    <option value="highestDiscount">Sort by Highest Discount</option>
                </select>
                <Link to="/products/add" className="btn-primary whitespace-nowrap">
                    Add New Product
                </Link>
            </div>

            <div className="grid gap-6">
                {filteredAndSortedProducts.map(product => {
                    const lowestPrice = Math.min(...product.prices.map(p => p.price));
                    const highestPrice = Math.max(...product.prices.map(p => p.price));
                    const discount = calculateDiscount(product.prices);

                    return (
                        <div key={product.identifier} className="card hover:shadow-lg transition-shadow">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{product.name}</h3>
                                    {product.brand && (
                                        <p className="text-sm text-gray-600">Brand: {product.brand}</p>
                                    )}
                                    {product.category && (
                                        <p className="text-sm text-gray-600">Category: {product.category}</p>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    {product.prices.sort((a, b) => a.price - b.price).map((price, index) => (
                                        <a
                                            key={price.website}
                                            href={price.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex flex-col p-3 rounded-lg ${index === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                                } border`}
                                        >
                                            <span className="font-medium capitalize">{price.website}</span>
                                            <span className={`text-lg ${index === 0 ? 'text-green-600' : ''}`}>
                                                ${price.price}
                                            </span>
                                            {index === 0 && <span className="text-xs text-green-600">Best Price!</span>}
                                        </a>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t">
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-600">
                                            Price Range: ${lowestPrice} - ${highestPrice}
                                        </p>
                                        {discount > 0 && (
                                            <p className="text-sm text-green-600">
                                                Potential Savings: {discount.toFixed(1)}%
                                            </p>
                                        )}
                                    </div>
                                    <Link
                                        to={`/alerts/add?productId=${product.identifier}`}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        Set Price Alert
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredAndSortedProducts.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-600">No products found matching your search criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard; 