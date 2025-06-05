import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function AddProduct() {
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        website: 'amazon',
        productIdentifier: '',
        category: '',
        brand: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('/api/products', formData);
            toast.success('Product added successfully');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    const websites = [
        { value: 'amazon', label: 'Amazon' },
        { value: 'flipkart', label: 'Flipkart' },
        { value: 'reliance', label: 'Reliance Digital' },
        { value: 'croma', label: 'Croma' },
        { value: 'bazaar', label: 'Big Bazaar' },
    ];

    return (
        <div className="max-w-2xl mx-auto">
            <div className="card">
                <h2 className="text-2xl font-bold mb-6 text-center">Add New Product</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                                Brand
                            </label>
                            <input
                                type="text"
                                id="brand"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label htmlFor="productIdentifier" className="block text-sm font-medium text-gray-700 mb-1">
                            Product Identifier (Model/SKU)
                        </label>
                        <input
                            type="text"
                            id="productIdentifier"
                            name="productIdentifier"
                            value={formData.productIdentifier}
                            onChange={handleChange}
                            className="input-field"
                            required
                            placeholder="e.g., iPhone-13-128GB or PS5-Digital"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Use the same identifier for the same product across different platforms
                        </p>
                    </div>

                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                            Product URL
                        </label>
                        <input
                            type="url"
                            id="url"
                            name="url"
                            value={formData.url}
                            onChange={handleChange}
                            className="input-field"
                            required
                            placeholder="https://www.amazon.com/product-url"
                        />
                    </div>

                    <div>
                        <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                            Website
                        </label>
                        <select
                            id="website"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="input-field"
                            required
                        >
                            {websites.map(site => (
                                <option key={site.value} value={site.value}>
                                    {site.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary w-full"
                        disabled={loading}
                    >
                        {loading ? 'Adding Product...' : 'Add Product'}
                    </button>
                </form>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Tips:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Make sure to copy the full product URL from the browser</li>
                    <li>• Use the same Product Identifier for identical products across different platforms</li>
                    <li>• Product name should be clear and recognizable</li>
                    <li>• Select the correct website for accurate price tracking</li>
                    <li>• Adding brand and category helps with searching and filtering</li>
                </ul>
            </div>
        </div>
    );
}

export default AddProduct; 