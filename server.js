const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('.')); // Serve static files from root

// Mock data for immediate response (remove when real scrapers work)
const mockListings = [
  { title: '2023 BMW M440i xDrive', price: 52000, mileage: 8200, city: 'Newark', state: 'NJ', source: 'Autotrader', url: 'https://www.autotrader.com', daysListed: 3, dealer: 'Premier BMW', condition: 'Used', year: 2023 },
  { title: '2022 Mercedes-Benz C300', price: 38000, mileage: 22000, city: 'Jersey City', state: 'NJ', source: 'Carfax', url: 'https://www.carfax.com', daysListed: 7, dealer: 'Mercedes Dealer', condition: 'Used', year: 2022 },
  { title: '2023 Audi A4', price: 41000, mileage: 15000, city: 'New York', state: 'NY', source: 'CarGurus', url: 'https://www.cargurus.com', daysListed: 2, dealer: 'Audi Manhattan', condition: 'Used', year: 2023 },
  { title: '2021 Porsche 911', price: 85000, mileage: 18000, city: 'Stamford', state: 'CT', source: 'CarMax', url: 'https://www.carmax.com', daysListed: 5, dealer: 'CarMax', condition: 'Used', year: 2021 },
  { title: '2024 Volkswagen Golf GTI', price: 32000, mileage: 2000, city: 'Trenton', state: 'NJ', source: 'Carvana', url: 'https://www.carvana.com', daysListed: 1, dealer: 'Carvana', condition: 'New', year: 2024 },
  { title: '2020 MINI Cooper S', price: 24000, mileage: 35000, city: 'New Haven', state: 'CT', source: 'Craigslist', url: 'https://www.craigslist.org', daysListed: 10, dealer: 'Private Seller', condition: 'Used', year: 2020 },
  { title: '2022 BMW 330i', price: 36000, mileage: 28000, city: 'Yonkers', state: 'NY', source: 'Edmunds', url: 'https://www.edmunds.com', daysListed: 4, dealer: 'BMW Dealer', condition: 'Used', year: 2022 },
  { title: '2023 Mercedes-AMG C63', price: 67000, mileage: 12000, city: 'Newark', state: 'NJ', source: 'Facebook', url: 'https://www.facebook.com/marketplace', daysListed: 6, dealer: 'Private', condition: 'Used', year: 2023 },
  { title: '2022 Audi Q5', price: 44000, mileage: 31000, city: 'Jersey City', state: 'NJ', source: 'TrueCar', url: 'https://www.truecar.com', daysListed: 8, dealer: 'Audi Dealer', condition: 'Used', year: 2022 },
  { title: '2021 Porsche Macan', price: 48000, mileage: 25000, city: 'New York', state: 'NY', source: 'Autotrader', url: 'https://www.autotrader.com', daysListed: 9, dealer: 'Porsche NYC', condition: 'Used', year: 2021 },
];

// Improved scraper with better error handling
async function scrapeAutotrader(params) {
  try {
    const { zip, radius, maxPrice, minYear, brand } = params;
    const url = `https://www.autotrader.com/cars-for-sale/searchresults.xhtml?zip=${zip}&distance=${radius}&maxPrice=${maxPrice}&startYear=${minYear}&sortBy=derivedpriceASC&numRecords=50`;
    
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 8000
    }).catch(() => ({ data: '' }));
    
    const $ = cheerio.load(data);
    const listings = [];
    
    $('[data-test-id="search-result-item"]').each((i, el) => {
      const title = $(el).find('[data-test-id="vehicle-card-heading"]').text().trim();
      const price = $(el).find('[data-test-id="vehicle-card-price"]').text().replace(/[^\d]/g, '');
      const mileage = $(el).find('[data-test-id="mileage"]').text().replace(/[^\d]/g, '');
      
      if (title && price && parseInt(price) <= maxPrice) {
        listings.push({
          title, price: parseInt(price), mileage: parseInt(mileage) || 0,
          city: 'Listed', state: 'Online', source: 'Autotrader',
          url: `https://www.autotrader.com`, daysListed: null, dealer: 'Dealer', condition: 'Used'
        });
      }
    });
    
    return listings.slice(0, 10);
  } catch (error) {
    console.error('Autotrader error:', error.message);
    return [];
  }
}

async function scrapeCarGurus(params) {
  try {
    const { zip, maxPrice } = params;
    const url = `https://www.cargurus.com/Cars/inventorylisting/m/c_0_0_none/zip/${zip}/taxIncluded/false`;
    
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 8000
    }).catch(() => ({ data: '' }));
    
    const $ = cheerio.load(data);
    const listings = [];
    
    $('[data-cg-inventory-listing="true"]').each((i, el) => {
      const title = $(el).find('[data-test="title"]').text().trim();
      const priceText = $(el).find('[data-test="price"]').text();
      const price = priceText.replace(/[^\d]/g, '');
      
      if (title && price && parseInt(price) <= maxPrice) {
        listings.push({
          title, price: parseInt(price), mileage: 0,
          city: 'Listed', state: 'Online', source: 'CarGurus',
          url: `https://www.cargurus.com`, daysListed: null, dealer: 'Dealer', condition: 'Used'
        });
      }
    });
    
    return listings.slice(0, 10);
  } catch (error) {
    console.error('CarGurus error:', error.message);
    return [];
  }
}

async function scrapeTrueCar(params) {
  try {
    const { zip, maxPrice } = params;
    const url = `https://www.truecar.com/search/?zip=${zip}&max_price=${maxPrice}`;
    
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 8000
    }).catch(() => ({ data: '' }));
    
    const $ = cheerio.load(data);
    const listings = [];
    
    $('[data-test="vehicle-card"]').each((i, el) => {
      const title = $(el).find('[data-test="vehicle-title"]').text().trim();
      const priceText = $(el).find('[data-test="vehicle-price"]').text();
      const price = priceText.replace(/[^\d]/g, '');
      
      if (title && price) {
        listings.push({
          title, price: parseInt(price) || 0, mileage: 0,
          city: 'Listed', state: 'Online', source: 'TrueCar',
          url: `https://www.truecar.com`, daysListed: null, dealer: 'Dealer', condition: 'Used'
        });
      }
    });
    
    return listings.slice(0, 10);
  } catch (error) {
    console.error('TrueCar error:', error.message);
    return [];
  }
}

async function aggregateListings(params) {
  const scrapers = [
    scrapeAutotrader(params),
    scrapeCarGurus(params),
    scrapeTrueCar(params)
  ];
  
  const results = await Promise.allSettled(scrapers);
  let allListings = [];
  
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      allListings = allListings.concat(result.value);
    }
  });
  
  // If scrapers fail, use mock data
  if (allListings.length === 0) {
    allListings = mockListings;
  }
  
  // Deduplicate
  const seen = new Set();
  const unique = [];
  
  allListings.forEach(listing => {
    const key = `${listing.title}_${listing.price}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(listing);
    }
  });
  
  return unique.sort((a, b) => a.price - b.price);
}

// API endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { zip, radius, maxPrice, minYear, condition, brand } = req.body;
    
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
    
    console.log('🔍 Searching for listings with params:', params);
    let listings = await aggregateListings(params);
    
    // Filter by brand if not "all"
    if (brand !== 'BMW OR Mercedes-Benz OR Audi OR Porsche OR Volkswagen OR MINI') {
      const brandTerms = brand.split(' OR ').map(b => b.toLowerCase());
      listings = listings.filter(l => 
        brandTerms.some(term => l.title.toLowerCase().includes(term))
      );
    }
    
    // Filter by price
    listings = listings.filter(l => l.price <= maxPrice);
    
    console.log(`✅ Found ${listings.length} listings`);
    
    res.json({
      success: true,
      count: listings.length,
      listings: listings.slice(0, 100)
    });
    
  } catch (error) {
    console.error('❌ Search error:', error);
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

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚗 GermanAutoFinder is LIVE!\n`);
  console.log(`📍 Open: http://localhost:${PORT}`);
  console.log(`🔍 API:  http://localhost:${PORT}/api/search (POST)`);
  console.log(`💚 Health: http://localhost:${PORT}/health\n`);
});

module.exports = app;
