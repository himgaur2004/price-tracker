const express = require('express');
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const { extractPrice } = require('../utils/priceExtractor');

const router = express.Router();

// Helper function to add delay between retries
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Get lowest priced products
router.get('/lowest-price', async (req, res) => {
    try {
        console.log('Fetching lowest priced products...');
        const products = await Product.find()
            .sort({ currentPrice: 1 })
            .limit(10);

        if (!products || products.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }

        console.log(`Found ${products.length} products`);
        res.json(products);
    } catch (error) {
        console.error('Error fetching lowest priced products:', error);
        res.status(500).json({ message: 'Error fetching lowest priced products', error: error.message });
    }
});

// Get all products for a user
router.get('/', auth, async (req, res) => {
    try {
        const products = await Product.find({ createdBy: req.user.userId });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// Get a single product
router.get('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            createdBy: req.user.userId
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
});

// Compare prices across platforms
router.get('/compare', auth, async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const searchRegex = new RegExp(query, 'i');
        const products = await Product.find({
            $or: [
                { name: searchRegex },
                { brand: searchRegex },
                { category: searchRegex }
            ]
        }).sort({ currentPrice: 1 });

        const groupedProducts = products.reduce((acc, product) => {
            if (!acc[product.website]) {
                acc[product.website] = [];
            }
            acc[product.website].push(product);
            return acc;
        }, {});

        const lowestPrices = Object.values(groupedProducts).map(websiteProducts => {
            return websiteProducts.reduce((lowest, current) => {
                return (!lowest || current.currentPrice < lowest.currentPrice) ? current : lowest;
            }, null);
        }).filter(Boolean);

        res.json(products);
    } catch (error) {
        console.error('Error comparing prices:', error);
        res.status(500).json({ message: 'Error comparing prices', error: error.message });
    }
});

// Add a new product
router.post('/', auth, async (req, res) => {
    try {
        const { name, url, website, productIdentifier, category, brand } = req.body;

        if (!name || !url || !website || !productIdentifier) {
            return res.status(400).json({
                message: 'Missing required fields. Please provide name, url, website, and productIdentifier.'
            });
        }

        // Extract price using the imported extractPrice function
        let currentPrice;
        try {
            const priceData = await extractPrice(url, website);
            currentPrice = priceData.price;
            console.log('Successfully extracted price:', currentPrice);
        } catch (error) {
            console.error('Price extraction error:', error);
            return res.status(400).json({
                message: 'Could not extract price from URL. Please verify the URL and try again.',
                error: error.message
            });
        }

        const productData = {
            name,
            url,
            website,
            productIdentifier,
            category,
            brand,
            currentPrice,
            historicalPrices: [{ price: currentPrice, date: new Date() }],
            createdBy: req.user.userId,
            lowestPrice: currentPrice,
            highestPrice: currentPrice,
            lastChecked: new Date()
        };

        const product = new Product(productData);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Product creation error:', error);
        res.status(500).json({
            message: 'Error creating product',
            error: error.message
        });
    }
});

// Update a product
router.patch('/:id', auth, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'url', 'website', 'productIdentifier', 'category', 'brand'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        const product = await Product.findOne({ _id: req.params.id, createdBy: req.user.userId });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        updates.forEach(update => product[update] = req.body[update]);
        await product.save();
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
});

// Delete a product
router.delete('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user.userId,
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});

module.exports = router; 