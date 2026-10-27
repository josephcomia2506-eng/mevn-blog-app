const dns = require('node:dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const allowedOrigins = [
    process.env.CLIENT_URL,
    'https://client-jiji-4747.vercel.app',
    'https://client-git-main-jiji-4747.vercel.app',
    'https://client-jsqedx7zv-jiji-4747.vercel.app',
    'http://localhost:5173'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Blog Application API is running.'
    });
});

app.use('/users', require('./routes/userRoutes'));
app.use('/posts', require('./routes/postRoutes'));

app.use((req, res) => {
    res.status(404).json({
        message: 'Endpoint not found.'
    });
});

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGODB_STRING)
    .then(() => {
        console.log('Now connected to MongoDB Atlas.');

        app.listen(PORT, () => {
            console.log(`API Server running at port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    });