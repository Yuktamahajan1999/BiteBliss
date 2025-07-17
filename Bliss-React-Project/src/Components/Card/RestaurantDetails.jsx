/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import SearchIcon from '@mui/icons-material/Search';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import RateReviewIcon from '@mui/icons-material/RateReview';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import InfoIcon from '@mui/icons-material/Info';
import { toast } from 'react-toastify';
import { useUser } from '../UserContext';
import { FaPhone } from 'react-icons/fa';

const RestaurantDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu');
  const [deliveryMode, setDeliveryMode] = useState('delivery');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState({});
  const [isWished, setIsWished] = useState(false);
  const { user } = useUser();
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [deliveryUnavailableReason, setDeliveryUnavailableReason] = useState("");
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [acceptingBookings, setAcceptingBookings] = useState(true);
  const [cart, setCart] = useState({ items: {}, restaurant: null });
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bookingTab, setBookingTab] = useState('pending');
  const [orderTab, setOrderTab] = useState('pending');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [isAboutToClose, setIsAboutToClose] = useState(false);
  const [closingSoonTime, setClosingSoonTime] = useState(null);
  const [nextOpeningTime, setNextOpeningTime] = useState(null);
  const [newReview, setNewReview] = useState({
    rating: 0,
    text: ''
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [cancelModal, setCancelModal] = useState({
    show: false,
    reason: "",
    onConfirm: () => { },
    onCancel: () => { }
  });

  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const parse12HourTime = (timeStr) => {
    if (!timeStr) return { hours: 0, minutes: 0 };

    const [time, period] = timeStr.split(' ');
    const [hoursStr, minutesStr] = time.split(':');

    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr || '0', 10);

    if (period?.toUpperCase() === 'PM' && hours < 12) {
      hours += 12;
    } else if (period?.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }

    return { hours, minutes };
  };
  const updateRestaurantStatus = useCallback((restaurantData) => {
    if (!restaurantData.openHours) return;

    const now = new Date();
    const dayIndex = now.getDay();
    const today = days[dayIndex];
    const todayHours = restaurantData.openHours[today];

    const { hours: openHour, minutes: openMinute } = parse12HourTime(todayHours?.open);
    const { hours: closeHour, minutes: closeMinute } = parse12HourTime(todayHours?.close);

    const openingTime = new Date(now);
    openingTime.setHours(openHour, openMinute, 0, 0);

    const closingTime = new Date(now);
    closingTime.setHours(closeHour, closeMinute, 0, 0);

    let isCurrentlyOpen;
    if (closingTime < openingTime) {
      isCurrentlyOpen = now >= openingTime || now <= closingTime;
    } else {
      isCurrentlyOpen = now >= openingTime && now <= closingTime;
    }

    const timeUntilClose = closingTime - now;
    const isAboutToCloseNow = isCurrentlyOpen && timeUntilClose < 3600000 && timeUntilClose > 0;

    setIsOpen(isCurrentlyOpen);
    setIsAboutToClose(isAboutToCloseNow);
    setClosingSoonTime(todayHours?.close || null);

    if (!isCurrentlyOpen) {
      for (let i = 0; i < 7; i++) {
        const checkDayIndex = (dayIndex + i) % 7;
        const checkDay = days[checkDayIndex];
        const checkHours = restaurantData.openHours[checkDay];

        if (checkHours?.open) {
          const { hours: nextHour, minutes: nextMinute } = parse12HourTime(checkHours.open);
          const nextOpenDate = new Date(now);
          nextOpenDate.setDate(now.getDate() + i);
          nextOpenDate.setHours(nextHour, nextMinute, 0, 0);

          if ((i === 0 && now < nextOpenDate) || i > 0) {
            setNextOpeningTime(nextOpenDate);
            return;
          }
        }
      }
      setNextOpeningTime(null);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (restaurant) {
        updateRestaurantStatus(restaurant);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [restaurant, updateRestaurantStatus]);

  useEffect(() => {
    const fetchDeliveryPartners = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, skipping delivery partners fetch');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/deliverypartner/getAllpartners`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Delivery partners response:', response.data);

        let partners = [];
        if (Array.isArray(response.data)) {
          partners = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          partners = response.data.data;
        } else if (response.data && Array.isArray(response.data.partners)) {
          partners = response.data.partners;
        }

        console.log('Processed partners:', partners);
        setDeliveryPartners(partners);
      } catch (error) {
        console.error("Error fetching delivery partners:", {
          error: error.message,
          response: error.response?.data
        });
        setDeliveryPartners([]);
      }
    };

    fetchDeliveryPartners();
  }, []);
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/order/getByRestaurant?id=${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { populate: 'deliveryPartner,userId,address,payment' }
        }
      );

      const ordersData = Array.isArray(response.data)
        ? response.data
        : (response.data.orders || []);

      const statusPriority = [
        'pending',
        'restaurant_accepted',
        'preparing',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered',
        'cancelled'
      ];

      const sortedOrders = ordersData.sort((a, b) => {
        return statusPriority.indexOf(a.status) - statusPriority.indexOf(b.status);
      });

      setOrders(sortedOrders);

    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    }
  };
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/bookings/getBookingsByRestaurant?id=${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data;
      if (Array.isArray(data)) {
        setBookings(data);
      } else if (Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    }
  };

  useEffect(() => {
    if (id && user?.role === 'restaurantowner') {
      fetchBookings();
      fetchOrders();
    }
  }, [id]);

  useEffect(() => {
    if (user?.role === 'restaurantowner') {
      const interval = setInterval(() => {
        fetchOrders();
        fetchBookings();
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [user?.role, id]);


  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || user?.role !== 'user') {
          setIsWished(false);
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const isInWishlist = response.data.wishlist?.some(item =>
          item._id === id ||
          item.restaurantId === id ||
          item.id === id
        ) || false;

        setIsWished(isInWishlist);
      } catch (error) {
        console.error("Error checking wishlist:", error);
        setIsWished(false);
      }
    };

    checkWishlistStatus();
  }, [id, user]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || user?.role !== 'user') {
          setCart({ items: {}, restaurant: null });
          return;
        }
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/cart/getcart`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { restaurantId: id }
        });
        const itemsObj = (res.data.items || []).reduce((acc, item) => {
          acc[item.name] = item;
          return acc;
        }, {});

        setCart({
          items: itemsObj,
          restaurant: res.data.restaurant || null
        });
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        setCart({ items: {}, restaurant: null });
      }
    };

    fetchCart();
  }, [user, id]);

  useEffect(() => {
    const getRestaurantList = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/restaurant/getRestaurantById?id=${id}`
        );

        const images = [];
        if (res.data.image) images.push(res.data.image);
        if (res.data.photos && Array.isArray(res.data.photos)) {
          images.push(...res.data.photos);
        }

        const menu = res.data.menu || [];

        const restaurantData = {
          ...res.data,
          images: images.length > 0 ? images : ["/default-restaurant.jpg"],
          offers: [
            { text: "No packaging charges" },
            { text: "Price match guarantee" },
            { text: "Frequently reordered" },
            { text: "Special discounts for customers" },
          ],
          deliveryTime: res.data.deliveryTime || res.data.time || "",
          distance: res.data.distance || "",
          fssaiNo: res.data.fssaiNumber || "",
          description: res.data.description || "A premium dining experience with a focus on fresh, locally-sourced ingredients.",
          diningAvailability: res.data.diningAvailability ?? false,
          location: res.data.address || "",
          rating: res.data.rating || 0,
          ratingCount: res.data.ratingCount || 0,
          cuisine: res.data.cuisine || [],
          reviews: res.data.reviews || [],
          menu: menu,
          deliveryAvailable: res.data.deliveryAvailable ?? true,
          deliveryUnavailableReason: res.data.deliveryUnavailableReason || "",
          acceptingOrders: res.data.acceptingOrders ?? true,
          acceptingBookings: res.data.acceptingBookings ?? true,
        };

        setRestaurant(restaurantData);
        updateRestaurantStatus(restaurantData);

        if (menu.length > 0) {
          setSelectedCategory(menu[0].name);
        }
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      } finally {
        setLoading(false);
      }
    };

    getRestaurantList();
  }, [id, updateRestaurantStatus]);
  const formatTime = (time) => {
    let hours, minutes;
    if (typeof time === "string" && time.includes(":")) {
      [hours, minutes] = time.split(":").map(Number);
    } else if (time instanceof Date) {
      hours = time.getHours();
      minutes = time.getMinutes();
    } else {
      return "";
    }

    if (isNaN(hours) || isNaN(minutes)) return "";

    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    const displayMinute = String(minutes).padStart(2, "0");

    return `${displayHour}:${displayMinute} ${period}`;
  };

  const getNextOpeningTime = () => {
    if (!nextOpeningTime || !(nextOpeningTime instanceof Date)) return "soon";

    const now = new Date();
    const isTomorrow = nextOpeningTime.getDate() !== now.getDate();

    return isTomorrow
      ? `tomorrow at ${formatTime(nextOpeningTime)}`
      : `at ${formatTime(nextOpeningTime)}`;
  };


  const toggleWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warn("Please sign in to save favorites", {
        position: "top-center",
        autoClose: 3000,
      });
      navigate("/login");
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role !== 'user') {
      toast.info("Only regular users can save favorites", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      if (isWished) {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/wishlist/removefromwishlist`, {
          ...config,
          data: { restaurantId: id }
        });
        setIsWished(false);
        toast.success("Removed from favorites", {
          position: "top-center",
          autoClose: 2000,
        });
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/wishlist/addtowishlist`,
          { restaurantId: id },
          config
        );
        setIsWished(true);
        toast.success("Added to favorites!", {
          position: "top-center",
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update favorites. Please try again", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };
  const renderFoodTypeIcon = (type) => (
    <img
      src={type === 'veg' ? '/Icons/veg.png' : '/Icons/non veg.png'}
      alt={type}
      style={{
        width: '18px',
        height: '18px',
        marginRight: '8px',
        display: 'block'
      }}
    />
  );

  const canPlaceOrder = () => {
    if (!restaurant) return false;
    if (!isOpen) {
      const nextOpenMsg = getNextOpeningTime();
      toast.error(
        `Sorry, we're currently closed.${nextOpenMsg ? " We'll be back " + nextOpenMsg + "." : ""}`
      );
      return false;
    }

    if (isAboutToClose) {
      toast.warning(`Hurry! We're closing soon at ${formatTime(closingSoonTime)}. Please complete your order quickly.`);
    }

    if (deliveryMode === 'delivery' && !deliveryAvailable) {
      if (deliveryUnavailableReason) {
        toast.error(`Delivery unavailable: ${deliveryUnavailableReason}`);
      } else {
        toast.error("Sorry, no delivery partners available right now. Please try again later.");
      }
      return false;
    }

    if (deliveryMode === 'dining' && !restaurant.diningAvailability) {
      toast.error("Dining is currently unavailable at this restaurant");
      return false;
    }

    if (!acceptingOrders && deliveryMode === 'delivery') {
      toast.error("This restaurant is not currently accepting orders");
      return false;
    }

    if (!acceptingBookings && deliveryMode === 'dining') {
      toast.error("This restaurant is not currently accepting bookings");
      return false;
    }

    return true;
  };

  const addToCart = async (itemName, price, itemId) => {
    if (!canPlaceOrder()) return;

    if (!restaurant) {
      toast.error("Restaurant data not loaded");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to add to cart");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/cart/addtocart`,
        {
          restaurantId: restaurant._id,
          itemName,
          itemId,
          price,
          quantity: 1
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const cartData = response.data;

      const itemsObj = (cartData.items || []).reduce((acc, item) => {
        acc[item.name] = {
          ...item,
          id: item.itemId || item.name
        };
        return acc;
      }, {});

      setCart({
        items: itemsObj,
        restaurant: cartData.restaurant || null
      });

      toast.success(`${itemName} added to cart!`);
    } catch (err) {
      console.error("Add to cart failed:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to add item");
    }
  };

  const handleAddToCart = (item) => {
    const price = Number(item.price);
    if (isNaN(price)) {
      toast.error("Price not available for this item");
      return;
    }
    addToCart(item.name, price);
  };

  const handleRemoveFromCart = (item) => {
    removeFromCart(item.name);
  };

  const removeFromCart = async (itemName) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in to modify cart");
      return;
    }

    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/cart/removefromcart`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: { itemName }
      });

      const cartData = response.data;

      const itemsObj = (cartData.items || []).reduce((acc, item) => {
        acc[item.name] = {
          ...item,
          id: item.itemId || item.name
        };
        return acc;
      }, {});

      setCart({
        items: itemsObj,
        restaurant: cartData.restaurant || null
      });

      toast.success(`${itemName} removed from cart`);
    } catch (err) {
      console.error("Remove from cart failed:", err);
      toast.error(err.response?.data?.message || "Cart update failed");
    }
  };


  const getTotalItems = () => {
    if (!cart?.items) return 0;
    return Object.values(cart.items).reduce((sum, item) => sum + (item?.quantity || 0), 0);
  };

  const getTotalPrice = () => {
    if (!cart?.items) return 0;
    return Object.values(cart.items).reduce(
      (sum, item) => sum + ((item?.price || 0) * (item?.quantity || 0)),
      0
    );
  };
  const handleAcceptBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to manage bookings');
        navigate('/login');
        return;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/bookings/updateBooking?id=${bookingId}`,
        {
          status: 'confirmed',
          respondedBy: user.id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Accept Booking Response:", response.data);

      const updated = response?.data?.booking;
      if (updated && updated.status === 'confirmed') {
        toast.success('Booking confirmed successfully');
        const updatedBookings = bookings.map(booking =>
          booking._id === bookingId ? updated : booking
        );
        setBookings(updatedBookings);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error("Accept Booking Error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      toast.error(error.response?.data?.error || 'Failed to confirm booking');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to manage bookings');
        navigate('/login');
        return;
      }
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/bookings/updateBooking?id=${bookingId}`,
        {
          status: 'cancelled',
          respondedBy: user.id,
          cancellationReason: 'restaurant-request'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Reject Booking Response:", response.data);

      const updated = response?.data?.booking;
      if (updated && updated.status === 'cancelled') {
        toast.success('Booking cancelled successfully');
        const updatedBookings = bookings.map(booking =>
          booking._id === bookingId ? updated : booking
        );
        setBookings(updatedBookings);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error("Reject Booking Error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      toast.error(error.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const handleWaitlistBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to manage bookings');
        navigate('/login');
        return;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/bookings/updateBooking?id=${bookingId}`,
        {
          status: 'waitlisted',
          respondedBy: user.id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = response?.data?.booking;
      if (updated && updated.status === 'waitlisted') {
        toast.success('Booking moved to waitlist');
        const updatedBookings = bookings.map(booking =>
          booking._id === bookingId ? updated : booking
        );
        setBookings(updatedBookings);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error("Waitlist Booking Error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      toast.error(error.response?.data?.error || 'Failed to waitlist booking');
    }
  };
  const orderStatusFlow = {
    pending: ['restaurant_accepted', 'cancelled'],
    restaurant_accepted: ['preparing', 'cancelled'],
    preparing: ['ready_for_pickup', 'cancelled'],
    ready_for_pickup: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered'],
    delivered: [],
    cancelled: []
  };

  const statusDisplayNames = {
    pending: "Pending Approval",
    restaurant_accepted: "Order Accepted",
    preparing: "Preparing",
    ready_for_pickup: "Ready for Pickup",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled"
  };
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      if (!orderId) {
        toast.error('Order ID is required');
        return;
      }

      const validStatuses = ['restaurant_accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'];
      if (!validStatuses.includes(newStatus)) {
        toast.error('Invalid status update');
        return;
      }

      const orderToUpdate = orders.find(order =>
        order._id === orderId || order.orderId === orderId
      );

      if (!orderToUpdate) {
        toast.error('Order not found');
        return;
      }

      const allowedTransitions = {
        pending: ['restaurant_accepted', 'cancelled'],
        restaurant_accepted: ['preparing', 'cancelled'],
        preparing: ['ready_for_pickup', 'cancelled'],
        ready_for_pickup: ['out_for_delivery', 'cancelled'],
        out_for_delivery: ['delivered'],
        delivered: [],
        cancelled: []
      };

      if (!allowedTransitions[orderToUpdate.status]?.includes(newStatus)) {
        toast.error(`Cannot change status from ${orderToUpdate.status} to ${newStatus}`);
        return;
      }

      let updateData = {
        status: newStatus,
        updatedBy: user?.id || 'system'
      };

      if (newStatus === "cancelled") {
        const cancellationReason = await new Promise((resolve) => {
          setCancelModal({
            show: true,
            reason: "",
            onConfirm: (reason) => resolve(reason),
            onCancel: () => resolve(null)
          });
        });

        if (!cancellationReason) return;

        updateData = {
          ...updateData,
          cancellationReason,
          rejectedByOwners: user?.role === 'restaurantowner',
          cancelledAt: new Date()
        };
      }

      if (newStatus === 'out_for_delivery') {
        updateData.deliveryStatus = 'assigned';
      }

      const statusTimestamps = {
        restaurant_accepted: { acceptedAt: new Date() },
        preparing: { startedPreparingAt: new Date() },
        ready_for_pickup: { readyAt: new Date() },
        out_for_delivery: { dispatchedAt: new Date() },
        delivered: { deliveredAt: new Date() }
      };

      if (statusTimestamps[newStatus]) {
        Object.assign(updateData, statusTimestamps[newStatus]);
      }
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/order/updateOrder`,
        updateData,
        {
          params: { id: orderToUpdate._id },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setOrders(prevOrders =>
        prevOrders.map(order =>
          (order._id === orderId || order.orderId === orderId)
            ? response.data.order
            : order
        )
      );

      const statusName = statusDisplayNames[newStatus] || newStatus.replace(/_/g, ' ');
      toast.success(`Order status updated to ${statusName}`);

      if (newStatus === 'ready_for_pickup') {
        const token = localStorage.getItem('token');
        const partnersRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/deliverypartner/getAllpartners`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDeliveryPartners(partnersRes.data.data || []);
      }

    } catch (error) {
      console.error('Status update failed:', error);
      const errorMsg = error.response?.data?.message ||
        error.message ||
        'Failed to update order status';
      toast.error(errorMsg);
    }
  };

  const renderCartButton = (item) => {
    if (deliveryMode === 'dining' || !acceptingOrders) return null;

    if (
      cart.restaurant &&
      cart.restaurant._id &&
      String(cart.restaurant._id) !== String(restaurant._id)
    ) {
      return (
        <button
          className="restaurant-add-btn"
          disabled
          title="Your cart contains items from another restaurant"
        >
          ADD
        </button>
      );
    }

    const quantity = Object.values(cart?.items || {}).find(i => i.name === item.name)?.quantity || 0;

    if (quantity > 0) {
      return (
        <div className="restaurant-quantity-controls">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveFromCart(item);
            }}
            className="restaurant-quantity-btn"
          >
            <RemoveIcon fontSize="small" />
          </button>
          <span style={{ minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(item);
            }}
            className="restaurant-quantity-btn"
          >
            <AddIcon fontSize="small" />
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleAddToCart(item);
        }}
        className="restaurant-add-btn"
        disabled={!isOpen || (deliveryMode === 'delivery' && !deliveryAvailable)}
      >
        ADD
      </button>
    );
  };

  const filteredCategories = (restaurant?.menu ?? []).map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(category => category.items.length > 0);

  const displayCategories = searchQuery
    ? filteredCategories
    : restaurant?.menu?.filter(cat => cat.name === selectedCategory) || [];

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev === restaurant.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? restaurant.images.length - 1 : prev - 1));
  };

  const toggleDescription = (itemName) => {
    setShowFullDescription(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const handleRestaurantInfoClick = () => {
    if (restaurant) {
      navigate(`/restaurantinfo/${restaurant._id}`);
    }
  };

  useEffect(() => {
    return () => {
      if (cart.restaurant && String(cart.restaurant._id) !== String(restaurant?._id)) {
        setCart({ items: {}, restaurant: null });
        localStorage.setItem("cart", JSON.stringify({ items: {}, restaurant: null }));
      }
    };
  }, [cart.restaurant, restaurant?._id]);

  const formatBookingTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.warn("Please login to submit a review");
      navigate('/login');
      return;
    }

    if (!newReview.rating || !newReview.text) {
      toast.warn("Please add both rating and review text");
      return;
    }

    setIsSubmittingReview(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/restaurant/addreview?id=${id}`,
        {
          rating: newReview.rating,
          text: newReview.text
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success("Review submitted successfully!");
      setNewReview({ rating: 0, text: '' });
      const updatedRestaurant = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/restaurant/getRestaurantById?id=${id}`
      );
      setRestaurant(updatedRestaurant.data);

    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.error || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="restaurant-loading-screen">
      <div className="restaurant-spinner"></div>
      <p>Loading restaurant details...</p>
    </div>
  );

  if (!restaurant) return (
    <div className="restaurant-not-found">
      <h2>Restaurant not found</h2>
      <p>We couldn&apos;t find the restaurant you&apos;re looking for.</p>
      <button onClick={() => navigate('/')} className="restaurant-back-home-btn">Back to Home</button>
    </div>
  );

  return (
    <div className='restaurant-details-page'>
      <div className="restaurant-details-header">
        {!restaurant.isOpen && (
          <div className="restaurant-unavailable-banner">
            <InfoIcon className="restaurant-unavailable-icon" />
            <span>
              This restaurant is currently closed.
              {restaurant.closureReason && ` Reason: ${restaurant.closureReason}`}
            </span>
          </div>
        )}
        <button className="restaurant-back-button" onClick={() => navigate(-1)}><ArrowBackIosIcon fontSize="small" /></button>
        <div className="restaurant-search-bar">
          <SearchIcon className="restaurant-search-icon" />
          <input
            type="text"
            placeholder="Search within menu"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="restaurant-header-actions">
          <button
            className={`wishlist-button ${isWished ? 'wishlist-active' : ''}`}
            onClick={(e) => {
              if (user?.role !== 'user') {
                toast.warn("Please log in as a regular user to save favorites", {
                  position: "top-center",
                  autoClose: 3000,
                });
                return;
              }
              toggleWishlist();
            }}
          >
            {isWished ? <FavoriteIcon style={{ color: 'red' }} /> : <FavoriteBorderIcon />}
          </button>
        </div>
      </div>

      {!deliveryAvailable && (
        <div className="restaurant-unavailable-banner">
          <InfoIcon className="restaurant-unavailable-icon" />
          <span>
            Delivery is currently unavailable.
            {deliveryUnavailableReason && ` Reason: ${deliveryUnavailableReason}`}
          </span>
        </div>
      )}

      {!acceptingOrders && (
        <div className="restaurant-unavailable-banner">
          <InfoIcon className="restaurant-unavailable-icon" />
          <span>This restaurant is not currently accepting orders</span>
        </div>
      )}

      <div className="restaurant-delivery-toggle">
        <button
          className={`restaurant-toggle-btn ${deliveryMode === 'delivery' ? 'restaurant-toggle-active' : ''}`}
          onClick={() => setDeliveryMode('delivery')}
          disabled={!deliveryAvailable || !acceptingOrders}
        >
          <span className='delivery-span'>Delivery</span>
          {(!deliveryAvailable || !acceptingOrders) && (
            <span className="restaurant-unavailable-label">Unavailable</span>
          )}
        </button>

        {restaurant.diningAvailability && (
          <button
            className={`restaurant-toggle-btn dining-toggle-btn ${deliveryMode === 'dining' ? 'restaurant-toggle-active' : ''}`}
            onClick={() => setDeliveryMode('dining')}
            disabled={!acceptingBookings}
          >
            <span className='dining-span'>Dining</span>
            {!acceptingBookings && (
              <span className="restaurant-unavailable-label">Unavailable</span>
            )}
          </button>
        )}

        {(deliveryMode === 'dining' && restaurant.diningAvailability && acceptingBookings) && (
          <div className="restaurant-dining-info dining-cta">
            <Link to={`/table-booking/${id}`} className="restaurant-book-table-btn">
              Book a Table
            </Link>
          </div>
        )}
      </div>

      <div className="restaurant-hero-section">
        {restaurant.images.length > 0 && (
          <div className="restaurant-image-gallery">
            <div className="gallery-center-wrapper">
              {restaurant.images.length > 1 && (
                <button className="restaurant-gallery-nav restaurant-gallery-prev" onClick={prevImage}>
                  <ArrowBackIosIcon fontSize="small" />
                </button>
              )}

              {(() => {
                const currentMedia = restaurant.images[currentImageIndex];
                if (typeof currentMedia === "string" &&
                  (currentMedia.endsWith(".mp4") ||
                    currentMedia.endsWith(".webm") ||
                    currentMedia.endsWith(".ogg"))) {
                  return (
                    <video
                      src={currentMedia}
                      className="restaurant-gallery-media"
                      controls
                      autoPlay={false}
                      muted
                      loop
                    />
                  );
                } else {
                  return (
                    <img
                      src={currentMedia}
                      alt={restaurant.name}
                      className="restaurant-gallery-media"
                    />
                  );
                }
              })()}

              {restaurant.images.length > 1 && (
                <button className="restaurant-gallery-nav restaurant-gallery-next" onClick={nextImage}>
                  <ArrowBackIosIcon fontSize="small" className="gallery-next-icon" />
                </button>
              )}
            </div>
            {restaurant.images.length > 1 && (
              <div className="restaurant-gallery-indicator">
                {restaurant.images.map((_, index) => (
                  <span
                    key={index}
                    className={index === currentImageIndex ? "restaurant-indicator-active" : ""}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        {restaurant.images.length > 0 && <div className="restaurant-image-overlay"></div>}
      </div>

      <div className="restaurant-info-section">
        <div onClick={handleRestaurantInfoClick} className="restaurant-info-link">
          <h1>{restaurant.name}<InfoIcon className="restaurant-info-icon" /></h1>
        </div>
        <p className="restaurant-cuisine-type">{(restaurant.cuisine || []).join(", ")}</p>
        <p className="restaurant-location"><LocationOnIcon fontSize="small" /> {restaurant.location}</p>
        <div className="restaurant-rating">
          <div className="restaurant-rating-badge">
            <StarIcon className="restaurant-star-icon" />
            <span>{restaurant.rating}</span>
          </div>
          <span className="restaurant-rating-count">({restaurant.ratingCount} ratings)</span>
        </div>

        <div className="restaurant-status">
          {isOpen ? (
            <>
              <span className={`restaurant-status-badge ${isAboutToClose ? 'closing-soon' : 'open'}`}>
                {isAboutToClose ? `Closes at ${formatTime(closingSoonTime)}` : 'Open Now'}
              </span>
              {isAboutToClose && (
                <span className="restaurant-status-message">
                  Closing soon! Order quickly
                </span>
              )}
            </>
          ) : (
            <>
              <span className="restaurant-status-badge closed">
                Closed
              </span>
              <span className="restaurant-status-message">
                {nextOpeningTime ? `We'll be back ${getNextOpeningTime()}` : 'Closed for now'}
                {restaurant.closureReason && ` - ${restaurant.closureReason}`}
              </span>
            </>
          )}
        </div>
        {deliveryMode === 'delivery' ? (
          <div className="restaurant-delivery-info">
            <span><ScheduleIcon fontSize="small" /> {restaurant.deliveryTime}</span>
            <span>• {restaurant.distance}</span>
            {!deliveryAvailable && (
              <span className="delivery-unavailable-message">
                • {deliveryUnavailableReason || "Delivery unavailable"}
              </span>
            )}
          </div>
        ) : null}
      </div>

      <div className="restaurant-about-section">
        <h3>About {restaurant.name}</h3>
        <p className={`restaurant-description ${showFullDescription['restaurant'] ? 'restaurant-description-expanded' : ''}`}>
          {restaurant.description}
        </p>
        {restaurant.description.length > 150 && (
          <button
            className="restaurant-read-more-btn"
            onClick={() => toggleDescription('restaurant')}
          >
            {showFullDescription['restaurant'] ? 'Read Less' : 'Read More'}
          </button>
        )}
      </div>

      <div className="restaurant-offers-section">
        <div className="restaurant-section-header">
          <LocalOfferIcon className="restaurant-section-icon" />
          <h3>Offers</h3>
        </div>
        <div className="restaurant-offer-tag"><LocalOfferIcon className="restaurant-offer-icon" /><span>Free Delivery</span></div>
        <div className="restaurant-offers-list">
          {restaurant.offers.map((offer, index) => (
            <div key={index} className="restaurant-offer-item">
              <span className="restaurant-offer-icon">{offer.icon}</span>
              <span>{offer.text}</span>
            </div>
          ))}
        </div>
      </div>

      <Link to={'/groupdining'} className='group-link'>
        <div className="restaurant-group-order-banner">
          <div className="restaurant-group-icon-container">
            <GroupIcon className="restaurant-group-icon" />
          </div>
          <div className="restaurant-group-order-info">
            <h4>Start group order</h4>
          </div>
          <button className="restaurant-start-group-btn">Start</button>
        </div>
      </Link>

      <div className="restaurant-tabs-container">
        <div className="restaurant-tabs">
          <button className={`restaurant-tab ${activeTab === 'menu' ? 'restaurant-tab-active' : ''}`} onClick={() => setActiveTab('menu')}>
            <RestaurantIcon className="restaurant-tab-icon" />
            <span>Menu</span>
            <div className="restaurant-tab-indicator"></div>
          </button>
          <button className={`restaurant-tab ${activeTab === 'reviews' ? 'restaurant-tab-active' : ''}`} onClick={() => setActiveTab('reviews')}>
            <RateReviewIcon className="restaurant-tab-icon" />
            <span>Reviews</span>
            <div className="restaurant-tab-indicator"></div>
          </button>
        </div>
      </div>

      {
        activeTab === 'menu' && (
          <div className="restaurant-menu-section">
            <div className="restaurant-menu-columns">
              <div className="restaurant-categories-column">
                {(restaurant.menu || []).map(category => (
                  <div
                    key={category._id || category.name}
                    className={`restaurant-category-item ${selectedCategory === category.name ? 'restaurant-category-active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(category.name);
                      setSearchQuery('');
                    }}
                  >
                    {category.name}
                    {selectedCategory === category.name && (
                      <div className="restaurant-category-indicator"></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="restaurant-items-column">
                {searchQuery && filteredCategories.length === 0 ? (
                  <div className="restaurant-no-results">
                    <SearchIcon className="restaurant-no-results-icon" />
                    <h3>No items found</h3>
                    <p>We couldn&apos;t find any items matching &quot;{searchQuery}&quot;</p>
                    <button
                      className="restaurant-clear-search-btn"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  displayCategories.map(category => (
                    <div
                      key={category._id || category.name}
                      className="restaurant-category-items"
                    >
                      <h3 className="restaurant-category-title">{category.name}</h3>
                      <p className="restaurant-category-description">
                        {category.description || ''}
                      </p>

                      {category.items.map(item => (
                        <div
                          key={item._id || `${category.name}-${item.name}`}
                          className="restaurant-menu-item"
                          onClick={() => toggleDescription(item.name)}
                        >
                          <div className="restaurant-item-details">
                            <div className="restaurant-item-type">
                              {renderFoodTypeIcon(item.type)}
                              <h4 className="restaurant-item-name">{item.name}</h4>
                              {item.highlyReordered && (
                                <div className="restaurant-highlight-tag">Popular</div>
                              )}
                            </div>

                            <p className="restaurant-item-price">
                              ₹{!isNaN(Number(item.price))
                                ? Number(item.price).toFixed(2)
                                : 'Price not available'}
                            </p>

                            <p
                              className={`restaurant-item-description ${showFullDescription[item.name]
                                ? 'restaurant-description-expanded'
                                : ''
                                }`}
                            >
                              {item.description}
                            </p>

                            {item.description && item.description.length > 80 && (
                              <button
                                className="restaurant-read-more-btn restaurant-read-more-small"
                                onClick={e => {
                                  e.stopPropagation();
                                  toggleDescription(item.name);
                                }}
                              >
                                {showFullDescription[item.name] ? 'Read Less' : 'Read More'}
                              </button>
                            )}
                          </div>

                          <div className="restaurant-item-actions">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="restaurant-item-image"
                              />
                            )}
                            {renderCartButton(item)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )
      }

      {
        activeTab === 'reviews' && (
          <div className="restaurant-reviews-section">
            <div className="restaurant-overall-rating">
              <div className="restaurant-rating-circle">
                <StarIcon className="restaurant-big-star" />
                <span>{restaurant.rating?.toFixed(1) || '0.0'}</span>
              </div>
              <p>Based on {restaurant.ratingCount || 0} reviews</p>
            </div>

            {user?.role === 'user' && (
              <div className="restaurant-add-review">
                <h4>Write a Review</h4>
                <div className="restaurant-rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`restaurant-star ${newReview.rating >= star ? 'restaurant-star-filled' : ''}`}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </div>
                <textarea
                  placeholder="Share your experience..."
                  value={newReview.text}
                  onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                  rows={4}
                />
                <button
                  className="restaurant-submit-review-btn"
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview || !newReview.rating || !newReview.text}
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            )}

            <div className="restaurant-review-list">
              {restaurant.reviews?.length > 0 ? (
                restaurant.reviews.map((review) => (
                  <div key={review._id || review.date} className="restaurant-review-item">
                    <div className="restaurant-review-header">
                      <div className="restaurant-reviewer">
                        <div className="restaurant-reviewer-avatar">
                          {review.userName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <span className="restaurant-reviewer-name">
                            {review.userName || 'Anonymous'}
                          </span>
                          <span className="restaurant-review-date">
                            {new Date(review.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="restaurant-review-rating">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`restaurant-small-star ${i < review.rating ? 'restaurant-star-filled' : ''}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="restaurant-review-text">{review.text}</p>
                  </div>
                ))
              ) : (
                <div className="restaurant-no-reviews">
                  <StarIcon className="restaurant-empty-star" />
                  <h4>No reviews yet</h4>
                  <p>Be the first to review this restaurant</p>
                  {!user && (
                    <button
                      className="restaurant-write-review-btn"
                      onClick={() => navigate('/login')}
                    >
                      Login to Review
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      }
      {
        getTotalItems() > 0 &&
        String(cart.restaurant?._id) === String(restaurant._id) && (
          <div className="restaurant-cart-summary">
            <div
              className="restaurant-cart-total"
              onClick={() => navigate('/foodorders', {
                state: {
                  cart: {
                    items: Object.values(cart.items),
                    restaurant: cart.restaurant,
                    deliveryMode: deliveryMode
                  }
                }
              })}
            >
              <span className="restaurant-total-items">
                {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
              </span>
              <span className="restaurant-total-price">
                ₹{getTotalPrice().toFixed(2)}
              </span>
              <span className="restaurant-view-cart">View Cart</span>
            </div>

            <div className="restaurant-cart-buttons">
              <div className="button-row">
                {deliveryMode === 'delivery' && acceptingOrders && (
                  <button
                    className="restaurant-btn"
                    onClick={() => navigate('/foodorders', {
                      state: {
                        cart: {
                          items: Object.values(cart.items),
                          restaurant: cart.restaurant,
                          deliveryMode: deliveryMode
                        }
                      }
                    })}
                  >
                    PROCEED TO CHECKOUT
                  </button>
                )}

                {deliveryMode === 'dining' && acceptingBookings && (
                  <button
                    className="restaurant-btn"
                    onClick={() => navigate('/table-booking-confirmation', {
                      state: {
                        cart: {
                          items: Object.values(cart.items),
                          restaurant: cart.restaurant,
                          deliveryMode: deliveryMode
                        }
                      }
                    })}
                  >
                    PROCEED TO BOOKING
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      }

      <div className="restaurant-footer-section">
        <div className="restaurant-footer-content">
          <div className="restaurant-footer-part">
            <h4>About {restaurant.name}</h4>
            <p>Part of Bite Bliss Plastic-Free Future Program</p>
            <p>FSSAI License No: {restaurant.fssaiNo}</p>
          </div>
          <div className="restaurant-footer-part">
            <h4>Menu Information</h4>
            <p>• Menu items, nutritional information and prices are set directly by the restaurant</p>
            <p>• Nutritional information values displayed are indicative</p>
            <p>• An average active adult requires 2,000 kcal energy per day</p>
          </div>
        </div>
        <div className="restaurant-footer-bottom">
          <p>© 2025 Bite Bliss. All rights reserved.</p>
        </div>
      </div>
      {cancelModal.show && (
        <div className="cancel-reason-modal">
          <div className="modal-overlay" onClick={() => {
            setCancelModal(prev => ({ ...prev, show: false }));
            cancelModal.onCancel();
          }}></div>
          <div className="modal-content">
            <h3 className="modal-title">Enter Cancellation Reason</h3>
            <textarea
              className="reason-textarea"
              placeholder="Please specify the reason for cancellation..."
              value={cancelModal.reason}
              onChange={(e) => setCancelModal(prev => ({ ...prev, reason: e.target.value }))}
              autoFocus
            />
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setCancelModal(prev => ({ ...prev, show: false }));
                  cancelModal.onCancel();
                }}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={() => {
                  cancelModal.onConfirm(cancelModal.reason);
                  setCancelModal(prev => ({ ...prev, show: false, reason: "" }));
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {
        user?.role === 'restaurantowner' && (
          <div className="restaurant-management-section">
            <h3>Restaurant Management</h3>
            {bookings.length > 0 && (
              <div className="management-subsection">
                <h4>Bookings</h4>
                <div className="booking-tabs">
                  {['pending', 'waitlisted', 'confirmed', 'cancelled'].map(status => (
                    <button
                      key={status}
                      className={`booking-tab ${bookingTab === status ? 'active' : ''}`}
                      onClick={() => setBookingTab(status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="booking-list">
                  {bookings
                    .filter(booking =>
                      (booking.status || '').trim().toLowerCase() === bookingTab
                    )
                    .map(booking => (
                      <div key={booking._id} className="booking-item">
                        <div className="booking-header">
                          <h4>Booking #{booking._id.slice(-6)}</h4>
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>

                        <div className="booking-details">
                          <p><strong>Customer:</strong> {booking.fullName}</p>
                          <p><strong>Contact:</strong> {booking.phoneNumber}</p>
                          <p><strong>Email:</strong> {booking.email}</p>
                          <p><strong>Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
                          <p><strong>Time:</strong> {formatBookingTime(booking.bookingTime)}</p>
                          <p><strong>Guests:</strong> {booking.numberOfGuests}</p>
                          {booking.specialRequests && (
                            <p><strong>Special Requests:</strong> {booking.specialRequests}</p>
                          )}
                        </div>

                        {['waitlisted', 'pending'].includes(bookingTab) && (
                          <div className="booking-actions">
                            <button
                              className="accept-btn"
                              onClick={() => handleAcceptBooking(booking._id)}
                            >
                              Confirm
                            </button>
                            <button
                              className="reject-btn"
                              onClick={() => handleRejectBooking(booking._id)}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
            {orders.length > 0 && (
              <div className="management-subsection">
                <h4>Orders</h4>
                <div className="booking-tabs">
                  {['pending', 'restaurant_accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'].map(status => (
                    <button
                      key={status}
                      className={`booking-tab ${orderTab === status ? 'active' : ''}`}
                      onClick={() => setOrderTab(status)}
                    >
                      {statusDisplayNames[status] || status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
                <div className="order-list">
                  {orders
                    .filter(order => order.status === orderTab)
                    .map(order => (
                      <div key={order._id} className="order-item">
                        <div className="order-header">
                          <div className="order-header-left">
                            <h4>Order #{order.orderId?.slice(-6) || order._id?.slice(-6)}</h4>
                            <span className="order-time">
                              {new Date(order.createdAt || order.orderPlacedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <span className={`status-badge ${order.status}`}>
                            {statusDisplayNames[order.status] || order.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                        </div>

                        <div className="order-details">
                          <div className="customer-info">
                            <p><strong>Customer:</strong> {order.userId?.name || 'Unknown'}</p>
                            {order.userId?.phone && (
                              <a href={`tel:${order.userId.phone}`} className="customer-phone">
                                <FaPhone /> {order.userId.phone}
                              </a>
                            )}
                            {order.userId?.email && (
                              <p><strong>Email:</strong> {order.userId.email}</p>
                            )}
                          </div>

                          <div className="order-items-summary">
                            <p><strong>Items ({order.items.length}):</strong></p>
                            <ul>
                              {order.items.map((item, idx) => (
                                <li key={idx}>
                                  <span className="item-name">{item.name} × {item.quantity}</span>
                                  <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="order-meta">
                          <p>
                            <strong>Total:</strong>
                            <span className="total-amount">₹{order.totalAmount?.toFixed(2)}</span>
                          </p>
                          <p>
                            <strong>Payment:</strong>
                            <span className={`payment-status ${order.payment?.status?.toLowerCase()}`}>
                              {order.paymentMethod} ({order.payment?.status || 'Pending'})
                            </span>
                          </p>
                          {order.payment?.transactionId && (
                            <p><strong>Transaction ID:</strong> {order.payment.transactionId}</p>
                          )}
                          <p className="delivery-address">
                            <strong>Delivery Address:</strong>
                            {order.address?.address || 'Not specified'}
                          </p>
                        </div>

                        <div className="order-actions">
                          {order.status === 'pending' && (
                            <div className="action-buttons">
                              <button
                                className="accept-btn"
                                onClick={() => handleUpdateOrderStatus(order._id, 'restaurant_accepted')}
                              >
                                Accept Order
                              </button>
                              <button
                                className="reject-btn"
                                onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {order.status === 'restaurant_accepted' && (
                            <div className="action-buttons">
                              <button
                                className="prepare-btn"
                                onClick={() => handleUpdateOrderStatus(order._id, 'preparing')}
                              >
                                Start Preparing
                              </button>
                              <button
                                className="reject-btn"
                                onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}
                              >
                                Cancel Order
                              </button>
                            </div>
                          )}
                          {order.status === 'preparing' && (
                            <div className="action-buttons">
                              <button
                                className="ready-btn"
                                onClick={() => handleUpdateOrderStatus(order._id, 'ready_for_pickup')}
                              >
                                Mark as Ready
                              </button>
                              <button
                                className="reject-btn"
                                onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}
                              >
                                Cancel Order
                              </button>
                            </div>
                          )}

                          {order.status === 'ready_for_pickup' && (
                            <div className="delivery-status">
                              {order.deliveryPartner ? (
                                <div className="delivery-partner-card">
                                  <div className="partner-header">
                                    <h4>Delivery Partner Assigned</h4>
                                    <span className="partner-status">
                                      {order.deliveryPartner.status || 'On the way to restaurant'}
                                    </span>
                                  </div>
                                  <div className="partner-details">
                                    <div className="partner-info">
                                      <h5>{order.deliveryPartner.name}</h5>
                                      <p className="partner-meta">
                                        <span className="partner-phone">
                                          <FaPhone /> {order.deliveryPartner.phone || 'No phone'}
                                        </span>
                                        {order.deliveryPartner.vehicleId && (
                                          <span className="partner-vehicle">
                                            {order.deliveryPartner.vehicleId}
                                          </span>
                                        )}
                                        {order.deliveryPartner.averageRating && (
                                          <span className="partner-rating">
                                            ★ {order.deliveryPartner.averageRating.toFixed(1)}
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="waiting-for-partner">
                                  <ScheduleIcon className="waiting-icon" />
                                  <p>Order is ready - waiting for delivery partner to accept</p>
                                </div>
                              )}
                            </div>
                          )}

                          {order.status === 'out_for_delivery' && (
                            <div className="delivery-status">
                              <div className="delivery-partner-card">
                                <div className="partner-header">
                                  <h4>Delivery In Progress</h4>
                                  <span className="partner-status">
                                    {order.deliveryPartner?.status === 'picked_up'
                                      ? 'On the way to customer'
                                      : 'Heading to restaurant'}
                                  </span>
                                </div>
                                {order.deliveryPartner && (
                                  <div className="partner-details">
                                    <div className="partner-info">
                                      <h5>{order.deliveryPartner.name}</h5>
                                      <p className="partner-meta">
                                        <span className="partner-phone">
                                          <FaPhone /> {order.deliveryPartner.phone || 'No phone'}
                                        </span>
                                      </p>
                                      <a
                                        href={`tel:${order.deliveryPartner.phone}`}
                                        className="call-btn"
                                        disabled={!order.deliveryPartner.phone}
                                      >
                                        <FaPhone /> Call Partner
                                      </a>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
    </div >
  );
};

export default RestaurantDetails;