import { useState, useEffect } from 'react';
import axios from 'axios';

const LowestPriceProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLowestPriceProducts = async () => {
            try {
                console.log('Fetching products...');
                const response = await axios.get('http://localhost:5050/api/products/lowest-price');
                console.log('API Response:', response.data);
                setProducts(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(`Failed to fetch lowest price products: ${err.message}`);
                setLoading(false);
            }
        };

        fetchLowestPriceProducts();
    }, []);

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (products.length === 0) return <div className="text-center p-4">No products found</div>;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Lowest Price Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                    <div key={product._id} className="bg-white rounded-lg shadow-md p-4">
                        {product.imageUrl && (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-48 object-cover mb-4 rounded"
                            />
                        )}
                        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                        <p className="text-green-600 font-bold">₹{product.currentPrice.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 mt-2">
                            From {product.website.charAt(0).toUpperCase() + product.website.slice(1)}
                        </p>
                        <div className="mt-2">
                            <p className="text-xs text-gray-500">Lowest: ₹{product.lowestPrice.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Highest: ₹{product.highestPrice.toLocaleString()}</p>
                        </div>
                        <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-block text-blue-600 hover:underline"
                        >
                            View Product
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LowestPriceProducts; 