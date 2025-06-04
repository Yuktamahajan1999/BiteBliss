import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Authrouter from './Routes/AuthRoutes.js';
import Bookingrouter from './Routes/BookingRoutes.js'
import OrderRouter from './Routes/Order.js';
import TrainOrderrouter from './Routes/OrderOnTrain.js';
import deliveryrouter from './Routes/DeliveryPartnerRoute.js';
import donationrouter from './Routes/DonationRoutes.js';
import Applicationrouter from './Routes/ApplicationRoutes.js';
import feedbackrouter from './Routes/FeedbackRoutes.js';
import feedbackpagerouter from './Routes/FeedbackPageRoute.js';
import Paymentrouter from './Routes/PaymentRoutes.js';
import Ratingrouter from './Routes/RatingsRoute.js';
import Recipebookrouter from './Routes/RecipeBookRoute.js';
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
const app = express();
dotenv.config();
const PORT = 8000;


app.use(cors());
app.use(express.json());

app.use('/user', Authrouter);
app.use('/application', Applicationrouter)
app.use("/bookings", Bookingrouter);
app.use("/order", OrderRouter)
app.use("/trainorder", TrainOrderrouter)
app.use("/deliverypartner", deliveryrouter)
app.use("/chef",ChefRouter)
app.use("/chefform",chefFormrouter)
app.use("/chefbook",ChefBookrouter)
app.use("/donation", donationrouter)
app.use("/restauranthidden",HiddenRestaurantsrouter)
app.use("/feedback", feedbackrouter)
app.use("/feedbackpage", feedbackpagerouter)
app.use("/payment", Paymentrouter)
app.use("/partnerapp",partnerAppRouter)
app.use("/rating", Ratingrouter)
app.use("/recipebook", Recipebookrouter)
app.use("/recommend",Recommendrouter)
app.use("/restaurant",restaurantRouter)
app.use("/rewards",Rewardrouter)
app.use("/testimonial",testimonialRouter)
app.use("/userprofile",Profilerouter)
app.use("/videos",Videorouter)
app.use("/volunteer",volunteerRouter)
app.use("/wishlist",Wishlistrouter)
app.use("/giftcard",giftcardrouter)


mongoose.connect(process.env.MONGODB_URI)
    .then(() => { console.log('Connected to MongoDB') })
    .catch(err => { console.log(err) })

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});