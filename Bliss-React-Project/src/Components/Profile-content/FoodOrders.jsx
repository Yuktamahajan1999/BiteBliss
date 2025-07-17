/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import { useUser } from '../UserContext';
import { toast } from 'react-toastify';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaClock,
  FaCheckCircle,
  FaUtensils,
  FaBoxOpen,
  FaStore,
  FaMotorcycle,
  FaHome,
  FaStar,
  FaPhone,
  FaMapMarkerAlt,
  FaShoppingBag,
  FaPercent,
  FaTruck,
  FaUserAlt,
  FaTrain,
  FaTimes,
  FaTimesCircle
} from 'react-icons/fa';

const stageDurations = {
  1: 300000, // 5 minutes for pending
  2: 1200000, // 20 minutes for restaurant_accepted
  3: 300000, // 5 minutes for preparing
  4: 300000, // 5 minutes for ready_for_pickup
  5: 600000, // 10 minutes for out_for_delivery
  6: 120000 // 2 minutes for delivered
};

const deliveryStatus = [
  { id: 1, status: 'pending', displayStatus: 'Pending approval', icon: <FaClock /> },
  { id: 2, status: 'restaurant_accepted', displayStatus: 'Order Accepted', icon: <FaCheckCircle /> },
  { id: 3, status: 'preparing', displayStatus: 'Restaurant is preparing your order', icon: <FaUtensils /> },
  { id: 4, status: 'ready_for_pickup', displayStatus: 'Order is ready to be picked up', icon: <FaBoxOpen /> },
  { id: 5, status: 'out_for_delivery', displayStatus: 'Out for delivery', icon: <FaMotorcycle /> },
  { id: 6, status: 'delivered', displayStatus: 'Delivered', icon: <FaHome /> },
  { id: 0, status: 'cancelled', displayStatus: 'Order Cancelled', icon: <FaTimes /> }
];

const deliveryStatusMap = {
  unassigned: 'Waiting for partner',
  assigned: '',
  picked_up: 'Picked up - on the way to you',
  arrived: 'Arrived at your location',
  delivered: 'Delivered'
};

function FoodOrderPage() {
  const { cart: contextCart, clearCart } = useUser();
  const [deliveryStage, setDeliveryStage] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [cart, setCart] = useState(
    location.state?.cart ||
    contextCart ||
    { items: [], restaurant: null }
  );
  const [userAddress, setUserAddress] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showCoupons, setShowCoupons] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [showRewards, setShowRewards] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const ORDER_TYPES = {
    NORMAL: 'normal',
    TRAIN: 'train',
    GROUP: 'group'
  };

  const navigate = useNavigate();
  const orderRef = useRef(null);

  const FREE_DELIVERY_THRESHOLD = 150;
  const GST_RATE = 0.05;

  const fetchUserAddress = async () => {
    try {
      setAddressLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await axios.get('http://localhost:8000/address/getAddress', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.length > 0) {
        setUserAddress(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch user address:", err);
      if (err.response?.status === 401) {
        // Redirect to login or show error message
      }
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAddress();
  }, []);

  useEffect(() => {
    let intervalId = null;

    const fetchOrderData = async () => {
      try {
        const savedOrderRaw = localStorage.getItem("currentOrder");
        const parsedOrder = savedOrderRaw ? JSON.parse(savedOrderRaw) : null;

        if (!parsedOrder?.orderId) {
          return;
        }

        const response = await axios.get('http://localhost:8000/order/getOrderById', {
          params: { id: parsedOrder._id },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
        });

        if (!response.data || typeof response.data !== 'object') {
          throw new Error("Invalid API response structure");
        }

        const responseData = response.data.data || response.data;

        if (!responseData || typeof responseData !== 'object') {
          throw new Error("Order data not found in response");
        }

        const status = String(responseData.status || 'pending').toLowerCase().trim();

        if (status === 'cancelled') {
          const cancelledOrder = {
            items: Array.isArray(responseData.items) ? responseData.items : [],
            status: 'cancelled',
            cancellationReason: responseData.cancellationReason || 'No reason provided',
            restaurantName: responseData.restaurantName || responseData.restaurant?.name || 'Unknown Restaurant',
            restaurantLocation: responseData.restaurantLocation || responseData.restaurant?.location || '',
            totalAmount: Number(responseData.totalAmount) || 0,
            deliveryFee: Number(responseData.deliveryFee) || 0,
            deliveryStage: 0,
            deliveryPartner: null
          };

          setOrder(cancelledOrder);
          setDeliveryStage(0);
          orderRef.current = cancelledOrder;
          clearInterval(intervalId);
          return;
        }

        let deliveryPartner = null;
        const statusStageMap = {
          pending: 1,
          restaurant_accepted: 2,
          preparing: 3,
          ready_for_pickup: 4,
          out_for_delivery: 5,
          delivered: 6,
          cancelled: 0
        };

        const stage = statusStageMap[status] || 1;

        if (stage >= 4 && responseData.deliveryPartner) {
          try {
            const partnerId = typeof responseData.deliveryPartner === 'object'
              ? responseData.deliveryPartner._id
              : responseData.deliveryPartner;
            const partnerResponse = await axios.get(
              'http://localhost:8000/deliverypartner/getdeliveryPartner',
              {
                params: { id: partnerId },
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }
              }
            );
            deliveryPartner = partnerResponse.data.data || partnerResponse.data;
          } catch (partnerError) {
            console.error("Failed to fetch partner:", partnerError);
            deliveryPartner = {
              name: 'Delivery Partner',
              phone: null,
              vehicleId: null,
              averageRating: null,
              ratings: []
            };
          }
        }

        const processedOrder = {
          ...responseData,
          items: Array.isArray(responseData.items) ? responseData.items : [],
          restaurantName: responseData.restaurantName || responseData.restaurant?.name || 'Unknown Restaurant',
          restaurantLocation: responseData.restaurantLocation || responseData.restaurant?.location || '',
          totalAmount: Number(responseData.totalAmount) || 0,
          deliveryFee: Number(responseData.deliveryFee) || 0,
          status: status,
          deliveryStage: stage,
          deliveryPartner: deliveryPartner,
          paymentMethod: responseData.paymentMethod || 'online',
          address: responseData.address,
          deliveryStatus: responseData.deliveryStatus || 'unassigned'
        };

        setOrder(processedOrder);
        setDeliveryStage(stage);
        orderRef.current = processedOrder;

        if (stage === 6 || stage === 0) {
          clearInterval(intervalId);
        }

      } catch (error) {
        console.error("Order fetch error:", error);
        toast.error(error.message || "Failed to load order details");
      }
    };

    if (!cart?.items || (Array.isArray(cart.items) && cart.items.length === 0)) {
      fetchOrderData();
      intervalId = setInterval(fetchOrderData, 60000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [cart?.items]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/coupons/allCoupons', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCoupons(response.data);
      } catch (error) {
        console.error("Error fetching coupons:", error);
        toast.error("Failed to load coupons");
      }
    };

    fetchCoupons();
  }, []);

  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const pointsRes = await axios.get('http://localhost:8000/rewards/userpoints', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUserPoints(pointsRes.data.points);
      } catch (error) {
        console.error("Error fetching user points:", error);
      }
    };

    fetchUserPoints();
  }, []);

  const calculateTotals = (items, originalDeliveryFee) => {
    const itemsArray = Array.isArray(items) ? items : Object.values(items || {});
    const subtotal = itemsArray.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

    if (appliedCoupon && subtotal < 300) {
      toast.error("Coupons require minimum order of ₹300");
      setAppliedCoupon(null);
      const gst = subtotal * GST_RATE;
      const total = subtotal + gst + originalDeliveryFee;
      return {
        summary: [
          { label: 'Subtotal', value: `₹${subtotal.toFixed(2)}` },
          { label: 'GST (5%)', value: `₹${gst.toFixed(2)}` },
          { label: 'Delivery Fee', value: `₹${originalDeliveryFee.toFixed(2)}` },
          { label: 'Total', value: `₹${total.toFixed(2)}`, isTotal: true }
        ],
        isFreeDelivery: false,
        subtotal,
        gst,
        deliveryFee: originalDeliveryFee,
        total
      };
    }

    const gst = subtotal * GST_RATE;
    const eligibleForFreeDelivery = subtotal + gst >= FREE_DELIVERY_THRESHOLD;
    let deliveryFee = eligibleForFreeDelivery ? 0 : originalDeliveryFee;
    let couponDiscount = 0;

    if (appliedCoupon?.code === 'FLAT20') {
      couponDiscount = subtotal * 0.2;
    } else if (appliedCoupon?.code === 'DELIVERYFREE') {
      deliveryFee = 0;
    }

    const rewardDiscount = Math.min(userPoints / 10, subtotal * 0.5);
    const total = Math.max(0, subtotal + gst + deliveryFee - couponDiscount - rewardDiscount);

    const summary = [
      { label: 'Subtotal', value: `₹${subtotal.toFixed(2)}` },
      { label: 'GST (5%)', value: `₹${gst.toFixed(2)}` },
      { label: 'Delivery Fee', value: `₹${deliveryFee.toFixed(2)}` },
    ];

    if (eligibleForFreeDelivery && deliveryFee === 0) {
      summary.push({ label: 'Delivery Discount', value: `-₹${originalDeliveryFee.toFixed(2)}` });
    }
    if (couponDiscount > 0) {
      summary.push({ label: `Coupon Discount (${appliedCoupon?.code})`, value: `-₹${couponDiscount.toFixed(2)}` });
    }
    if (rewardDiscount > 0) {
      summary.push({ label: 'Reward Points Discount', value: `-₹${rewardDiscount.toFixed(2)}` });
    }

    summary.push({ label: 'Total', value: `₹${total.toFixed(2)}`, isTotal: true });

    return {
      summary,
      isFreeDelivery: eligibleForFreeDelivery,
      subtotal,
      gst,
      deliveryFee,
      total
    };
  };

  const handleApplyCoupon = async (coupon) => {
    const itemsArray = Array.isArray(cart.items) ? cart.items : Object.values(cart.items || {});
    const subtotal = itemsArray.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

    try {
      await axios.post(
        'http://localhost:8000/coupons/applyCoupon',
        { code: coupon.code, orderAmount: subtotal },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setAppliedCoupon(coupon);
      toast.success(`Coupon "${coupon.code}" applied successfully!`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to apply coupon');
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await axios.delete('http://localhost:8000/coupons/removeCoupon', {
        data: { code: appliedCoupon.code },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setAppliedCoupon(null);
      toast.success('Coupon removed successfully');
    } catch (error) {
      toast.error('Failed to remove coupon');
    }
  };

  const handleRedeemReward = async (reward) => {
    try {
      await axios.post(
        'http://localhost:8000/rewards/redeemedReward',
        { rewardTitle: reward.title },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      toast.success(`Reward redeemed: ${reward.title}`);
      setShowRewards(false);
      const pointsRes = await axios.get('http://localhost:8000/rewards/userpoints', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUserPoints(pointsRes.data.points);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to redeem reward');
    }
  };
  const clearOrder = () => {
    setOrder(null);
    setDeliveryStage(0);
    setRating(0);
    setFeedback('');
    setShowRating(false);
    clearCart();
    localStorage.removeItem('currentOrder');
    navigate('/delivery');
  };

  const handleSubmitRating = async () => {
    try {
      if (!order?._id || rating === 0) {
        toast.error('Please select a rating');
        return;
      }

      await axios.post('http://localhost:8000/deliverypartner/rate', {
        orderId: order._id,
        rating,
        feedback
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      toast.success(`Thanks for your ${rating} star rating!`);
      setShowRating(false);
      clearOrder();
      setOrder(prev => ({ ...prev, rated: true }));

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  const handleSkipRating = () => {
    setShowRating(false);
    clearOrder();
    toast.info('You can rate your delivery partner later from order history');
  };

  const handleShowRating = () => {
    if (order?.rated) {
      toast.info('You have already rated this order');
      return;
    }
    setShowRating(true);
  };

  const handlePayment = () => {
    const itemsArray = Array.isArray(cart.items) ? cart.items : Object.values(cart.items || {});

    if (itemsArray.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const cartItemsArray = itemsArray.map(({ name, quantity, price }) => ({
      name,
      quantity: quantity || 1,
      price
    }));

    const { summary, isFreeDelivery, subtotal, gst, deliveryFee, total } = calculateTotals(itemsArray, 40);

    navigate('/paymentpage', {
      state: {
        restaurant: cart.restaurant,
        restaurantId: cart.restaurant?._id || cart.restaurant?.id,
        restaurantName: cart.restaurant?.name,
        address: userAddress,
        items: cartItemsArray,
        coupon: appliedCoupon?.code,
        rewardPointsUsed: userPoints > 0 ? Math.min(userPoints, total * 10) : 0,
        totalAmount: total,
        subtotal,
        deliveryFee: isFreeDelivery ? 0 : 40,
        gst,
        isFreeDelivery,
        orderType: 'normal'
      }
    });
  };

  const handleTrainOrder = () => {
    const itemsArray = Array.isArray(cart.items) ? cart.items : Object.values(cart.items || {});

    if (itemsArray.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    const { total, subtotal, gst, deliveryFee, isFreeDelivery } = calculateTotals(itemsArray, 40);

    navigate('/paymentpage', {
      state: {
        restaurant: cart.restaurant,
        restaurantId: cart.restaurant?._id || cart.restaurant?.id,
        restaurantName: cart.restaurant?.name,
        items: itemsArray.map(({ name, quantity, price }) => ({
          name,
          quantity: quantity || 1,
          price
        })),
        coupon: appliedCoupon?.code,
        rewardPointsUsed: userPoints > 0 ? Math.min(userPoints, total * 10) : 0,
        totalAmount: total,
        subtotal: calculateTotals(itemsArray, 40).subtotal,
        gst: calculateTotals(itemsArray, 40).gst,
        deliveryFee: calculateTotals(itemsArray, 40).deliveryFee,
        isFreeDelivery: calculateTotals(itemsArray, 40).isFreeDelivery,
        orderType: 'train'
      }
    });
  };

  const handleGroupOrder = () => {
    const itemsArray = Array.isArray(cart.items) ? cart.items : Object.values(cart.items || {});
    const { total } = calculateTotals(itemsArray, 40);

    navigate('/paymentpage', {
      state: {
        restaurant: cart.restaurant,
        restaurantId: cart.restaurant?._id || cart.restaurant?.id,
        restaurantName: cart.restaurant?.name,
        items: itemsArray.map(({ name, quantity, price }) => ({
          name,
          quantity: quantity || 1,
          price
        })),
        coupon: appliedCoupon?.code,
        rewardPointsUsed: userPoints > 0 ? Math.min(userPoints, total * 10) : 0,
        totalAmount: total,
        subtotal: calculateTotals(itemsArray, 40).subtotal,
        gst: calculateTotals(itemsArray, 40).gst,
        deliveryFee: calculateTotals(itemsArray, 40).deliveryFee,
        isFreeDelivery: calculateTotals(itemsArray, 40).isFreeDelivery,
        orderType: 'group',
        groupOrderDetails: {
          hostName: '',
          participants: []
        }
      }
    });
  };
  if (!order) {
    const itemsArray = Array.isArray(cart.items) ? cart.items : Object.values(cart.items || {});
    const hasCartItems = itemsArray.length > 0;

    return (
      <div className="order-review-container">
        <h2><FaShoppingBag /> Review Your Order</h2>
        {hasCartItems ? (
          <>
            <div className="restaurant-info">
              <h3>{cart.restaurant?.name || 'Restaurant'}</h3>
              <p><FaMapMarkerAlt /> {cart.restaurant?.location || ''}</p>
            </div>
            <div className="order-items-list">
              {itemsArray.map((item, i) => (
                <div key={i} className="order-item">
                  <span className="item-name">{item.name} * {item.quantity || 1}</span>
                  <span className="item-price">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="discount-options">
              <button className="btn-coupon" onClick={() => setShowCoupons(!showCoupons)}>
                {appliedCoupon ? <><FaPercent /> Applied: {appliedCoupon.code}</> : <><FaPercent /> Apply Coupon</>}
              </button>
              {userPoints > 0 && (
                <button className="btn-rewards" onClick={() => setShowRewards(!showRewards)}>
                  <FaStar /> Use Reward Points ({userPoints} pts)
                </button>
              )}
            </div>
            {showCoupons && (
              <div className="coupons-modal">
                <div className="modal-header">
                  <h4><FaPercent /> Available Coupons</h4>
                  <button onClick={() => setShowCoupons(false)}>×</button>
                </div>
                <div className="coupons-list">
                  {coupons.map((coupon, i) => (
                    <div key={i} className="coupon-item">
                      <div className="coupon-info">
                        <h5>{coupon.title}</h5>
                        <p>{coupon.description}</p>
                        <small>Code: {coupon.code}</small>
                      </div>
                      <button
                        className={`btn-apply ${appliedCoupon?.code === coupon.code ? 'applied' : ''}`}
                        onClick={() => handleApplyCoupon(coupon)}
                        disabled={appliedCoupon?.code === coupon.code}
                      >
                        {appliedCoupon?.code === coupon.code ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                  ))}
                </div>
                {appliedCoupon && (
                  <div className="applied-coupon-info">
                    <span>Applied coupon: {appliedCoupon.code}</span>
                    <button onClick={handleRemoveCoupon}>Remove</button>
                  </div>
                )}
              </div>
            )}
            {showRewards && (
              <div className="rewards-modal">
                <div className="modal-header">
                  <h4><FaStar /> Available Rewards</h4>
                  <button onClick={() => setShowRewards(false)}>×</button>
                </div>
                <div className="rewards-list">
                  {rewards.map((reward, i) => (
                    <div key={i} className="reward-item">
                      <div className="reward-info">
                        <h5>{reward.title}</h5>
                        <p>{reward.desc}</p>
                        <small>{reward.points} points required</small>
                      </div>
                      <button
                        className={`btn-redeem ${userPoints < reward.points ? 'disabled' : ''}`}
                        onClick={() => handleRedeemReward(reward)}
                        disabled={userPoints < reward.points}
                      >
                        {userPoints >= reward.points ? 'Redeem' : 'Not enough points'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="order-summary">
              {calculateTotals(itemsArray, 40).summary.map((item, i) => (
                <div key={i} className={`summary-row ${item.isTotal ? 'total' : ''}`}>
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="delivery-address">
              <h4><FaMapMarkerAlt /> Delivery Address</h4>
              {addressLoading ? (
                <p>Loading address...</p>
              ) : userAddress ? (
                <>
                  <p><FaUserAlt /> {userAddress.name}</p>
                  <p>{userAddress.address}, {userAddress.city}</p>
                  <p>{userAddress.state} - {userAddress.pincode}</p>
                  <p><FaPhone /> {userAddress.phone}</p>
                </>
              ) : (
                <p>No address selected</p>
              )}
            </div>
            <button
              className="btn-place-order"
              onClick={handlePayment}
              disabled={!userAddress}
            >
              {!userAddress ? 'Please select an address first' : 'Proceed to Payment'}
            </button>
          </>
        ) : (
          <div className="empty-cart-message">
            <p>Your cart is empty</p>
          </div>
        )}

        {/* Always show these buttons at the bottom */}
        <div className="special-order-options">
          <button
            className="btn-browse-restaurants"
            onClick={() => {
              clearCart();
              localStorage.removeItem('currentOrder');
              navigate('/delivery');
            }}
          >
            Browse Restaurants
          </button>

          <button
            className="btn-train-order"
            onClick={() => {
              if (cart.items && Object.keys(cart.items).length > 0) {
                navigate('/orderontrain', {
                  state: {
                    restaurant: cart.restaurant,
                    items: Object.values(cart.items),
                    fromCart: true
                  }
                });
              } else {
                navigate('/orderontrain');
              }
            }}
          >
            <FaTrain /> Order Food on Train
          </button>

          <button
            className="btn-group-order"
            onClick={() => {
              if (cart.items && Object.keys(cart.items).length > 0) {
                navigate('/groupdining', {
                  state: {
                    restaurant: cart.restaurant,
                    items: Object.values(cart.items),
                    fromCart: true
                  }
                });
              } else {
                navigate('/groupdining');
              }
            }}
          >
            🍽️ Start Group Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracking-container">
      <div className="order-header">
        <h1><FaShoppingBag /> Your Order</h1>
        <div className={`status-badge ${deliveryStage === 6 ? 'delivered' :
          deliveryStage === 0 ? 'cancelled' :
            deliveryStage === 1 ? 'pending' :
              'in-progress'}`}>
          {deliveryStage === 6 ? 'Delivered' :
            deliveryStage === 0 ? 'Cancelled' :
              deliveryStage === 1 ? 'Pending Approval' :
                'In Progress'}
        </div>
      </div>
      {order.paymentMethod === 'cod' && deliveryStage === 6 && (
        <div className="cod-payment-message">
          <p>Total amount: ₹{order.totalAmount?.toFixed(2) || '0.00'}</p>
          <p className="cod-notice">Please pay at delivery time</p>
        </div>
      )}

      <div className="order-card">
        <div className="restaurant-info">
          <h2>{order.restaurantName || order.restaurant?.name || 'Restaurant'}</h2>
          <p className="location"><FaMapMarkerAlt /> {order.restaurantLocation || order.restaurant?.location || ''}</p>
          <p className="order-time">
            Order placed at: {order.orderPlacedTime ? new Date(order.orderPlacedTime).toLocaleString() : order.time ? new Date(order.time).toLocaleString() : ''}
          </p>
        </div>
        <div className="order-items">
          <h3>Your Items</h3>
          {order?.items?.length ? (
            order.items.map((item, i) => (
              <div key={i} className="item-row">
                <div className="item-left">
                  <span className="item-name">{item.name || 'Item'}</span>
                  <span className="item-qty">Qty: {item.quantity || 1}</span>
                </div>
                <div className="item-price">
                  ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <p className="no-items">No items in this order</p>
          )}
        </div>
        <div className="order-summary">
          {calculateTotals(order.items, order.deliveryFee).summary.map((item, i) => (
            <div key={i} className={`summary-row ${item.isTotal ? 'total' : ''}`}>
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="delivery-tracker">
        <h2><FaTruck /> Delivery Updates</h2>
        <div className="delivery-progress">
          {deliveryStatus.map(step => (
            <div key={step.id} className={`step ${deliveryStage >= step.id ? 'active' : ''}`}>
              <div className="step-icon">{step.icon}</div>
              <div className="step-text">{step.displayStatus}</div>
              {step.id === 5 && order.deliveryStatus && (
                <div className="delivery-substatus">
                  {deliveryStatusMap[order.deliveryStatus]}
                </div>
              )}
            </div>
          ))}
        </div>
        {deliveryStage >= 4 && order.deliveryPartner && (
          <div className="delivery-partner-card">
            <div className="partner-header">
              <h4>Delivery Partner</h4>
              <span className="partner-status">
                {order.deliveryStatus === 'assigned'}
                {order.deliveryStatus === 'picked_up' && 'On the way to you'}
                {order.deliveryStatus === 'arrived' && 'Arrived at your location'}
              </span>
            </div>
            <div className="partner-info">
              <h5>{order.deliveryPartner.name}</h5>
              <div className="partner-meta">
                {order.deliveryPartner.phone && (
                  <a href={`tel:${order.deliveryPartner.phone}`} className="partner-phone">
                    <FaPhone /> {order.deliveryPartner.phone}
                  </a>
                )}
                {order.deliveryPartner.vehicleId && (
                  <span className="partner-vehicle">
                    Vehicle: {order.deliveryPartner.vehicleId}
                  </span>
                )}
                {order.deliveryPartner.averageRating && (
                  <span className="partner-rating">
                    <FaStar /> {order.deliveryPartner.averageRating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        {deliveryStage === 6 && !showRating && (
          <div className="order-complete-message">
            <h3>🎉 Order Delivered Successfully!</h3>
            <p>Your food has been delivered! Enjoy your meal.</p>
            <p>Thank you for ordering with us. We hope you enjoy your delicious meal!</p>

            {!order?.rated && (
              <button
                className="btn-rate"
                onClick={() => {
                  setShowRating(true);
                  toast.success(
                    <div>
                      <h4>🎉 Order Completed Successfully!</h4>
                      <p>Thank you for choosing us. Enjoy your meal!</p>
                      <p>Please take a moment to rate your delivery experience.</p>
                    </div>,
                    {
                      position: "top-center",
                      autoClose: 5000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                    }
                  );
                }}
              >
                <FaStar /> Rate Delivery Partner
              </button>
            )}
          </div>
        )}
        {deliveryStage === 0 && (
          <div className="order-cancelled-summary">
            <div className="cancelled-message">
              <FaTimesCircle className="text-danger" />
              <h3>We&apos;re sorry! Your order was cancelled.</h3>
            </div>

            {order.cancellationReason && (
              <div className="cancel-reason-box">
                <strong>Reason:</strong>
                <p>{order.cancellationReason}</p>
              </div>
            )}

            {order.paymentMethod === 'cod' ? (
              <div className="cod-payment-message">
                <p>Order amount: ₹{order.totalAmount?.toFixed(2) || '0.00'}</p>
              </div>
            ) : (
              <div className="order-summary">
                {calculateTotals(order.items, order.deliveryFee).summary.map((item, i) => (
                  <div key={i} className={`summary-row ${item.isTotal ? 'total' : ''}`}>
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="cancelled-order-actions">
              <button
                className="btn-primary"
                onClick={() => navigate('/delivery')}
              >
                <FaUtensils /> Order Again
              </button>
            </div>
          </div>
        )}
        {showRating && (
          <div className="rating-modal">
            <h3>Rate your delivery partner</h3>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              placeholder="Optional feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <div className="rating-actions">
              <button
                className="btn-submit-rating"
                onClick={handleSubmitRating}
                disabled={rating === 0}
              >
                Submit Rating
              </button>
              <button
                className="btn-skip-rating"
                onClick={handleSkipRating}
              >
                Skip
              </button>
            </div>
          </div>
        )}
        {deliveryStage === 6 && !showRating && (
          <div className="order-complete-message">
            <h3>Order Delivered!</h3>
            <p>Thank you for your order.</p>
            {!order?.rated && (
              <button
                className="btn-rate"
                onClick={handleShowRating}
              >
                <FaStar /> Rate Delivery Partner
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FoodOrderPage;