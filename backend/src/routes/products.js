const express = require('express');
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const cheerio = require('cheerio');
const axios = require('axios');

const router = express.Router();

// Helper function to add delay between retries
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to extract price from websites
async function extractPrice(url, website, retries = 3) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
    };

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await axios.get(url, { headers });
            const $ = cheerio.load(response.data);

            let price = null;
            if (website === 'amazon') {
                // Try multiple Amazon price selectors
                const selectors = [
                    '#priceblock_ourprice',
                    '.a-price-whole',
                    '#price_inside_buybox',
                    '#newBuyBoxPrice',
                    '.a-offscreen'
                ];

                for (const selector of selectors) {
                    const priceText = $(selector).first().text().trim();
                    if (priceText) {
                        price = priceText.replace(/[^0-9.]/g, '');
                        break;
                    }
                }
            } else if (website === 'flipkart') {
                // Try multiple Flipkart price selectors
                const selectors = [
                    '._30jeq3._16Jk6d',
                    '.dyC4hf',
                    '._30jeq3',
                    '.CEmiEU',
                    '._2YxCDZ'
                ];

                for (const selector of selectors) {
                    const priceText = $(selector).first().text().trim();
                    if (priceText) {
                        price = priceText.replace(/[^0-9.]/g, '');
                        break;
                    }
                }
            } else if (website === 'reliance') {
                const selectors = ['.pdp__price'];
                for (const selector of selectors) {
                    const priceText = $(selector).first().text().trim();
                    if (priceText) {
                        price = priceText.replace(/[^0-9.]/g, '');
                        break;
                    }
                }
            } else if (website === 'croma') {
                const selectors = ['.price', '.pd-price'];
                for (const selector of selectors) {
                    const priceText = $(selector).first().text().trim();
                    if (priceText) {
                        price = priceText.replace(/[^0-9.]/g, '');
                        break;
                    }
                }
            }

            const parsedPrice = parseFloat(price);
            if (parsedPrice) {
                return parsedPrice;
            }

            // If we couldn't find a price, wait before retrying
            await delay(Math.pow(2, attempt) * 1000); // Exponential backoff
            continue;
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed:`, error.message);
            if (attempt < retries - 1) {
                await delay(Math.pow(2, attempt) * 1000); // Exponential backoff
                continue;
            }
            throw new Error(`Failed to extract price after ${retries} attempts: ${error.message}`);
        }
    }
    throw new Error('Could not extract price from the provided URL');
}

// Get lowest priced products
router.get('/lowest-price', async (req, res) => {
    try {
        const products = await Product.find()
            .sort({ currentPrice: 1 })
            .limit(10);
        res.json(products);
    } catch (error) {
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

// Add a new product
router.post('/', auth, async (req, res) => {
    console.log('Received product creation request:', {
        body: req.body,
        user: req.user,
        headers: req.headers
    });

    try {
        const { name, url, website, productIdentifier, category, brand } = req.body;

        // Log the extracted fields
        console.log('Extracted fields:', { name, url, website, productIdentifier, category, brand });

        // Validate required fields
        if (!name || !url || !website || !productIdentifier) {
            console.log('Missing required fields:', {
                name: !name,
                url: !url,
                website: !website,
                productIdentifier: !productIdentifier
            });
            return res.status(400).json({
                message: 'Missing required fields. Please provide name, url, website, and productIdentifier.'
            });
        }

        // Extract price from the URL
        console.log('Attempting to extract price from:', url);
        let currentPrice;
        try {
            currentPrice = await extractPrice(url, website);
            console.log('Successfully extracted price:', currentPrice);
        } catch (error) {
            console.error('Price extraction error:', {
                error: error.message,
                url,
                website
            });
            return res.status(400).json({
                message: 'Could not extract price from URL. Please verify the URL and try again.',
                error: error.message
            });
        }

        // Create new product with all fields
        const productData = {
            name,
            url,
            website,
            productIdentifier,
            category,
            brand,
            currentPrice,
            historicalPrices: [{ price: currentPrice }],
            createdBy: req.user.userId,
            lowestPrice: currentPrice,
            highestPrice: currentPrice,
            lastChecked: new Date()
        };
        console.log('Creating product with data:', productData);

        const product = new Product(productData);
        await product.save();
        console.log('Product saved successfully:', product);

        res.status(201).json(product);
    } catch (error) {
        console.error('Product creation error:', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            message: 'Error creating product',
            error: error.message,
            stack: error.stack
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