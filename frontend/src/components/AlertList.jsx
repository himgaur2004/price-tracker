import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BellIcon, BellSlashIcon } from '@heroicons/react/24/outline';

function AlertList() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [showForm, setShowForm] = useState(!!searchParams.get('productId'));
    const [formData, setFormData] = useState({
        productId: searchParams.get('productId') || '',
        minPrice: '',
        maxPrice: '',
        notificationType: 'email',
    });

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const { data } = await axios.get('/api/alerts');
            setAlerts(data);
        } catch (error) {
            toast.error('Failed to load alerts');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await axios.post('/api/alerts', formData);
            setAlerts([...alerts, data]);
            setShowForm(false);
            setFormData({
                productId: '',
                minPrice: '',
                maxPrice: '',
                notificationType: 'email',
            });
            toast.success('Alert created successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create alert');
        } finally {
            setLoading(false);
        }
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
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary"
                >
                    {showForm ? 'Cancel' : 'Create Alert'}
                </button>
            </div>

            {showForm && (
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold mb-4">Create New Alert</h2>
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

                        <button type="submit" className="btn-primary w-full" disabled={loading}>
                            Create Alert
                        </button>
                    </form>
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
                                        onClick={() => toggleAlertStatus(alert._id, alert.isActive)}
                                        className={`p-2 rounded-full ${alert.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                            }`}
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

                            {alert.lastNotified && (
                                <p className="text-sm text-gray-500 mt-2">
                                    Last notification: {new Date(alert.lastNotified).toLocaleString()}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">No price alerts set</p>
                    <Link to="/products" className="btn-primary">
                        Browse Products
                    </Link>
                </div>
            )}
        </div>
    );
}

export default AlertList; 