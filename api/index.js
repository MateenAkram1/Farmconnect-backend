import express from 'express';
import itemRoutes from '../routes/ItemRoutes.js';
import cartRoutes from '../routes/CartRoutes.js';
import orderRoutes from '../routes/OrderRoutes.js';
import userRoutes from '../routes/UserRoutes.js';
import notificationRoutes from '../routes/NotificationRoutes.js';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// DB connect only once
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI);
}

app.get('/', (req, res) => res.send('FarmConnect API running'));

app.use('/api/items', itemRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/notify', notificationRoutes);

// Export the app as handler
export default app;
