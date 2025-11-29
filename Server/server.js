import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './Routes/userRoutes.js';
import restaurantRoutes from './Routes/restaurantRoutes.js';
import { router as dishRoutes } from './Routes/dishRoutes.js';
import favoriteRoutes from './Routes/favoriteRoutes.js';
import orderRoutes from './Routes/orderRoutes.js';
import paymentRoutes from './Routes/paymentRoutes.js';
import donationRoutes from './Routes/donationRoutes.js';
import customOrderRoutes from './Routes/customOrderRoutes.js';
import * as tableRoutesModule from './Routes/tableRoutes.js';
import * as reservationRoutesModule from './Routes/reservationRoutes.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/custom-orders', customOrderRoutes);
app.use('/api/tables', tableRoutesModule.default);
app.use('/api/reservations', reservationRoutesModule.default);

app.get('/api/test', (req, res) => {
  res.send('Test route works!');
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
