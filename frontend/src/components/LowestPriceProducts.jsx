import { useState, useEffect } from 'react';
import axios from '../config/axios';
import { toast } from 'react-toastify';

const LowestPriceProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLowestPriceProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const { data } = await axios.get('/api/products/lowest-price');
                setProducts(data);
            } catch (err) {
                console.error('Error fetching products:', err);
                const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch products';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchLowestPriceProducts();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="p-4 text-center">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    <p>No products found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Lowest Price Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                    <div key={product._id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                        {product.imageUrl && (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-48 object-cover mb-4 rounded"
                            />
                        )}
                        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                        <p className="text-green-600 font-bold text-xl">₹{product.currentPrice.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 mt-2">
                            From {product.website.charAt(0).toUpperCase() + product.website.slice(1)}
                        </p>
                        <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-500">Lowest: ₹{product.lowestPrice.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Highest: ₹{product.highestPrice.toLocaleString()}</p>
                        </div>
                        <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-block text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            View Product →
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LowestPriceProducts; 