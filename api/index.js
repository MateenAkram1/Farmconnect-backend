const { createServer } = require('@vercel/node');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const itemRoutes = require('../routes/ItemRoutes');
const cartRoutes = require('../routes/CartRoutes');
const orderRoutes = require('../routes/OrderRoutes');
const userRoutes = require('../routes/UserRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send(`
    <h1>🌿 FarmConnect API</h1>
    <p>Welcome to the FarmConnect backend API.</p>
    <p>Available endpoints:</p>
    <ul>
      <li>GET /api/items</li>
      <li>POST /api/user</li>
      <li>POST /api/cart</li>
      <li>POST /api/orders</li>
    </ul>
    <p>API is live and running successfully 🚀</p>
  `);
});

app.use('/api/items', itemRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);

module.exports = app;
