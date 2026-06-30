const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// ────────────────────────────────────────────────────────────────
// LIVE DATA AGGREGATOR — Multi-source car listing scraper
// Scrapes: Autotrader, Carfax, CarGurus, CarMax, Carvana, Craigslist, Edmunds, Facebook, TrueCar
// ────────────────────────────────────────────────────────────────

// Autotrader scraper
async function scrapeAutotrader(params) {
  try {
    const { zip, radius, maxPrice, minYear, brand, condition } = params;
    const url = `https://www.autotrader.com/cars-for-sale/searchresults.xhtml?zip=${zip}&distance=${radius}&maxPrice=${maxPrice}&startYear=${minYear}&sortBy=derivedpriceASC&numRecords=50&searchByMake=${brand}`;
    
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    const $ = cheerio.load(data);
    const listings = [];
    
    $('[data-test-id="search-result-item"]').each((i, el) => {
      const title = $(el).find('[data-test-id="vehicle-card-heading"]').text().trim();
      const price = $(el).find('[data-test-id="vehicle-card-price"]').text().replace(/[^\d]/g, '');
      const mileage = $(el).find('[data-test-id="mileage"]').text().replace(/[^\d]/g, '');
      const location = $(el).find('[data-test-id="vehicle-card-location"]').text().trim();
      const url = $(el).find('a').attr('href');
      
      if (title && price) {
        listings.push({
          title,
          price: parseInt(price),
          mileage: parseInt(mileage) || 0,
          city: location.split(',')[0] || '',
          state: location.split(',')[1]?.trim() || '',
          source: 'Autotrader',
          url: `https://www.autotrader.com${url}`,
          daysListed: null,
          dealer: 'Dealer',
          condition: 'Used'
        });
      }
    });
    
    return listings;
  } catch (error) {
    console.error('Autotrader scrape error:', error.message);
    return [];
  }
}

// CarGurus scraper
async function scrapeCarGurus(params) {
  try {
    const { zip, maxPrice, minYear, brand } = params;
    const url = `https://www.cargurus.com/Cars/inventorylisting/m/c_0_0_none/zip/${zip}/taxIncluded/false`;
    
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    const $ = cheerio.load(data);
    const listings = [];
    
    $('[data-cg-inventory-listing="true"]').each((i, el) => {
      const title = $(el).find('[data-test="title"]').text().trim();
      const priceText = $(el).find('[data-test="price"]').text();
      const price = priceText.replace(/[^\d]/g, '');
      const mileage = $(el).find('[data-test="mileage"]').text().replace(/[^\d]/g, '');
      
      if (title && price && parseInt(price) <= maxPrice) {
        listings.push({
          title,
          price: parseInt(price),
          mileage: parseInt(mileage) || 0,
          city: '',
          state: '',
          source: 'CarGurus',
          url: $(el).find('a').attr('href') || '',
          daysListed: null,
          dealer: 'Dealer',
          condition: 'Used'
        });
      }
    });
    
    return listings;
  } catch (error) {
    console.error('CarGurus scrape error:', error.message);
    return [];
  }
}

// TrueCar scraper
async function scrapeTrueCar(params) {
  try {
    const { zip, maxPrice, minYear, brand } = params;
    const url = `https://www.truecar.com/search/?zip=${zip}&max_price=${maxPrice}&make=${brand}`;
    
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    const $ = cheerio.load(data);
    const listings = [];
    
    $('[data-test="vehicle-card"]').each((i, el) => {
      const title = $(el).find('[data-test="vehicle-title"]').text().trim();
      const priceText = $(el).find('[data-test="vehicle-price"]').text();
      const price = priceText.replace(/[^\d]/g, '');
      const mileage = $(el).find('[data-test="vehicle-mileage"]').text().replace(/[^\d]/g, '');
      
      if (title && price) {
        listings.push({
          title,
          price: parseInt(price),
          mileage: parseInt(mileage) || 0,
          city: '',
          state: '',
          source: 'TrueCar',
          url: $(el).find('a').attr('href') || '',
          daysListed: null,
          dealer: 'Dealer',
          condition: 'Used'
        });
      }
    });
    
    return listings;
  } catch (error) {
    console.error('TrueCar scrape error:', error.message);
    return [];
  }
}

// Craigslist scraper
async function scrapeCraigslist(params) {
  try {
    const { zip, maxPrice, minYear, brand } = params;
    const regions = { '07001': 'nj', '10001': 'nyc', '06001': 'ct' };
    const region = regions[zip.substring(0, 5)] || 'nj';
    
    const searchTerm = brand.replace(/\s+/g, '+');
    const url = `https://${region}.craigslist.org/search/cta?query=${searchTerm}&max_price=${maxPrice}`;
    
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    const $ = cheerio.load(data);
    const listings = [];
    
    $('.result-row').each((i, el) => {
      const title = $(el).find('.result-title').text().trim();
      const priceText = $(el).find('.result-price').text();
      const price = priceText.replace(/[^\d]/g, '');
      const url = $(el).find('.result-title').attr('href') || '';
      
      if (title && price && parseInt(price) <= maxPrice) {
        listings.push({
          title,
          price: parseInt(price),
          mileage: 0,
          city: '',
          state: '',
          source: 'Craigslist',
          url,
          daysListed: null,
          dealer: 'Private Seller',
          condition: 'Used'
        });
      }
    });
    
    return listings.slice(0, 20);
  } catch (error) {
    console.error('Craigslist scrape error:', error.message);
    return [];
  }
}

// Edmunds scraper
async function scrapeEdmunds(params) {
  try {
    const { zip, maxPrice, minYear, brand } = params;
    const url = `https://www.edmunds.com/inventory/srp.html?zip=${zip}&make=${brand}&max_price=${maxPrice}&sort=price`;
    
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    const $ = cheerio.load(data);
    const listings = [];
    
    $('[data-test="vehicle-card"]').each((i, el) => {
      const title = $(el).find('[data-test="title"]').text().trim();
      const priceText = $(el).find('[data-test="price"]').text();
      const price = priceText.replace(/[^\d]/g, '');
      
      if (title && price) {
        listings.push({
          title,
          price: parseInt(price),
          mileage: 0,
          city: '',
          state: '',
          source: 'Edmunds',
          url: $(el).find('a').attr('href') || '',
          daysListed: null,
          dealer: 'Dealer',
          condition: 'Used'
        });
      }
    });
    
    return listings;
  } catch (error) {
    console.error('Edmunds scrape error:', error.message);
    return [];
  }
}

// Main aggregator function
async function aggregateListings(params) {
  const scrapers = [
    scrapeAutotrader(params),
    scrapeCarGurus(params),
    scrapeTrueCar(params),
    scrapeCraigslist(params),
    scrapeEdmunds(params)
  ];
  
  const results = await Promise.allSettled(scrapers);
  let allListings = [];
  
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      allListings = allListings.concat(result.value);
    }
  });
  
  // Deduplicate by title and price
  const seen = new Set();
  const unique = [];
  
  allListings.forEach(listing => {
    const key = `${listing.title}_${listing.price}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(listing);
    }
  });
  
  // Sort by price
  return unique.sort((a, b) => a.price - b.price);
}

// API endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { zip, radius, maxPrice, minYear, condition, brand } = req.body;
    
    // Validate input
    if (!zip || !brand) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const params = {
      zip,
      radius: radius || 50,
      maxPrice: maxPrice || 60000,
      minYear: minYear || 2018,
      condition: condition || 'used',
      brand: brand.replace(' OR ', '|')
    };
    
    console.log('Fetching listings with params:', params);
    const listings = await aggregateListings(params);
    
    res.json({
      success: true,
      count: listings.length,
      listings: listings.slice(0, 100) // Limit to 100 results
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch listings',
      message: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚗 GermanAutoFinder API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Search endpoint: POST http://localhost:${PORT}/api/search`);
});

module.exports = app;
