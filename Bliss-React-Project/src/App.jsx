import './App.css';
import { io } from 'socket.io-client';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Delivery from './Components/Delivery';
import Dining from './Components/Dining';
import SearchModal from './Components/Header/SearchModal';
import SearchBar from './Components/Header/Search';
import Profile from './Components/Profile-content/Profile';
import Login from './Login-form/Login';
import SignUp from './Login-form/SignUp';
import RestaurantDetails from './Components/Card/RestaurantDetails';
import Feedback from './Components/Profile-content/Feedback';
import ProfileSection from './Components/Profile-content/ProfileSection';
import Rating from './Components/Profile-content/Rating';
import RestaurantInfo from './Components/Card/RestaurantInfo';
import VirtuCook from './Components/Profile-content/VirtuCook';
import TasteBot from './Components/Profile-content/TasteBot';
import RestaurantVideos from './Components/Videos/RestaurantVideos';
import UserVideos from './Components/Videos/UserVideos';
import RecipeBook from './Components/Videos/RecipeBook';
import RecipeOfTheDay from './Components/Videos/RecipeOfTheDay';
import FeedingIndia from './Components/Profile-content/FeedingIndia';
import About from './Components/Profile-content/About';
import TermsOfService from './Components/Profile-content/TermsOfService';
import HelpPage from './Components/Profile-content/Help';
import Settings from './Components/Profile-content/Settings';
import Notifications from './Components/Profile-content/Notification';
import FoodOrders from './Components/Profile-content/FoodOrders';
import TableBooking from './Components/Profile-content/TableBooking';
import PartnerWithUs from './Components/Profile-content/PartnerWithUs';
import CorporateCatering from './Components/Profile-content/CorporateCatering';
import ManageRecommendations from './Components/Profile-content/ManageRecommedation';
import EmployeesPage from './Components/Profile-content/Employee';
import Eatlist from './Components/Profile-content/Eatlist';
import HiddenRestaurants from './Components/Profile-content/HiddenRestaurant';
import Rewards from './Components/Profile-content/Rewards';
import Coupons from './Components/Profile-content/Coupons';
import PaymentPage from './Components/Profile-content/PaymentPage';
import ClaimGiftCard from './Components/Profile-content/Claimgift';
import GiftCardPage from './Components/Profile-content/GiftCard';
import SuggestMood from './Components/TasteBot-Features/SuggestMood';
import RecipeDetail from './Components/TasteBot-Features/RecipeDetail';
import QuickFixMeals from './Components/TasteBot-Features/QuickFixMeals';
import FamousDishes from './Components/TasteBot-Features/FamousDishes';
import AvatarPage from './Components/Profile-content/Avataar';
import LocationPage from './Components/Header/Location';
import ProtectedRoute from './Components/ProtectedRoute';
import ChefForm from './Components/Profile-content/ChefForm';
import { useUser } from './Components/UserContext';
import AllRestaurantsByFood from './Components/Card/AllRestaurants';
import AdminPage from './Components/Profile-content/Adminpage';
import RestaurantProfileForm from './Components/Card/Restaurantprofile';
import DeliveryPartner from './Components/Profile-content/Deliverpartner';
import { useEffect } from 'react';


function App() {
  useEffect(() => {
    if (!window.socket) {
      window.socket = io('http://localhost:8000');
      window.socket.on("connect", () => {
        console.log("User Connected:", window.socket.id);
      });
    }

    return () => {
      if (window.socket) {
        window.socket.disconnect();
        window.socket = null;
      }
    };
  }, []);

  const { user } = useUser();
  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={user ? <Navigate to="/delivery" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/delivery" /> : <SignUp />} />

        <Route path="/" element={
          user ? <Navigate to="/delivery" /> : <Navigate to="/login" />
        } />

        {/* Protected Routes */}
        <Route path="/delivery" element={<ProtectedRoute><Delivery /></ProtectedRoute>} />
        <Route path="/dining" element={<ProtectedRoute><Dining /></ProtectedRoute>} />
        <Route path="/Admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchBar /></ProtectedRoute>} />
        <Route path="/location" element={<ProtectedRoute><LocationPage /></ProtectedRoute>} />
        <Route path="/searchmodal" element={<ProtectedRoute><SearchModal /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/deliverypartner" element={<ProtectedRoute><DeliveryPartner /></ProtectedRoute>} />
        <Route path="/restaurantdetails/:id" element={<ProtectedRoute><RestaurantDetails /></ProtectedRoute>} />
        <Route path="/restaurantinfo/:id" element={<ProtectedRoute><RestaurantInfo /></ProtectedRoute>} />
        <Route path="/allrestaurants" element={<ProtectedRoute><AllRestaurantsByFood /></ProtectedRoute>} />
        <Route path="/restaurant-profile" element={<ProtectedRoute><RestaurantProfileForm editMode={true} /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
        <Route path="/profilesection" element={<ProtectedRoute><ProfileSection /></ProtectedRoute>} />
        <Route path="/profile/rating" element={<ProtectedRoute><Rating /></ProtectedRoute>} />
        <Route path="/avatarpage" element={<ProtectedRoute><AvatarPage /></ProtectedRoute>} />
        <Route path="/virtucook" element={<ProtectedRoute><VirtuCook /></ProtectedRoute>} />
        <Route path="/taste-bot" element={<ProtectedRoute><TasteBot /></ProtectedRoute>} />
        <Route path="/tablebooking/:id" element={<ProtectedRoute><TableBooking /></ProtectedRoute>} />
        <Route path="/restaurantvideos" element={<ProtectedRoute><RestaurantVideos /></ProtectedRoute>} />
        <Route path="/uservideos" element={<ProtectedRoute><UserVideos /></ProtectedRoute>} />
        <Route path="/dayrecipe" element={<ProtectedRoute><RecipeOfTheDay /></ProtectedRoute>} />
        <Route path="/recipebook" element={<ProtectedRoute><RecipeBook /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/suggestmood" element={<ProtectedRoute><SuggestMood /></ProtectedRoute>} />
        <Route path="/recipedetail/:recipeName" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
        <Route path="/quickfixmeals" element={<ProtectedRoute><QuickFixMeals /></ProtectedRoute>} />
        <Route path="/famousdishes" element={<ProtectedRoute><FamousDishes /></ProtectedRoute>} />
        <Route path="/foodorders" element={<ProtectedRoute><FoodOrders /></ProtectedRoute>} />
        <Route path="/helppage" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
        <Route path="/terms-of-service" element={<ProtectedRoute><TermsOfService /></ProtectedRoute>} />
        <Route path="/feedingindia" element={<ProtectedRoute><FeedingIndia /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/partner" element={<ProtectedRoute><PartnerWithUs /></ProtectedRoute>} />
        <Route path="/managerecommedations" element={<ProtectedRoute><ManageRecommendations /></ProtectedRoute>} />
        <Route path="/corporatecatering" element={<ProtectedRoute><CorporateCatering /></ProtectedRoute>} />
        <Route path="/chefform" element={<ProtectedRoute><ChefForm /></ProtectedRoute>} />
        <Route path="/settings/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/employeespage" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />
        <Route path="/eatlist" element={<ProtectedRoute><Eatlist /></ProtectedRoute>} />
        <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
        <Route path="/coupons" element={<ProtectedRoute><Coupons /></ProtectedRoute>} />
        <Route path="/claim-gift-card" element={<ProtectedRoute><ClaimGiftCard /></ProtectedRoute>} />
        <Route path="/buy-gift-card" element={<ProtectedRoute><GiftCardPage /></ProtectedRoute>} />
        <Route path="/paymentpage" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/hiddenrestaurant" element={<ProtectedRoute><HiddenRestaurants /></ProtectedRoute>} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;
