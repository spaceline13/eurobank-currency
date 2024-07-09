const { scrapeExchangeRate } = require('./rates');

module.exports = async (req, res) => {
    const today = new Date();
    await scrapeExchangeRate(today.setDate(today.getDate() - 1));
    res.status(200).json({ message: 'Daily exchange rate scraped and saved.' });
};