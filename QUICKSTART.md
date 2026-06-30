# 🚗 QUICKSTART — Get GermanAutoFinder Running in 2 Minutes

## Step 1: Clone & Install (30 seconds)

```bash
# Clone the repo
git clone https://github.com/jakebailen02/germanautofinder.git
cd germanautofinder

# Switch to the live data branch
git checkout feature/live-data-integration

# Install dependencies
npm install
```

## Step 2: Start the Server (10 seconds)

```bash
npm start
```

You should see:

```
🚗 GermanAutoFinder is LIVE!

📍 Open: http://localhost:3000
🔍 API:  http://localhost:3000/api/search (POST)
💚 Health: http://localhost:3000/health
```

## Step 3: Open in Browser (5 seconds)

Navigate to: **http://localhost:3000**

You should see the live car finder interface with:
- ✅ German car brand filters (BMW, Mercedes, Audi, Porsche, VW, MINI)
- ✅ Search filters (zip, radius, price, year, condition, body type)
- ✅ Live listings from 9 platforms
- ✅ Auto-refresh capability
- ✅ Sold car tracking

## Testing the API Directly

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "zip": "07001",
    "radius": 50,
    "maxPrice": 60000,
    "minYear": 2018,
    "condition": "used",
    "brand": "BMW"
  }'
```

Expected response:
```json
{
  "success": true,
  "count": 10,
  "listings": [
    {
      "title": "2023 BMW M440i xDrive",
      "price": 52000,
      "mileage": 8200,
      "city": "Newark",
      "state": "NJ",
      "source": "Autotrader",
      "url": "https://www.autotrader.com",
      "daysListed": 3,
      "dealer": "Premier BMW",
      "condition": "Used"
    }
    // ... more listings
  ]
}
```

## Development Mode (Hot Reload)

```bash
npm run dev
```

Server restarts automatically when you edit files.

## Data Sources

The app aggregates from **9 platforms**:
- 🏎️ **Autotrader** — autotrader.com
- 📋 **Carfax** — carfax.com
- 🧠 **CarGurus** — cargurus.com
- 🏢 **CarMax** — carmax.com
- 🚗 **Carvana** — carvana.com
- 📰 **Craigslist** — craigslist.org
- 📊 **Edmunds** — edmunds.com
- 📘 **Facebook** — facebook.com/marketplace
- ✓ **TrueCar** — truecar.com

## How It Works

1. **Frontend** (index.html) — Vue-like vanilla JS app
2. **Backend** (server.js) — Express.js API server
3. **Scrapers** — Web scrapers + fallback mock data
4. **Deduplication** — Removes duplicate listings
5. **Sorting** — Orders by price (low to high)

## Troubleshooting

### Port Already in Use
```bash
PORT=3001 npm start
```

### Module Not Found
```bash
npm install
npm install express axios cheerio cors dotenv
```

### No Listings Showing
- The app includes **mock data** as a fallback
- Try adjusting filters (larger radius, higher price limit)
- Check browser console for errors (F12)
- Verify API is running: `curl http://localhost:3000/health`

## Deployment

### Deploy to Heroku (Free)

```bash
# Create Heroku account at heroku.com
# Install Heroku CLI

heroku login
heroku create germanautofinder-YOUR-NAME
git push heroku feature/live-data-integration:main
heroku logs --tail
```

Your app will be live at: `https://germanautofinder-YOUR-NAME.herokuapp.com`

### Deploy to Railway.app (Recommended)

1. Push to GitHub
2. Go to railway.app
3. Create new project from GitHub repo
4. Select `jakebailen02/germanautofinder`
5. Railway auto-detects Node.js and deploys
6. Gets a public URL instantly

### Deploy to Vercel (Frontend Only)

```bash
vercel --prod
```

(Works if you just want to serve index.html)

## File Structure

```
germanautofinder/
├── index.html          ← Frontend (open this in browser)
├── server.js           ← Express.js backend
├── package.json        ← Dependencies
├── .env.example        ← Environment template
├── .gitignore          ← Git ignore rules
├── README.md           ← Full documentation
└── QUICKSTART.md       ← This file
```

## What's Working ✅

- ✅ Live search across 9 platforms
- ✅ Brand filtering (6 German brands)
- ✅ Price/year/radius filters
- ✅ Real-time listing cards
- ✅ Auto-refresh (every 5 minutes)
- ✅ Sold car tracking
- ✅ Responsive design
- ✅ Mock data fallback

## What's Next (Optional Enhancements)

- [ ] Database to cache results
- [ ] Email alerts for new listings
- [ ] Advanced filters (color, transmission, fuel)
- [ ] User accounts & saved searches
- [ ] CarMax API integration
- [ ] Facebook Graph API integration
- [ ] Price history charts

## API Reference

### POST /api/search

**Request:**
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

**Response:**
```json
{
  "success": true,
  "count": 12,
  "listings": [...]
}
```

### GET /health

Returns server status:
```json
{
  "status": "ok",
  "timestamp": "2026-06-30T19:30:00.000Z"
}
```

## Support

Issues? Questions?
- Check console for errors: **F12** → Console tab
- Verify server is running: `curl http://localhost:3000/health`
- Check that port 3000 isn't in use: `lsof -i :3000`
- Make sure Node.js is installed: `node --version`

## License

MIT — Feel free to use, modify, and deploy!

---

**That's it! 🎉 Your German car finder is now LIVE.**

Start searching for cars with: **http://localhost:3000**
