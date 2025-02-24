require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { Redis } = require('@upstash/redis');

const app = express();
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const BASE_NEWS_API_URL = 'https://newsdata.io/api/1/latest';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
});

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// **1️⃣ Base Route - General News (Handles country, category, and search query)**
app.get('/', async (req, res) => {
    const { country = 'in', category = 'business', nextPage } = req.query;
    const newsKey = `${country}-${category}-news`;

    try {
        console.log("parsedData")
        // Check if the news data is cached in Redis
        const cachedData = await redis.get(newsKey);
        if (cachedData) {
            // const parsedData = JSON.parse(cachedData);
            if (!nextPage) {
                return res.json(cachedData); // Return cached data if no nextPage
            }
        }

        const params = {
            apikey: NEWS_API_KEY,
            country,
            category
        };

        if (nextPage) params.page = nextPage;

        const response = await axios.get(BASE_NEWS_API_URL, { params });

        if (!response.data.results || response.data.results.length === 0) {
            return res.status(404).json({ error: "No news articles found." });
        }

        // Cache the results for 1 hour (3600 seconds)
        await redis.setex(newsKey, 3600, JSON.stringify({
            results: response.data.results,
            nextPage: response.data.nextPage || null
        }));

        res.json({
            results: response.data.results,
            nextPage: response.data.nextPage || null,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch news for given country, category, or query" });
    }
});

// **2️⃣ Search Route - Based on Query**
app.get('/search/:searchUsing', async (req, res) => {
    const { searchUsing } = req.params;
    const { nextPage } = req.query;
    const newsKey = `${searchUsing}--news`;

    try {
        const params = {
            apikey: NEWS_API_KEY,
            qInTitle: searchUsing,
        };

        if (nextPage) params.page = nextPage;
        
        const response = await axios.get(BASE_NEWS_API_URL, { params });

        if (!response.data.results || response.data.results.length === 0) {
            return res.status(404).json({ error: "No news articles found." });
        }

        res.json({
            results: response.data.results,
            nextPage: response.data.nextPage || null
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch search results' });
    }
});

// **3️⃣ Country-Specific Route**
app.get('/:country', async (req, res) => {
    const { country } = req.params;
    const { category = 'business', nextPage } = req.query;
    const newsKey = `${country}-${category}-news`;

    try {
        // Check if the news data is cached in Redis
        // const cachedData = await redis.get(newsKey);
        // if (cachedData) {
        //     const parsedData = JSON.parse(cachedData);
        //     if (!nextPage) {
        //         return res.json(parsedData); // Return cached data if no nextPage
        //     }
        // }

        const params = {
            apikey: NEWS_API_KEY,
            category,
        };

        if (nextPage) params.page = nextPage;

        const response = await axios.get(BASE_NEWS_API_URL, { params });

        if (!response.data.results || response.data.results.length === 0) {
            return res.status(404).json({ error: "No news articles found." });
        }

        // Cache the results for 1 hour (3600 seconds)
        // await redis.setex(newsKey, 3600, JSON.stringify({
        //     results: response.data.results,
        //     nextPage: response.data.nextPage || null
        // }));

        res.json({
            results: response.data.results,
            nextPage: response.data.nextPage || null
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch country-specific news' });
    }
});

// **4️⃣ Country + Category Route**
app.get('/:country/:category', async (req, res) => {
    const { country, category } = req.params;
    const { nextPage } = req.query;
    const newsKey = `${country}-${category}-news`;

    try {
        // Check if the news data is cached in Redis
        // const cachedData = await redis.get(newsKey);
        // if (cachedData) {
        //     const parsedData = JSON.parse(cachedData);
        //     if (!nextPage) {
        //         return res.json(parsedData); // Return cached data if no nextPage
        //     }
        // }

        const params = {
            apikey: NEWS_API_KEY,
            country,
            category,
        };

        if (nextPage) params.page = nextPage;

        const response = await axios.get(BASE_NEWS_API_URL, { params });

        if (!response.data.results || response.data.results.length === 0) {
            return res.status(404).json({ error: "No news articles found." });
        }

        // Cache the results for 1 hour (3600 seconds)
        // await redis.setex(newsKey, 3600, JSON.stringify({
        //     results: response.data.results,
        //     nextPage: response.data.nextPage || null
        // }));

        res.json({
            results: response.data.results,
            nextPage: response.data.nextPage || null
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch news for given country and category' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});