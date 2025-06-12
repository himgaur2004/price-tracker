import React, { useState } from 'react';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function PriceComparison() {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [groupedResults, setGroupedResults] = useState({});

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            toast.error('Please enter a search term');
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.get(`/api/products/compare?query=${encodeURIComponent(searchQuery)}`);
            setResults(data);

            // Group results by product name
            const grouped = data.reduce((acc, product) => {
                const name = product.name.toLowerCase();
                if (!acc[name]) {
                    acc[name] = [];
                }
                acc[name].push(product);
                return acc;
            }, {});

            setGroupedResults(grouped);
        } catch (error) {
            console.error('Error searching products:', error);
            toast.error('Failed to search products');
        } finally {
            setLoading(false);
        }
    };

    const renderPriceComparison = (products) => {
        // Sort products by price
        const sortedProducts = [...products].sort((a, b) => a.currentPrice - b.currentPrice);
        const lowestPrice = sortedProducts[0]?.currentPrice;

        return (
            <div className="space-y-2">
                {sortedProducts.map((product, index) => (
                    <div
                        key={product._id}
                        className={`flex justify-between items-center p-2 rounded ${product.currentPrice === lowestPrice ? 'bg-green-50' : ''
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <img
                                src={`/logos/${product.website}.png`}
                                alt={product.website}
                                className="w-6 h-6 object-contain"
                            />
                            <span className="capitalize">{product.website}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className={`font-semibold ${product.currentPrice === lowestPrice ? 'text-green-600' : ''
                                }`}>
                                ${product.currentPrice}
                            </span>
                            <a
                                href={product.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                            >
                                View
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-4">Price Comparison</h1>
                <form onSubmit={handleSearch} className="flex space-x-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for a product..."
                            className="input-field w-full"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-primary flex items-center space-x-2"
                        disabled={loading}
                    >
                        <MagnifyingGlassIcon className="w-5 h-5" />
                        <span>{loading ? 'Searching...' : 'Search'}</span>
                    </button>
                </form>
            </div>

            {Object.entries(groupedResults).length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(groupedResults).map(([name, products]) => (
                        <div key={name} className="card">
                            <h3 className="text-lg font-semibold mb-4">{products[0].name}</h3>
                            {renderPriceComparison(products)}
                        </div>
                    ))}
                </div>
            ) : (
                !loading && (
                    <div className="text-center py-12 text-gray-600">
                        {searchQuery ? 'No results found' : 'Search for a product to compare prices'}
                    </div>
                )
            )}
        </div>
    );
}

export default PriceComparison; 