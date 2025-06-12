const axios = require('axios');
const cheerio = require('cheerio');

const extractPrice = async (url, website) => {
    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };
        const response = await axios.get(url, { headers });
        const $ = cheerio.load(response.data);

        let price = null;
        let name = null;
        let brand = null;
        let category = null;

        switch (website.toLowerCase()) {
            case 'amazon':
                price = extractAmazonPrice($);
                name = $('#productTitle').text().trim();
                brand = $('#bylineInfo').text().trim();
                category = $('#wayfinding-breadcrumbs_feature_div').text().trim();
                break;

            case 'flipkart':
                price = extractFlipkartPrice($);
                name = $('.B_NuCI').text().trim();
                brand = $('.G6XhRU').text().trim();
                category = $('._3Ll34p').text().trim();
                break;

            case 'croma':
                price = extractCromaPrice($);
                name = $('.pd-title').text().trim();
                brand = $('.pd-brand').text().trim();
                category = $('.breadcrumb').text().trim();
                break;

            case 'meesho':
                price = extractMeeshoPrice($);
                name = $('.ProductDetails__ProductName-sc-1p3qgqh-0').text().trim();
                brand = $('.ProductDetails__BrandName-sc-1p3qgqh-1').text().trim();
                category = $('.Breadcrumbs__BreadcrumbsWrapper-sc-1p3qgqh-2').text().trim();
                break;

            default:
                throw new Error(`Unsupported website: ${website}`);
        }

        if (!price) {
            throw new Error(`Could not extract price from ${website}`);
        }

        const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
        if (isNaN(numericPrice)) {
            throw new Error(`Invalid price format: ${price}`);
        }

        return {
            price: numericPrice,
            name: name || '',
            brand: brand || '',
            category: category || ''
        };
    } catch (error) {
        console.error(`Error extracting price from ${website}:`, error);
        throw new Error(`Failed to extract price from ${website}: ${error.message}`);
    }
};

const extractAmazonPrice = ($) => {
    const priceElement = $('#priceblock_ourprice, .a-price-whole, #price_inside_buybox').first();
    return priceElement.text().replace(/[^0-9.]/g, '');
};

const extractFlipkartPrice = ($) => {
    const priceElement = $('._30jeq3._16Jk6d, ._30jeq3');
    return priceElement.text().replace(/[^0-9.]/g, '');
};

const extractCromaPrice = ($) => {
    const priceElement = $('.amount, .pd-price, .price').first();
    return priceElement.text().replace(/[^0-9.]/g, '');
};

const extractMeeshoPrice = ($) => {
    const priceElement = $('.ProductDetails__DiscountedPriceP-sc-1p3qgqh-3, .actual-price');
    return priceElement.text().replace(/[^0-9.]/g, '');
};

module.exports = {
    extractPrice
}; 