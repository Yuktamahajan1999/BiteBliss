import { useEffect, useState } from 'react';
import { FiPhoneCall, FiClock, FiShoppingBag, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { FaMotorcycle, FaStar } from 'react-icons/fa';

function FoodOrderPage() {
  const [deliveryStage, setDeliveryStage] = useState(1);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const FREE_DELIVERY_THRESHOLD = 150;


  const GST_RATE = 0.05;

  useEffect(() => {
    const timer = setTimeout(() => {
      setOrder({
        orderId: 'BB20240507',
        restaurant: 'Spice Villa',
        location: 'Connaught Place, Delhi',
        items: [
          { name: 'Paneer Tikka', qty: 2, price: 220 },
          { name: 'Butter Naan', qty: 4, price: 30 },
          { name: 'Gulab Jamun', qty: 2, price: 45 }
        ],
        time: new Date().toLocaleString(),
        payment: 'UPI (Google Pay)',
        deliveryFee: 25,
        deliveryPartner: {
          name: 'Raj Kumar',
          phone: '+91-9876543210',
          vehicleId: 'DL55XY9087',
          image: 'https://randomuser.me/api/portraits/men/32.jpg',
          rating: '4.8 ★'
        }
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!order) return;

    const timer = setTimeout(() => {
      if (deliveryStage < 4) {
        setDeliveryStage(deliveryStage + 1);
      } else {
        setShowRating(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [deliveryStage, order]);


  const calculateTotals = (items, originalDeliveryFee) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const gst = subtotal * GST_RATE;
    const eligibleForFreeDelivery = (subtotal + gst) >= FREE_DELIVERY_THRESHOLD;
    const deliveryFee = eligibleForFreeDelivery ? 0 : originalDeliveryFee;
    const total = subtotal + gst + deliveryFee;
    return { subtotal, gst, deliveryFee, total, eligibleForFreeDelivery };
  };


  const handleRateDelivery = () => {
    alert(`Thank you for rating ${rating} stars!`);
    setShowRating(false);
  };

  const deliveryStatus = [
    { id: 1, status: 'Preparing your food', icon: <FiShoppingBag />, active: deliveryStage >= 1 },
    { id: 2, status: 'Picked up by delivery partner', icon: <FaMotorcycle />, active: deliveryStage >= 2 },
    { id: 3, status: 'On the way to you', icon: <FiTruck />, active: deliveryStage >= 3 },
    { id: 4, status: 'Delivered', icon: <FiCheckCircle />, active: deliveryStage >= 4 }
  ];

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="no-order">
        <h2>No Active Order</h2>
        <p>You don&apos;t have any active food orders right now.</p>
        <button className="browse-btn">Browse Restaurants</button>
      </div>
    );
  }

  const { subtotal, gst, deliveryFee, total, eligibleForFreeDelivery } =
    calculateTotals(order.items, order.deliveryFee);

  return (
    <div className="food-order-app">
      <div className="order-header">
        <h1>Your order ID is: <span className="order-id">{order.orderId}</span></h1>
        <div className={`status-badge ${deliveryStage === 4 ? 'delivered' : 'preparing'}`}>
          {deliveryStage === 4 ? 'Delivered' : 'In Progress'}
        </div>
      </div>

      <div className="order-card">
        <div className="restaurant-info">
          <h2>{order.restaurant}</h2>
          <p className="location">{order.location}</p>
          <p className="order-time">Order placed at: {order.time}</p>
        </div>

        <div className="order-items">
          <h3>Your Order</h3>
          {order.items.map((item, i) => (
            <div key={i} className="item">
              <span className="quantity">{item.qty}x</span>
              <span className="name">{item.name}</span>
              <span className="price">₹{item.price * item.qty}</span>
            </div>
          ))}
        </div>

        <div className="order-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>GST (5%)</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>₹{deliveryFee.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total Amount</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="delivery-tracker">
        <h2>Delivery Updates</h2>
        <div className="delivery-progress">
          {deliveryStatus.map(step => (
            <div key={step.id} className={`step ${step.active ? 'active' : ''}`}>
              <div className="step-icon">{step.icon}</div>
              <div className="step-text">{step.status}</div>
              {step.active && <div className="step-line"></div>}
            </div>
          ))}
        </div>

        {deliveryStage >= 2 && (
          <div className="delivery-partner-card">
            <div className="partner-info">
              <img src={order.deliveryPartner.image} alt="Delivery partner" />
              <div>
                <h4>{order.deliveryPartner.name}</h4>
                <p className="rating">{order.deliveryPartner.rating}</p>
                <p className="vehicle">Vehicle: {order.deliveryPartner.vehicleId}</p>
              </div>
            </div>
            <a href={`tel:${order.deliveryPartner.phone}`} className="call-btn">
              <FiPhoneCall /> Call Partner
            </a>
          </div>
        )}

        {deliveryStage === 2 && (
          <div className="delivery-update">
            <p>Your delivery partner has reached the restaurant and is picking up your order.</p>
          </div>
        )}

        {deliveryStage === 3 && (
          <div className="delivery-update">
            <p>Your delivery partner is on the way with your food!</p>
            <div className="eta">
              <FiClock /> Estimated arrival: 10-15 minutes
            </div>
          </div>
        )}

        {deliveryStage === 4 && !showRating && (
          <div className="delivery-update delivered">
            <p>Your food has been delivered! Enjoy your meal.</p>
            <button className="rate-btn" onClick={() => setShowRating(true)}>
              Rate Delivery Partner
            </button>
          </div>
        )}

        {showRating && (
          <div className="rating-modal">
            <h3>Rate your delivery experience</h3>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
            <div className="rating-actions">
              <button className="submit-rating" onClick={handleRateDelivery}>
                Submit Rating
              </button>
              <button className="skip-rating" onClick={() => setShowRating(false)}>
                Skip
              </button>
            </div>
          </div>
        )}
      </div>

      {!eligibleForFreeDelivery && (
        <div className="free-delivery-promo">
          <p>
            Add ₹{(FREE_DELIVERY_THRESHOLD - (subtotal + gst)).toFixed(2)} more for <strong>FREE DELIVERY</strong>
          </p>
          <button className="add-items-button">Add More Items</button>
        </div>
      )}
    </div>
  );
}

export default FoodOrderPage;