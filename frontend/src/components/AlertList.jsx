import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import { BellIcon, BellSlashIcon, PencilIcon } from '@heroicons/react/24/outline';

function AlertList() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [showForm, setShowForm] = useState(!!searchParams.get('productId'));
    const [product, setProduct] = useState(null);
    const [availableProducts, setAvailableProducts] = useState([]);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        productId: searchParams.get('productId') || '',
        minPrice: '',
        maxPrice: '',
        notificationType: 'email',
    });
    const [editingAlert, setEditingAlert] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            toast.error('Please login to view alerts');
            return;
        }

        fetchAlerts();
        fetchAvailableProducts();
        if (formData.productId) {
            fetchProductDetails();
        }
    }, [formData.productId]);

    const fetchAvailableProducts = async () => {
        try {
            const { data } = await axios.get('/api/products');
            setAvailableProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load available products');
        }
    };

    const fetchProductDetails = async () => {
        try {
            // Validate productId format
            if (!formData.productId) {
                toast.error('No product selected');
                setShowForm(false);
                navigate('/alerts');
                return;
            }

            // Attempt to fetch the product
            const { data } = await axios.get(`/api/products/${encodeURIComponent(formData.productId)}`);

            if (!data) {
                throw new Error('Product not found');
            }

            setProduct(data);

            // Set initial price range based on current price
            if (data.currentPrice && !formData.minPrice && !formData.maxPrice) {
                const minPrice = (data.currentPrice * 0.9).toFixed(2); // 10% below current price
                const maxPrice = (data.currentPrice * 1.1).toFixed(2); // 10% above current price

                setFormData(prev => ({
                    ...prev,
                    minPrice,
                    maxPrice,
                }));

                // Force show form when product is loaded
                setShowForm(true);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to load product details';
            toast.error(errorMessage);
            setShowForm(false);
            navigate('/alerts');
        }
    };

    const fetchAlerts = async () => {
        try {
            const { data } = await axios.get('/api/alerts');
            setAlerts(data);
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
                toast.error('Please login to view alerts');
            } else {
                toast.error('Failed to load alerts');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.productId) {
                throw new Error('No product selected');
            }

            let data;
            if (editingAlert) {
                // Update existing alert
                data = await axios.patch(`/api/alerts/${editingAlert._id}`, {
                    minPrice: formData.minPrice,
                    maxPrice: formData.maxPrice,
                    notificationType: formData.notificationType,
                });
                setAlerts(alerts.map(alert =>
                    alert._id === editingAlert._id ? data.data : alert
                ));
                toast.success('Alert updated successfully');
            } else {
                // Create new alert
                data = await axios.post('/api/alerts', formData);
                setAlerts([...alerts, data.data]);
                toast.success('Alert created successfully');
            }

            setShowForm(false);
            setEditingAlert(null);
            setFormData({
                productId: '',
                minPrice: '',
                maxPrice: '',
                notificationType: 'email',
            });
            navigate('/alerts');
        } catch (error) {
            console.error('Error saving alert:', error);
            const errorMessage = error.response?.data?.message || error.message;
            toast.error(`Failed to ${editingAlert ? 'update' : 'create'} alert: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const startEditingAlert = (alert) => {
        setEditingAlert(alert);
        setFormData({
            productId: alert.product._id,
            minPrice: alert.minPrice,
            maxPrice: alert.maxPrice,
            notificationType: alert.notificationType,
        });
        setProduct(alert.product);
        setShowForm(true);
    };

    const toggleAlertStatus = async (alertId, currentStatus) => {
        try {
            await axios.patch(`/api/alerts/${alertId}`, {
                isActive: !currentStatus,
            });

            setAlerts(alerts.map(alert => {
                if (alert._id === alertId) {
                    return { ...alert, isActive: !currentStatus };
                }
                return alert;
            }));

            toast.success(`Alert ${currentStatus ? 'disabled' : 'enabled'} successfully`);
        } catch (error) {
            toast.error('Failed to update alert status');
        }
    };

    const deleteAlert = async (alertId) => {
        if (!window.confirm('Are you sure you want to delete this alert?')) {
            return;
        }

        try {
            await axios.delete(`/api/alerts/${alertId}`);
            setAlerts(alerts.filter(alert => alert._id !== alertId));
            toast.success('Alert deleted successfully');
        } catch (error) {
            toast.error('Failed to delete alert');
        }
    };

    if (loading && !alerts.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Price Alerts</h1>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn-primary"
                    >
                        Create Alert
                    </button>
                )}
            </div>

            {showForm && (
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold mb-4">
                        {editingAlert
                            ? `Edit Alert for ${product.name}`
                            : product
                                ? `Create Alert for ${product.name}`
                                : 'Create New Alert'
                        }
                    </h2>

                    {!formData.productId && (
                        <div className="mb-6">
                            <label htmlFor="productSelect" className="block text-sm font-medium text-gray-700 mb-2">
                                Select a Product
                            </label>
                            <select
                                id="productSelect"
                                className="input-field mb-2"
                                value={formData.productId}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        productId: e.target.value,
                                        minPrice: '',
                                        maxPrice: ''
                                    }));
                                }}
                            >
                                <option value="">Choose a product...</option>
                                {availableProducts.map(prod => (
                                    <option key={prod._id} value={prod._id}>
                                        {prod.name} - ${prod.currentPrice} ({prod.website})
                                    </option>
                                ))}
                            </select>
                            <p className="text-sm text-gray-500">
                                Select a product to set up price alerts for
                            </p>
                        </div>
                    )}

                    {product && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-lg mb-2">{product.name}</h3>
                            <div className="space-y-2">
                                <p className="text-gray-600">Current Price: <span className="font-medium">${product.currentPrice}</span></p>
                                <p className="text-gray-600">Website: <span className="font-medium capitalize">{product.website}</span></p>
                                {product.brand && (
                                    <p className="text-gray-600">Brand: <span className="font-medium">{product.brand}</span></p>
                                )}
                                {product.category && (
                                    <p className="text-gray-600">Category: <span className="font-medium">{product.category}</span></p>
                                )}
                            </div>
                        </div>
                    )}

                    {(product || formData.productId) && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
                                    Minimum Price ($)
                                </label>
                                <input
                                    type="number"
                                    id="minPrice"
                                    value={formData.minPrice}
                                    onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                                    className="input-field"
                                    required
                                    min="0"
                                    step="0.01"
                                />
                                {product && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Suggested: ${(product.currentPrice * 0.9).toFixed(2)} (10% below current price)
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
                                    Maximum Price ($)
                                </label>
                                <input
                                    type="number"
                                    id="maxPrice"
                                    value={formData.maxPrice}
                                    onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                                    className="input-field"
                                    required
                                    min="0"
                                    step="0.01"
                                />
                                {product && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Suggested: ${(product.currentPrice * 1.1).toFixed(2)} (10% above current price)
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="notificationType" className="block text-sm font-medium text-gray-700 mb-1">
                                    Notification Type
                                </label>
                                <select
                                    id="notificationType"
                                    value={formData.notificationType}
                                    onChange={(e) => setFormData({ ...formData, notificationType: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="email">Email</option>
                                    <option value="sms">SMS</option>
                                    <option value="both">Both</option>
                                </select>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="btn-primary flex-1"
                                    disabled={loading || (!editingAlert && !product)}
                                >
                                    {loading ? 'Saving...' : editingAlert ? 'Update Alert' : 'Create Alert'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        setShowForm(false);
                                        setProduct(null);
                                        setEditingAlert(null);
                                        setFormData({
                                            productId: '',
                                            minPrice: '',
                                            maxPrice: '',
                                            notificationType: 'email'
                                        });
                                        navigate('/alerts');
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {alerts.length > 0 ? (
                <div className="space-y-4">
                    {alerts.map(alert => (
                        <div key={alert._id} className="card">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold">{alert.product.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Price Range: ${alert.minPrice} - ${alert.maxPrice}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Notification: {alert.notificationType}
                                    </p>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => startEditingAlert(alert)}
                                        className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        title="Edit Alert"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => toggleAlertStatus(alert._id, alert.isActive)}
                                        className={`p-2 rounded-full ${alert.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                                        title={alert.isActive ? 'Disable Alert' : 'Enable Alert'}
                                    >
                                        {alert.isActive ? (
                                            <BellIcon className="h-5 w-5" />
                                        ) : (
                                            <BellSlashIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => deleteAlert(alert._id)}
                                        className="text-red-600 hover:text-red-700 text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">No price alerts set</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn-primary"
                    >
                        Create Your First Alert
                    </button>
                </div>
            )}
        </div>
    );
}

export default AlertList; 