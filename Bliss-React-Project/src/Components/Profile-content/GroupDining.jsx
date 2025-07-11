/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { foodItems } from '../data';
import { toast } from 'react-toastify';

const GroupDining = () => {
  const navigate = useNavigate();
  const [groupOrder, setGroupOrder] = useState(null);
  const [groupOrderItems, setGroupOrderItems] = useState([]);
  const [people, setPeople] = useState(1);
  const [billAmount, setBillAmount] = useState(0);
  const [activeTip, setActiveTip] = useState(null);
  const [timeLeft, setTimeLeft] = useState(1200);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);
  const [joinCode, setJoinCode] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [participants, setParticipants] = useState([]);

  const tips = [
    { id: 1, icon: '📦', title: 'Group Delivery', content: 'Order together to save on delivery fees and get bulk discounts.' },
    { id: 2, icon: '🧾', title: 'Itemized Bills', content: 'Split by items so everyone pays only for what they ordered.' },
    { id: 3, icon: '⏱️', title: 'Schedule Orders', content: 'Plan your group meal in advance for stress-free dining.' },
    { id: 4, icon: '💰', title: 'Shared Payments', content: 'Use our bill splitter to easily divide costs among friends.' }
  ];

  useEffect(() => {
    const fetchGroupOrder = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping group order fetch');
        return;
      }

      try {
        console.log('Attempting to fetch group orders from:', 'http://localhost:8000/grouporder/mygrouporders');
        const res = await axios.get('http://localhost:8000/grouporder/mygrouporders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Group orders fetched successfully:', res.data);

        const active = (res.data || []).find(order => order.status === 'pending');

        if (active) {
          console.log('Active group order found:', active);
          setGroupOrder(active);
          setGroupOrderItems(flattenParticipantItems(active.participants));
          const expiresAt = new Date(active.expiresAt).getTime();
          const now = Date.now();
          const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
          setTimeLeft(remaining);
          setTimerActive(true);
        } else {
          console.log('No active group orders found');
        }
      } catch (error) {
        console.error('Error fetching group orders:', error);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
        toast.error('Failed to fetch group order. Please check if the endpoint exists.');
      }
    };

    fetchGroupOrder();
  }, []);
  useEffect(() => {
    if (groupOrder) {
      setParticipants(groupOrder.participants);
    }
  }, [groupOrder]);
  const joinGroupOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to join group order');
        navigate('/login');
        return;
      }

      const res = await axios.post('http://localhost:8000/grouporder/join',
        { code: joinCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setGroupOrder(res.data);
      toast.success(`Joined group order at ${res.data.restaurantId.name}`);
      navigate('/restaurant/' + res.data.restaurantId._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join group order');
    }
  };


  useEffect(() => {
    if (!timerActive) {
      console.log('Timer inactive, skipping interval setup');
      return;
    }
    if (timeLeft <= 0) {
      console.log('Time left reached zero, cancelling order');
      handleCancelOrder(true);
      return;
    }

    console.log('Setting up timer interval');
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev > 1) return prev - 1;
        console.log('Timer reached zero, clearing interval');
        clearInterval(timerRef.current);
        return 0;
      });
    }, 1000);

    return () => {
      console.log('Cleaning up timer interval');
      clearInterval(timerRef.current);
    };
  }, [timerActive, timeLeft]);


  useEffect(() => {
    console.log('Group order items changed, recalculating total');
    const total = groupOrderItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    console.log('New total calculated:', total);
    setBillAmount(total);
  }, [groupOrderItems]);

  const flattenParticipantItems = (participants) => {
    console.log('Flattening participant items');
    const items = [];
    participants.forEach(p => {
      if (Array.isArray(p.items)) {
        console.log(`Adding ${p.items.length} items from participant`);
        items.push(...p.items);
      }
    });
    console.log('Total items after flattening:', items.length);
    return items;
  };

  const startTimer = () => {
    if (!groupOrder) {
      console.log('No group order exists, cannot start timer');
      toast.info('Please start a group order first');
      return;
    }
    console.log('Starting timer');
    setTimerActive(true);
    toast.success('Timer started!');
  };

  const cancelTimer = () => {
    console.log('Cancelling timer');
    setTimerActive(false);
    setTimeLeft(1200);
    toast.info('Timer stopped');
  };

  const handleCancelOrder = async (auto) => {
    console.log('Cancelling group order, auto:', auto);
    setTimerActive(false);
    if (groupOrder) {
      try {
        console.log('Attempting to cancel group order with ID:', groupOrder._id);
        await axios.post('http://localhost:8000/grouporder/update-status', {
          groupOrderId: groupOrder._id,
          status: 'cancelled'
        });
        console.log('Group order cancelled successfully');
        setGroupOrder(null);
        setGroupOrderItems([]);
        setTimeLeft(1200);
        if (!auto) toast.success('Group order cancelled');
      } catch (error) {
        console.error('Error cancelling group order:', error);
        toast.error('Failed to cancel group order');
      }
    }
  };

  const handlePeopleChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (val > 0) {
      console.log('Setting number of people to:', val);
      setPeople(val);
    }
  };

  const handleStartGroupOrder = async (restaurantId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to start a group order');
      navigate('/login');
      return;
    }

    try {
      const res = await axios.post('http://localhost:8000/grouporder/create', {
        restaurantId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setGroupOrder(res.data);
      setTimeLeft(Math.floor((new Date(res.data.expiresAt) - Date.now()) / 1000));
      setTimerActive(true);
      toast.success(`Group order created! Code: ${res.data.joinCode}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create group order');
    }
  };
  const handleProceed = () => {
    if (groupOrderItems.length === 0) {
      console.log('Attempted to proceed with empty order');
      toast.error('Your group order is empty!');
      return;
    }
    if (!people || people <= 0) {
      console.log('Invalid number of people:', people);
      toast.error('Please enter a valid number of people.');
      return;
    }
    console.log('Proceeding to payment with group order ID:', groupOrder?._id);
    navigate('/group-payment', { state: { groupOrderId: groupOrder?._id } });
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="group-dining">
      <header className="group-dining__header">
        <h1>Group Delivery</h1>
        <p>Order together, split bills easily</p>
      </header>
      {showJoinForm && (
        <div className="join-group-form">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Enter join code"
          />
          <button onClick={joinGroupOrder}>Join</button>
          <button onClick={() => setShowJoinForm(false)}>Cancel</button>
        </div>
      )}

      <section className="group-dining__cards">
        <div className="group-dining__card">
          <section className="group-dining__timer" style={{ margin: '1rem 0' }}>
            <p><strong>Time Left:</strong> {formatTime(timeLeft)}</p>
            <button
              onClick={startTimer}
              style={{ marginRight: '0.5rem' }}
              disabled={timerActive || !groupOrder}
            >
              Start Timer
            </button>
            <button
              onClick={cancelTimer}
              disabled={!timerActive}
            >
              Cancel Group Order
            </button>
          </section>
          <h3>Start a Group Order</h3>
          <p>Browse restaurants and invite friends to join your order</p>
          <button onClick={handleStartGroupOrder}>
            {groupOrder ? 'Manage Group Order' : 'Start Group Order'}
          </button>
          <button onClick={() => navigate('/delivery')}>Browse Restaurants</button>
        </div>
      </section>

      {groupOrder?.status === 'ordered' && (
        <div className="order-status">
          <p>Order has been placed! Status: {groupOrder.status}</p>
        </div>
      )}
      <section className="group-dining__bill-splitter">
        <h3>Bill Splitter</h3>
        {groupOrderItems.length === 0 ? (
          <p>No items added to your group order yet.</p>
        ) : (
          <div className="group-dining__selected-items">
            {groupOrderItems.map((item, idx) => (
              <div key={idx} className="group-dining__selected-item">
                <span>{item.name}</span>
                <span>₹{item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="group-dining__split-inputs" style={{ marginTop: '1rem' }}>
          <label>
            Number of People:
            <input
              type="number"
              min="1"
              value={people}
              onChange={handlePeopleChange}
              style={{ width: '60px', marginLeft: '0.5rem' }}
            />
          </label>
        </div>

        <div className="group-dining__totals" style={{ marginTop: '1rem' }}>
          <p><strong>Total Bill:</strong> ₹{billAmount.toFixed(2)}</p>
          <p><strong>Each Pays:</strong> ₹{(billAmount / people).toFixed(2)}</p>
        </div>

        <button
          onClick={handleProceed}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
          disabled={!groupOrder}
        >
          Proceed to Payment
        </button>
      </section>

      <section className="group-dining__tips" style={{ marginTop: '2rem' }}>
        <h3>Group Ordering Tips</h3>
        <div className="group-dining__tips-grid">
          {tips.map(tip => (
            <div
              key={tip.id}
              className={`group-dining__tip ${activeTip === tip.id ? 'active' : ''}`}
              onMouseEnter={() => setActiveTip(tip.id)}
              onMouseLeave={() => setActiveTip(null)}
              style={{
                border: activeTip === tip.id ? '2px solid #007bff' : '1px solid #ccc',
                padding: '1rem',
                borderRadius: '5px',
                cursor: 'default'
              }}
            >
              <h4>{tip.icon} {tip.title}</h4>
              <p>{tip.content}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="group-dining__menu" style={{ marginTop: '2rem' }}>
        <h3>Popular Menu Items</h3>
        <div className="group-dining__menu-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {foodItems.map(item => (
            <div
              key={item.id}
              className="group-dining__menu-item"
              onClick={() => navigate(`/restaurant/${item.food.toLowerCase()}`)}
              style={{ cursor: 'pointer', width: '150px', textAlign: 'center' }}
            >
              <img src={item.image} alt={item.food} style={{ width: '100%', borderRadius: '8px' }} />
              <p>{item.food}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default GroupDining;