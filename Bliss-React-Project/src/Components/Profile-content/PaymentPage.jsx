/* eslint-disable no-unused-vars */
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {
  FaCreditCard,
  FaCheckCircle,
  FaMoneyBillWave,
  FaTrain
} from 'react-icons/fa';
import { SiGooglepay } from 'react-icons/si';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ORDER_TYPES = {
  NORMAL: 'normal',
  TRAIN: 'train',
  GROUP: 'group'
};

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('credit-card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    upi: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [currentLink] = useState('');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const [hasNavigated, setHasNavigated] = useState(false);
  const paymentType = location?.state?.type || 'order';
  const amount = location?.state?.totalAmount || location?.state?.amount;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }
  }, []);

  const digitalWallets = [
    {
      id: 'google-pay',
      name: 'Google Pay',
      icon: <SiGooglepay size={24} color="#4285F4" />,
      description: 'Fast and secure UPI payments'
    }
  ];

  const creditOptions = [
    {
      id: 'credit-card',
      name: 'Credit Card',
      icon: <FaCreditCard size={24} />,
      description: 'Pay using Visa, Mastercard, Rupay, etc.'
    }
  ];

  const codOption = paymentType === 'donation' ? [] : [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: <FaMoneyBillWave size={24} color="#10B981" />,
      description: 'Pay when you receive your order'
    }
  ];

  const validateCard = (details) => {
    const { number, name, expiry, cvv } = details;
    if (!number || !name || !expiry || !cvv) {
      toast.error('Please fill in all card details');
      return false;
    }
    if (!/^\d{16}$/.test(number)) {
      toast.error('Card number must be 16 digits');
      return false;
    }
    if (!/^\d{3}$/.test(cvv)) {
      toast.error('CVV must be 3 digits');
      return false;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      toast.error('Expiry must be in MM/YY format');
      return false;
    }
    return true;
  };

  const validateUPI = (upiId) => {
    const upiRegex = /^[\w.-]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiId) {
      toast.error('Please enter your UPI ID');
      return false;
    }
    if (!upiRegex.test(upiId)) {
      toast.error('Invalid UPI ID format');
      return false;
    }
    return true;
  };

  const handleDonationPayment = async (trimmedCardDetails) => {
    let payload = {
      userId: user.id,
      method: selectedMethod,
      type: 'donation',
      amount: Number(amount),
      transactionId,
      name: user.name,
      email: user.email,
      message: 'Thank you!'
    };

    if (selectedMethod === 'credit-card') {
      payload.cardDetails = {
        number: trimmedCardDetails.number,
        name: trimmedCardDetails.name,
        expiry: trimmedCardDetails.expiry,
        cvv: trimmedCardDetails.cvv
      };
    }
    if (selectedMethod === 'google-pay') {
      payload.upiId = trimmedCardDetails.upi;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:8000/payment',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        toast.success(`Donation successful with ${selectedMethod === 'google-pay' ? 'Google Pay (UPI)' : 'Credit Card'}!`);
        toast.success('Thank you for your generous donation!');
        navigate('/feedingindia', { state: { donationSuccess: true } });
      } else {
        toast.error(response.data.message || 'Donation failed');
      }
    } catch (error) {
      toast.error(
        'Donation failed: ' + (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOrderPayment = async (trimmedCardDetails) => {
    console.log('🟢 Starting order payment process...');

    // Validate required fields based on order type
    const orderType = location.state?.orderType || ORDER_TYPES.NORMAL;
    
    if (orderType === ORDER_TYPES.NORMAL && !location?.state?.address) {
      toast.error('Delivery address is required');
      return;
    }

    if (orderType === ORDER_TYPES.TRAIN && !location?.state?.trainDetails) {
      toast.error('Train details are required');
      return;
    }

    if (!location?.state?.restaurant?._id) {
      toast.error('Restaurant details are missing');
      return;
    }

    // Prepare the base payload
    let payload = {
      userId: user.id,
      method: selectedMethod,
      type: 'order',
      orderType, // Add order type to payload
      amount: Number(amount),
      transactionId,
      restaurantId: location.state.restaurant._id,
      restaurantName: location.state.restaurant.name,
      deliveryFee: location.state.deliveryFee || 0,
      gst: location.state.gst || 0,
      paymentMethod: selectedMethod,
      items: location.state.items.map(item => ({
        itemId: item.itemId || item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      coupon: location.state.coupon,
      rewardPointsUsed: location.state.rewardPointsUsed || 0
    };

    // Add type-specific details
    if (orderType === ORDER_TYPES.NORMAL) {
      payload.address = location.state.address._id || location.state.address;
    } 
    else if (orderType === ORDER_TYPES.TRAIN) {
      payload.trainDetails = location.state.trainDetails;
    }
    else if (orderType === ORDER_TYPES.GROUP) {
      payload.groupDetails = location.state.groupDetails;
    }

    // Add payment details
    if (selectedMethod === 'credit-card') {
      payload.cardDetails = {
        number: trimmedCardDetails.number,
        name: trimmedCardDetails.name,
        expiry: trimmedCardDetails.expiry,
        cvv: trimmedCardDetails.cvv
      };
    } else if (selectedMethod === 'google-pay') {
      payload.upiId = trimmedCardDetails.upi;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:8000/payment',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Backend payment response:", response.data);

      if (response.data.success && response.data.order) {
        const statusStageMap = {
          pending: 1,
          placed: 2,
          preparing: 3,
          ready: 4,
          arrived: 5,
          "out for delivery": 6,
          delivered: 7,
          cancelled: 0
        };
        
        const orderStatus = (response.data.order.status || "").toLowerCase().trim();
        const updatedOrder = {
          ...response.data.order,
          deliveryStage: statusStageMap[orderStatus] ?? 1,
          orderType // Include order type in the order object
        };

        localStorage.setItem('currentOrder', JSON.stringify(updatedOrder));
        console.log('✅ Order saved to localStorage:', updatedOrder);
        toast.success(`Payment successful with ${selectedMethod}!`);

        if (!hasNavigated) {
          setHasNavigated(true);
          navigate('/foodorders', {
            state: {
              order: updatedOrder
            }
          });
        }
      } else {
        toast.error(response.data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      let errorMessage = 'Payment failed. Please try again.';
      if (error.response) {
        errorMessage = error.response.data?.message ||
          error.response.data?.error ||
          `Server error (${error.response.status})`;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }

      toast.error(
        <div>
          <div className="font-medium">Payment Failed</div>
          <div className="text-sm mt-1">{errorMessage}</div>
          <button
            className="text-blue-500 underline mt-2"
            onClick={() => handleOrderPayment(trimmedCardDetails)}
          >
            Retry Payment
          </button>
        </div>,
        { autoClose: false }
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!user || !token) {
      toast.error('User not logged in.');
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error('Invalid payment amount.');
      return;
    }
    const trimmedCardDetails = {
      ...cardDetails,
      number: cardDetails.number.replace(/\s/g, '').trim(),
      name: cardDetails.name.trim(),
      expiry: cardDetails.expiry.trim(),
      cvv: cardDetails.cvv.trim(),
      upi: cardDetails.upi.trim()
    };
    if (selectedMethod === 'credit-card' && !validateCard(trimmedCardDetails)) return;
    if (selectedMethod === 'google-pay' && !validateUPI(trimmedCardDetails.upi)) return;

    if (paymentType === 'donation') {
      await handleDonationPayment(trimmedCardDetails);
      return;
    }
    if (paymentType === 'order') {
      await handleOrderPayment(trimmedCardDetails);
      return;
    }
    toast.error('Invalid payment type.');
  };

  const renderPaymentSection = (title, methods) => (
    methods.length > 0 && (
      <div className="payment-section">
        <h3 className="section-title">{title}</h3>
        <div className="payment-methods">
          {methods.map((method) => (
            <div
              key={method.id}
              className={`payment-method ${selectedMethod === method.id ? 'selected' : ''}`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <div className="method-icon">{method.icon}</div>
              <div className="method-info">
                <h4>{method.name}</h4>
                <p>{method.description}</p>
              </div>
              {selectedMethod === method.id && (
                <FaCheckCircle className="check-icon" color="#4CAF50" />
              )}
            </div>
          ))}
        </div>
      </div>
    )
  );

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h2>
            {paymentType === 'donation' ? 'Donation Payment' : 
             location.state?.orderType === ORDER_TYPES.TRAIN ? 'Train Order Payment' :
             location.state?.orderType === ORDER_TYPES.GROUP ? 'Group Order Payment' : 'Order Payment'}
          </h2>
          <p>Total Amount: ₹{amount}</p>
          
          {location.state?.orderType === ORDER_TYPES.TRAIN && (
            <div className="order-type-details">
              <p><FaTrain /> Train Order Details:</p>
              <p>PNR: {location.state.trainDetails?.pnr}</p>
              <p>Train No: {location.state.trainDetails?.trainNumber}</p>
              <p>Station: {location.state.trainDetails?.station}</p>
            </div>
          )}
          
          {location.state?.orderType === ORDER_TYPES.GROUP && (
            <div className="order-type-details">
              <p>🍽️ Group Order Details:</p>
              <p>Host: {location.state.groupDetails?.hostName}</p>
              <p>Participants: {location.state.groupDetails?.participants?.length || 0}</p>
            </div>
          )}
        </div>
        {renderPaymentSection('Digital Wallets', digitalWallets)}
        {renderPaymentSection('Credit Cards', creditOptions)}
        {renderPaymentSection('Other Options', codOption)}
        <form onSubmit={handlePaymentSubmit}>
          {selectedMethod === 'credit-card' && (
            <div className="card-form">
              <h3>Enter Card Details</h3>
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  placeholder="1234567890123456"
                  value={cardDetails.number}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, number: e.target.value })
                  }
                  maxLength="16"
                />
              </div>
              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, name: e.target.value })
                  }
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, expiry: e.target.value })
                    }
                    maxLength="5"
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, cvv: e.target.value })
                    }
                    maxLength="3"
                  />
                </div>
              </div>
            </div>
          )}
          {selectedMethod === 'google-pay' && (
            <div className="upi-form">
              <h3>Enter UPI ID</h3>
              <div className="form-group">
                <label>UPI ID</label>
                <input
                  type="text"
                  placeholder="example@upi"
                  value={cardDetails.upi}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, upi: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          )}
          <div className="payment-actions">
            <Link to={paymentType === 'donation' ? '/feedingindia' : '/foodorders'} className="back-button">
              Back
            </Link>
            <button
              type="submit"
              className="pay-button"
              disabled={!selectedMethod || loading}
            >
              {loading ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
        {showModal && (
          <div className="redirect-modal">
            <p>You&apos;ll be redirected to set up your payment method. Continue?</p>
            <div className="modal-actions">
              <button
                className="modal-confirm"
                onClick={() => {
                  window.open(currentLink, '_blank', 'noopener,noreferrer');
                  setShowModal(false);
                }}
              >
                Continue
              </button>
              <button
                className="modal-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;