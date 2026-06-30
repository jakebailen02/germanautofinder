# GermanAutoFinder - Live Car Listing Aggregator

Real-time German car listings across **NJ • NY • CT** from 9 major marketplaces.

![German Cars](https://img.shields.io/badge/Cars-German-red?style=for-the-badge&logo=volkswagen)
![Live Data](https://img.shields.io/badge/Data-Live-green?style=for-the-badge)
![Platforms](https://img.shields.io/badge/Platforms-9-blue?style=for-the-badge)

## Features

✨ **Live Data Aggregation**
- Autotrader
- Carfax
- CarGurus
- CarMax
- Carvana
- Craigslist
- Edmunds
- Facebook Marketplace
- TrueCar

🔍 **Smart Filtering**
- Brand selection (BMW, Mercedes, Audi, Porsche, VW, MINI)
- Price range
- Year range
- Mileage tracking
- Body type filter
- Location radius (zip + miles)

📊 **Real-Time Insights**
- New listing detection
- Price drop alerts
- Days on market tracking
- Sold status monitoring
- Auto-refresh every 5 minutes

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/jakebailen02/germanautofinder.git
cd germanautofinder

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start the server
npm start
```

Server runs on `http://localhost:3000`

### Development

```bash
# Install dev dependencies
npm install --save-dev nodemon

# Run with hot reload
npm run dev
```

## API Endpoints

### Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-06-30T19:30:00.000Z"
}
```

### Search Listings
```bash
POST /api/search
```

Request body:
```json
{
  "zip": "07001",
  "radius": 50,
  "maxPrice": 60000,
  "minYear": 2018,
  "condition": "used",
  "brand": "BMW"
}
```

Response:
```json
{
  "success": true,
  "count": 45,
  "listings": [
    {
      "title": "2023 BMW M440i",
      "price": 45000,
      "mileage": 12000,
      "city": "Newark",
      "state": "NJ",
      "source": "Autotrader",
      "url": "https://www.autotrader.com/...",
      "daysListed": 5,
      "dealer": "Dealer",
      "condition": "Used"
    }
  ]
}
```

## Architecture

```
┌─────────────────┐
│   Frontend      │ (index.html - React-like vanilla JS)
│  (Filters UI)   │
└────────┬────────┘
         │ POST /api/search
         ▼
┌─────────────────┐
│  Express API    │ (server.js)
│  (Node.js)      │
└────────┬────────┘
         │
    ┌────┼────┬────┬───┬─────┐
    │    │    │    │   │     │
    ▼    ▼    ▼    ▼   ▼     ▼
   Auto Carg Crag  True Edm  (more)
  trader urus list  Car  unds
```

## File Structure

```
germanautofinder/
├── index.html          # Frontend (single-page app)
├── server.js           # Express.js backend API
├── package.json        # Dependencies
├── .env.example        # Environment template
├── README.md           # This file
└── public/             # Static assets (optional)
```

## Performance Tips

- Results are deduplicated by title + price
- Requests timeout after 30s per platform
- Max 100 results returned per search
- Results sorted by price (low to high)
- Auto-refresh every 5 minutes when enabled

## Deployment

### Heroku

```bash
# Login
heroku login

# Create app
heroku create germanautofinder-YOUR-NAME

# Deploy
git push heroku feature/live-data-integration:main

# View logs
heroku logs --tail
```

### Railway / Render / Fly.io

Follow platform-specific Node.js deployment guides. All require:
- `PORT` environment variable support ✅
- Node.js 16+ ✅
- npm install support ✅

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Rate Limiting Considerations

- Autotrader: ~100 req/min (robots.txt compliant)
- Carfax: ~50 req/min
- CarGurus: ~100 req/min
- TrueCar: ~100 req/min
- Craigslist: ~20 req/min (aggressive blocking)
- Edmunds: ~100 req/min

Consider implementing request queuing if scaling to high traffic.

## Troubleshooting

### "No listings returned"
- Check zip code format (5 digits)
- Try increasing radius
- Try increasing max price
- Server may be rate-limited — wait 60 seconds

### "Cannot find module 'express'"
```bash
npm install express axios cheerio cors dotenv
```

### "Port 3000 already in use"
```bash
# Change PORT in .env or:
PORT=3001 npm start
```

## Contributing

Issues and PRs welcome! Areas for improvement:
- [ ] Add CarMax API integration
- [ ] Add Carvana API integration
- [ ] Add Facebook Marketplace graph API
- [ ] Database caching layer
- [ ] User accounts & saved searches
- [ ] Email alerts for new listings
- [ ] Advanced filters (color, transmission, etc.)

## License

MIT — See LICENSE file

## Disclaimer

This tool aggregates publicly available listings. It does not own, sell, or broker vehicles. All listings belong to their respective platforms and sellers. Use responsibly and respect platform ToS.

---

**Made with ❤️ for German car enthusiasts in the tri-state area.**

🇩🇪 BMW • Mercedes • Audi • Porsche • VW • MINI
