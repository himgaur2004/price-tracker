import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';
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

    // Check authentication on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            toast.error('Please login to add products');
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateUrl = (url, website) => {
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.toLowerCase();

            const websiteDomains = {
                amazon: ['amazon.com', 'amazon.in'],
                flipkart: ['flipkart.com'],
                reliance: ['reliancedigital.in'],
                croma: ['croma.com'],
                bazaar: ['bigbazaar.com']
            };

            if (!websiteDomains[website].some(d => domain.includes(d))) {
                throw new Error(`URL does not match selected website. Please provide a valid ${website} URL.`);
            }

            return true;
        } catch (error) {
            if (error.message.includes('URL does not match')) {
                throw error;
            }
            throw new Error('Please enter a valid URL');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate URL matches selected website
            validateUrl(formData.url, formData.website);

            // Log the form data being sent
            console.log('Submitting form data:', formData);

            // Check authentication
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please login to add products');
            }

            // Make the API request
            console.log('Making API request to:', axios.defaults.baseURL + '/api/products');
            const response = await axios.post('/api/products', formData);
            console.log('API Response:', response.data);

            toast.success('Product added successfully');
            navigate('/dashboard');
        } catch (error) {
            console.error('API Error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            // Handle different types of errors
            if (error.message.includes('URL')) {
                toast.error(error.message);
            } else if (error.response?.status === 401) {
                navigate('/login');
                toast.error('Please login to continue');
            } else {
                const errorMessage = error.response?.data?.message || error.message;
                toast.error(`Failed to add product: ${errorMessage}`);

                if (error.response?.data?.error) {
                    console.error('Detailed error:', error.response.data.error);
                    toast.error(`Error details: ${error.response.data.error}`);
                }
            }
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
                            placeholder={`https://www.${formData.website}.com/product-url`}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Make sure the URL matches the selected website
                        </p>
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
                    <li>• Ensure the URL matches the selected website (e.g., Amazon URL for Amazon)</li>
                </ul>
            </div>
        </div>
    );
}

export default AddProduct; 