const nodemailer = require('nodemailer');
const Product = require('../models/Product');
const PriceAlert = require('../models/PriceAlert');
const User = require('../models/User');
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
                    try {
                        const priceInfo = await extractPrice(p.url, p.website);
                        // Ensure we're getting a valid numeric price
                        const price = typeof priceInfo === 'object' ? priceInfo.price : parseFloat(priceInfo);
                        if (isNaN(price)) {
                            console.error(`Invalid price for ${p.url}: ${price}`);
                            return null;
                        }
                        return {
                            website: p.website,
                            price: price,
                            url: p.url
                        };
                    } catch (error) {
                        console.error(`Error extracting price for ${p.url}:`, error);
                        return null;
                    }
                })
            );

            // Filter out null prices and find best deals
            const validPrices = priceData.filter(p => p !== null && p.price !== null && !isNaN(p.price));
            if (validPrices.length > 0) {
                const lowestPrice = Math.min(...validPrices.map(p => p.price));
                const highestPrice = Math.max(...validPrices.map(p => p.price));

                // Update each product with new price data
                for (const p of relatedProducts) {
                    const currentPlatformData = validPrices.find(vp => vp.website === p.website);
                    if (currentPlatformData && !isNaN(currentPlatformData.price)) {
                        const currentPrice = currentPlatformData.price;

                        // Update historical prices with just the numeric price value
                        p.historicalPrices.push({
                            price: currentPrice,
                            date: new Date()
                        });

                        // Update current price and price range
                        p.currentPrice = currentPrice;
                        p.lowestPrice = Math.min(lowestPrice, p.lowestPrice || Number.MAX_VALUE);
                        p.highestPrice = Math.max(highestPrice, p.highestPrice || 0);
                        p.lastChecked = new Date();

                        try {
                            await p.save();
                        } catch (error) {
                            console.error(`Error saving product ${p._id}:`, error);
                            continue;
                        }

                        // Check alerts for this product
                        const alerts = await PriceAlert.find({
                            product: p._id,
                            isActive: true
                        }).populate('user');

                        for (const alert of alerts) {
                            if (currentPrice <= alert.maxPrice && currentPrice >= alert.minPrice) {
                                // Sort prices to show best deals
                                const bestDeals = validPrices
                                    .sort((a, b) => a.price - b.price)
                                    .slice(0, 3);

                                await sendPriceAlert(alert.user, p, alert, currentPrice, bestDeals);
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

module.exports = {
    checkPrices
};