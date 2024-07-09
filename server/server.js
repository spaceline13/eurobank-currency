const express = require('express');
const fs = require('fs');
const path = require('path');
const { scrapeExchangeRate } = require('../api/rates');
const cron = require('node-cron');

const app = express();
const port = process.env.PORT || 3600;

app.use(express.static(path.join(__dirname, '../public')));

app.get('/rates', (req, res) => {
    const filePath = path.join(__dirname, '../rates.json');
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath);
        res.send(data);
    } else {
        res.status(404).send('No data available');
    }
});

app.get('/api/schedule', async (req, res) => {
    const today = new Date();
    try {
        await scrapeExchangeRate(today);
        res.status(200).send('Daily exchange rate scraped and saved.');
    } catch (error) {
        res.status(500).send('Error scraping exchange rate.');
    }
});

// Schedule the cron job to run at 8 AM every day
cron.schedule('0 8 * * *', () => {
    const today = new Date();
    scrapeExchangeRate(today).then(() => {
        console.log('Daily exchange rate scraped and saved.');
    }).catch(error => {
        console.error('Error scraping exchange rate:', error);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});