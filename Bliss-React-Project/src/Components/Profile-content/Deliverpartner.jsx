/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const formatDate = (dateString) => {
  if (!dateString || isNaN(new Date(dateString).getTime())) {
    return 'Not Available';
  }
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formatDeliveryTime = (milliseconds) => {
  if (!milliseconds || milliseconds <= 0) return 'Not Available';
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes} min ${seconds} sec`;
};

// Move processOrder outside of the component but keep the same implementation
const processOrder = (order) => {
  if (!order) return null;

  const statusMap = {
    assigned: 'Assigned',
    picked_up: 'Picked Up',
    arrived: 'Arrived',
    delivered: 'Delivered',
    ready_for_pickup: 'Ready for Pickup',
    out_for_delivery: 'Out for Delivery'
  };

  return {
    ...order,
    address: order.address || { address: 'Address not specified' },
    userId: order.userId || { name: 'N/A', email: 'N/A' },
    restaurantId: order.restaurantId || { name: 'N/A' },
    displayStatus: statusMap[order.deliveryStatus || order.status] || 'Unknown',
    currentStatus: order.deliveryStatus || order.status,
    formattedDeliveredAt: formatDate(order.deliveredAt),
    formattedOrderPlaced: formatDate(order.orderPlacedTime),
    formattedDeliveryTime: formatDeliveryTime(order.deliveryTime),
    orderIdentifier: order.orderId || order._id
  };
};

const DeliveryPartner = () => {
  const [partner, setPartner] = useState(null);
  const [approved, setApproved] = useState(false);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [allPartners, setAllPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchPartner = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/deliverypartner/deliveryboy`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.data) {
          setPartner(res.data.data);
          setApproved(true);
          return true;
        }
      } catch (err) {
        setApproved(false);
        return false;
      }
    };

    const ORDER_STATUS = {
      PENDING: 'pending',
      RESTAURANT_ACCEPTED: 'restaurant_accepted',
      PREPARING: 'preparing',
      READY_FOR_PICKUP: 'ready_for_pickup',
      OUT_FOR_DELIVERY: 'out_for_delivery',
      DELIVERED: 'delivered',
      CANCELLED: 'cancelled'
    };

    const DELIVERY_STATUS = {
      ASSIGNED: 'assigned',
      PICKED_UP: 'picked_up',
      ARRIVED: 'arrived',
      DELIVERED: 'delivered'
    };

    const fetchAllPartners = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/deliverypartner/getAllpartners`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllPartners(res.data.data || []);
      } catch (err) {
        console.error('Error fetching all partners:', err);
      }
    };

    fetchPartner().then(isApproved => {
      fetchAllPartners();
      if (isApproved) {
        refreshOrders();
      } else {
        const pollInterval = setInterval(async () => {
          const isNowApproved = await fetchPartner();
          if (isNowApproved) {
            clearInterval(pollInterval);
            refreshOrders();
          }
        }, 5000);
        return () => clearInterval(pollInterval);
      }
    });
  }, []);

  const refreshOrders = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');

    try {
      const [partnerOrdersRes, availableOrdersRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/deliverypartner/deliveryorder`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/deliverypartner/availableorders`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      const processedAcceptedOrders = (partnerOrdersRes.data.data || []).map(order => {
        const processed = {
          ...order,
          address: order.address || { address: 'Address not specified' },
          userId: order.userId || { name: 'N/A', email: 'N/A' },
          restaurantId: order.restaurantId || { name: 'N/A' },
          displayStatus: order.deliveryStatus || order.status || 'unknown',
          currentStatus: order.deliveryStatus || order.status,
          formattedDeliveredAt: formatDate(order.deliveredAt),
          formattedOrderPlaced: formatDate(order.orderPlacedTime),
          formattedDeliveryTime: formatDeliveryTime(order.deliveryTime)
        };

        if (processed.deliveryStatus === 'assigned' && processed.status === 'out_for_delivery') {
          processed.displayStatus = 'On the way to restaurant';
        } else if (processed.deliveryStatus === 'picked_up') {
          processed.displayStatus = 'On the way to customer';
        }
        return processed;
      });

      const processedAvailableOrders = (availableOrdersRes.data.data || []).map(order => ({
        ...order,
        address: order.address || { address: 'Address not specified' },
        userId: order.userId || { name: 'N/A', email: 'N/A' },
        restaurantId: order.restaurantId || { name: 'N/A' },
        displayStatus: 'ready_for_pickup',
        currentStatus: order.status
      }));

      setAcceptedOrders(processedAcceptedOrders);
      setAvailableOrders(processedAvailableOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      }
      toast.error('Failed to fetch orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderAction = async (action, orderId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      const endpoints = {
        accept: `${import.meta.env.VITE_API_BASE_URL}/deliverypartner/acceptorder`,
        reject: `${import.meta.env.VITE_API_BASE_URL}/deliverypartner/rejectorder`,
        pickup: `${import.meta.env.VITE_API_BASE_URL}/deliverypartner/pickuporder`,
        arrived: `${import.meta.env.VITE_API_BASE_URL}/deliverypartner/arrivedorder`,
        deliver: `${import.meta.env.VITE_API_BASE_URL}/deliverypartner/deliverorder`
      };


      let response;

      if (action === 'accept') {
        response = await axios.put(
          endpoints[action],
          {
            status: 'out_for_delivery',
            deliveryStatus: 'assigned'
          },
          {
            ...config,
            params: { orderId }
          }
        );
      }
      else if (action === 'pickup') {
        response = await axios.put(
          endpoints[action],
          {
            deliveryStatus: 'picked_up'
          },
          {
            ...config,
            params: { orderId }
          }
        );
      }
      else {
        response = await axios.put(
          endpoints[action],
          {},
          { ...config, params: { orderId } }
        );
      }

      if (response.data.success) {
        await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/deliverypartner/deliveryboy`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => setPartner(res.data.data)),
          refreshOrders()
        ]);

        const successMessages = {
          accept: 'Order accepted and marked as out for delivery',
          reject: 'Order rejected successfully',
          pickup: 'Order picked up successfully',
          arrived: 'Delivery partner arrived at destination',
          deliver: 'Order delivered successfully'
        };
        toast.success(successMessages[action]);
      } else {
        throw new Error(response.data.message || `Failed to ${action} order`);
      }
    } catch (error) {
      console.error('Order action failed:', error);
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(errorMsg || `Failed to ${action} order`);
    }
  };

  if (!approved) {
    return (
      <div className="delivery-status-container">
        <h2>Delivery Partner Status</h2>
        {allPartners.length > 0 ? (
          <div className="partners-list">
            <h3>Current Delivery Partners:</h3>
            <ul>
              {allPartners.map(p => (
                <li key={p._id}>
                  <span>{p.name}</span>
                  <span>Status: {p.status || 'pending approval'}</span>
                </li>
              ))}
            </ul>
            <p>Your application is pending admin approval. Please wait...</p>
          </div>
        ) : (
          <div className="no-partners-message">
            <p>No delivery partners currently registered.</p>
            <p>Your application is pending admin approval. Please wait...</p>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="delivery-dashboard">
      <header className="dashboard-header">
        <h1>Delivery Partner Dashboard</h1>
        <h2>Welcome, {partner?.name || 'Partner'}</h2>
        <p>Status: {partner?.status || 'available'}</p>
      </header>

      <div className="dashboard-content">
        <section className="orders-section">
          <h2>Available Orders</h2>
          {availableOrders.length === 0 ? (
            <p className="no-orders">No orders available at the moment.</p>
          ) : (
            <ul className="orders-list">
              {availableOrders.map(order => (
                <li key={order._id} className="order-card">
                  <div className="order-info">
                    <h3>Order #{order.orderId || order._id}</h3>
                    <p>Customer: {order.userId?.name || 'N/A'}</p>
                    <p>Restaurant: {order.restaurantId?.name || 'N/A'}</p>
                    <p>Status: {order.displayStatus || 'ready_for_pickup'}</p>
                    <p>Total: ₹{order.totalAmount || 'N/A'}</p>
                  </div>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleOrderAction('accept', order._id)}
                      className="accept-btn"
                    >
                      Accept Order
                    </button>
                    <button
                      onClick={() => handleOrderAction('reject', order._id)}
                      className="reject-btn"
                    >
                      Reject Order
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="accepted-section">
          <h2>Your Accepted Orders</h2>
          {acceptedOrders.length === 0 ? (
            <p className="no-orders">You haven&apos;t accepted any orders yet.</p>
          ) : (
            <ul className="orders-list">
              {acceptedOrders.map(order => {
                const currentStatus = order.deliveryStatus || order.status || 'accepted';
                return (
                  <li key={order._id} className="order-card">
                    <div className="order-info">
                      <h3>Order #{order._id}</h3>
                      <p>Customer: {order.userId?.name || 'N/A'}</p>
                      <p>Delivery Address: {order.address?.address || 'Address not specified'}</p>
                      <p>Status: {currentStatus.replace(/_/g, ' ')}</p>
                      <p>Total: ₹{order.totalAmount || 'N/A'}</p>
                    </div>
                    <div className="button-group">
                      {['assigned', 'out_for_delivery', 'picked_up', 'arrived'].includes(currentStatus) && (
                        <button
                          onClick={() => handleOrderAction('reject', order._id)}
                          className="reject-btn"
                        >
                          Reject Order
                        </button>
                      )}
                      {['assigned', 'out_for_delivery'].includes(currentStatus) && (
                        <button
                          onClick={() => handleOrderAction('pickup', order._id)}
                          className="pickup-btn"
                        >
                          Pick Up Order
                        </button>
                      )}
                      {currentStatus === 'picked_up' && (
                        <button
                          onClick={() => handleOrderAction('arrived', order._id)}
                          className="arrived-btn"
                        >
                          Mark as Arrived
                        </button>
                      )}
                      {currentStatus === 'arrived' && (
                        <button
                          onClick={() => handleOrderAction('deliver', order._id)}
                          className="deliver-btn"
                        >
                          Mark as Delivered
                        </button>
                      )}

                      {currentStatus === 'delivered' && (
                        <div className="delivery-complete">
                          <span className="status-badge delivered">
                            Delivered at: {order.formattedDeliveredAt}
                          </span>
                          <p>Delivery time: {order.formattedDeliveryTime}</p>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="partners-section">
          <h2 className="partners-section-title">All Delivery Partners</h2>
          {allPartners.length === 0 ? (
            <p className="no-partners-message">No other delivery partners registered.</p>
          ) : (
            <ul className="partners-grid">
              {allPartners.map(p => (
                <li key={p._id} className="partner-card">
                  <h3 className="partner-name">{p.name}</h3>
                  <div className="partner-details">
                    <p className="partner-status">
                      <span className="detail-label">Status:</span> {p.status || 'available'}
                    </p>
                    <p className="partner-email">
                      <span className="detail-label">Email:</span> {p.email || 'N/A'}
                    </p>
                    <p className="partner-phone">
                      <span className="detail-label">Phone:</span> {p.phone || 'N/A'}
                    </p>
                    {p.averageRating && (
                      <p className="partner-rating">
                        <span className="detail-label">Rating:</span>
                        <span className="rating-value">{p.averageRating.toFixed(1)}</span>
                        <span className="rating-count">({p.ratings?.length || 0} ratings)</span>
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default DeliveryPartner;