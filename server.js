require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors')

const app = express();
// Replace with your actual NewsAPI key or use an environment variable
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';

app.use(cors({
    origin: ['https://news-app-client-alpha.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.get('/', async (req, res) => {
    try {
        // Extract query parameters if provided, or use defaults
        const { country = 'us', category = 'general', page = 1, pageSize = 5 } = req.query;

        // Request data from NewsAPI
        const response = await axios.get(NEWS_API_URL, {
        params: {
            country,
            category,
            page,
            pageSize,
            apiKey: NEWS_API_KEY,
        },
        });
        // Return the data from NewsAPI to your frontend
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from NewsAPI:', error.message);
        res.status(500).json({ error: 'Error fetching data from NewsAPI' });
    }
});

module.exports = app;