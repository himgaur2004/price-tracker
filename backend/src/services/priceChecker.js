const nodemailer = require('nodemailer');
const Product = require('../models/Product');
const PriceAlert = require('../models/PriceAlert');
const User = require('../models/User');
const cheerio = require('cheerio');
const axios = require('axios');
const { extractPrice } = require('../utils/priceExtractor');

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Send email notification for price changes and deals
async function sendPriceAlert(user, product, alert, newPrice, bestDeals) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Price Alert for ${product.name}`,
        html: `
            <h2>Price Alert Notification</h2>
            <p>The price for ${product.name} has changed to $${newPrice}</p>
            <p>Your alert settings:</p>
            <ul>
                <li>Min Price: $${alert.minPrice}</li>
                <li>Max Price: $${alert.maxPrice}</li>
            </ul>
            <p>View the product: <a href="${product.url}">${product.url}</a></p>
            ${bestDeals ? `
            <h3>Best Deals Available:</h3>
            <ul>
                ${bestDeals.map(deal => `
                    <li>${deal.website}: $${deal.price} - <a href="${deal.url}">View Deal</a></li>
                `).join('')}
            </ul>
            ` : ''}
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Price alert email sent to ${user.email}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Check prices across all platforms and update database
async function checkPrices() {
    try {
        const products = await Product.find();

        for (const product of products) {
            const productIdentifier = product.productIdentifier;
            const relatedProducts = await Product.find({
                productIdentifier: productIdentifier
            });

            // Get prices from all platforms
            const priceData = await Promise.all(
                relatedProducts.map(async (p) => {
                    const price = await extractPrice(p.url, p.website);
                    return {
                        website: p.website,
                        price: price,
                        url: p.url
                    };
                })
            );

            // Filter out null prices and find best deals
            const validPrices = priceData.filter(p => p.price !== null);
            if (validPrices.length > 0) {
                const lowestPrice = Math.min(...validPrices.map(p => p.price));
                const highestPrice = Math.max(...validPrices.map(p => p.price));

                // Update each product with new price data
                for (const p of relatedProducts) {
                    const currentPlatformPrice = validPrices.find(vp => vp.website === p.website)?.price;

                    if (currentPlatformPrice) {
                        p.historicalPrices.push({
                            price: currentPlatformPrice,
                            date: new Date()
                        });
                        p.currentPrice = currentPlatformPrice;
                        p.lowestPrice = lowestPrice;
                        p.highestPrice = highestPrice;
                        p.lastChecked = new Date();
                        await p.save();

                        // Check alerts for this product
                        const alerts = await PriceAlert.find({
                            product: p._id,
                            isActive: true
                        }).populate('user');

                        for (const alert of alerts) {
                            if (currentPlatformPrice <= alert.maxPrice && currentPlatformPrice >= alert.minPrice) {
                                // Sort prices to show best deals
                                const bestDeals = validPrices
                                    .sort((a, b) => a.price - b.price)
                                    .slice(0, 3);

                                await sendPriceAlert(alert.user, p, alert, currentPlatformPrice, bestDeals);
                                alert.lastNotified = new Date();
                                await alert.save();
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error checking prices:', error);
    }
}

// Run price checker every hour
setInterval(checkPrices, 60 * 60 * 1000);

// Initial check
checkPrices();

module.exports = {
    extractPrice,
    checkPrices
}; 