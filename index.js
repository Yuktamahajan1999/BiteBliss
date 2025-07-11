import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import Authrouter from './Routes/AuthRoutes.js';
import Bookingrouter from './Routes/BookingRoutes.js';
import getOrderRouter from './Routes/Order.js';
import TrainOrderrouter from './Routes/OrderOnTrain.js';
import deliveryrouter from './Routes/DeliveryPartnerRoute.js';
import donationrouter from './Routes/DonationRoutes.js';
import Applicationrouter from './Routes/ApplicationRoutes.js';
import feedbackpagerouter from './Routes/FeedbackPageRoute.js';
import Paymentrouter from './Routes/PaymentRoutes.js';
import Ratingrouter from './Routes/RatingsRoute.js';
import Reciperouter from './Routes/RecipeBookRoute.js';
import Recommendrouter from './Routes/RecommedationRoute.js';
import HiddenRestaurantsrouter from './Routes/RestaurantHiddenRoute.js';
import restaurantRouter from './Routes/RestaurantRoute.js';
import Rewardrouter from './Routes/RewardsRoutes.js';
import testimonialRouter from './Routes/Testimonial.js';
import Profilerouter from './Routes/UserProfileRoute.js';
import Videorouter from './Routes/VideosRoutes.js';
import volunteerRouter from './Routes/Volunteer.js';
import Wishlistrouter from './Routes/WishlistRoute.js';
import partnerAppRouter from './Routes/PartnerAppRoutes.js';
import ChefRouter from './Routes/CateringRoutes.js';
import giftcardrouter from './Routes/GiftCardRoute.js';
import chefFormrouter from './Routes/ChefformRoutes.js';
import ChefBookrouter from './Routes/chefBookRoutes.js';
import notificationRouter from './Routes/NotificationRoute.js';
import Cartrouter from './Routes/CartRoutes.js';
import Dishrouter from './Routes/FamousDishRoute.js';
import couponRouter from './Routes/CouponRoute.js';
import addressRouter from './Routes/AddressRoute.js';
import QuickFixMealsRouter from './Routes/QuickFixMeal.js';
import SuggestMoodRouter from './Routes/SuggestMoodRoute.js';
import groupRouter from './Routes/GroupOrderRoute.js';
import { handleChat } from './Controllers/ChatController.js';
import chatRouter from './Routes/ChatRouter.js';


dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
    ],
    credentials: true,
  }
});
app.set("io", io);

const PORT = 8000;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
  ],
  credentials: true,
}));
app.use(express.json());

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  handleChat(socket, io);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.use('/user', Authrouter);
app.use('/address', addressRouter);
app.use('/application', Applicationrouter);
app.use('/bookings', Bookingrouter);
app.use('/order', getOrderRouter);
app.use('/trainorder', TrainOrderrouter);
app.use('/deliverypartner', deliveryrouter);
app.use('/chef', ChefRouter);
app.use('/dish', Dishrouter);
app.use('/chat',chatRouter)
app.use('/fixmeal', QuickFixMealsRouter);
app.use('/suggestmood', SuggestMoodRouter);
app.use('/coupons', couponRouter);
app.use('/cart', Cartrouter);
app.use('/chefform', chefFormrouter);
app.use('/chefbook', ChefBookrouter);
app.use('/donation', donationrouter);
app.use('/grouporder', groupRouter)
app.use('/restauranthidden', HiddenRestaurantsrouter);
app.use('/feedbackpage', feedbackpagerouter);
app.use('/payment', Paymentrouter);
app.use('/partnerapp', partnerAppRouter);
app.use('/rating', Ratingrouter);
app.use('/recipebook', Reciperouter);
app.use('/recommend', Recommendrouter);
app.use('/restaurant', restaurantRouter);
app.use('/rewards', Rewardrouter);
app.use('/testimonial', testimonialRouter);
app.use('/userprofile', Profilerouter);
app.use('/videos', Videorouter);
app.use('/volunteer', volunteerRouter);
app.use('/wishlist', Wishlistrouter);
app.use('/giftcard', giftcardrouter);
app.use('/notification', notificationRouter);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => { console.log('Connected to MongoDB'); })
  .catch(err => { console.error('MongoDB connection error:', err); });

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} with Socket.IO`);
});