const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');
const { initDb } = require('./config/supabase');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main API Routes
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'up' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR:', err.stack);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Initialize DB Table
initDb();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (!process.env.RETAIL_AI_API_KEY) {
        console.log('--- RUNNING IN MOCK MODE ---');
    }
});
