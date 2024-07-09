const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { format, subDays } = require('date-fns');

const baseURL = 'https://www.eurobank.gr/en/exchange-rates?d=';

async function scrapeExchangeRate(date) {
    const formattedDate = format(date, 'dd/MM/yyyy');
    const url = `${baseURL}${encodeURIComponent(formattedDate)}`;
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const rateElement = $('td:contains("USD")').next('td').next('td').text().replace(',', '.').trim();
        const rate = parseFloat(rateElement);

        if (isNaN(rate)) {
            throw new Error('Failed to parse exchange rate.');
        }

        const timestamp = date.toISOString();
        const record = { timestamp, rate };

        const filePath = path.join(__dirname, '..', 'rates.json');
        let existingData = [];

        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath);
            existingData = JSON.parse(fileData);
        }

        existingData.push(record);
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
        console.log('Exchange rate scraped and saved:', record);
    } catch (error) {
        console.error('Error scraping exchange rate:', error);
    }
}

const delay = time => new Promise(res=>setTimeout(res,time));

async function scrapeLast30Days() {
    const today = new Date();
    for (let i = 84; i >=0; i--) {
        const date = subDays(today, i);
        await scrapeExchangeRate(date);
        await delay(10000);
    }
}

module.exports = { scrapeExchangeRate, scrapeLast30Days };