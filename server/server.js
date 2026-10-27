const dns = require('node:dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
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