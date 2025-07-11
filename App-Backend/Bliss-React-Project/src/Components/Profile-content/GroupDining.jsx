// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { foodItems } from '../data';

const mockGroupOrderItems = [
];

const GroupDining = () => {
  const navigate = useNavigate();
  
  const [groupOrderItems] = useState(mockGroupOrderItems);
  const [people, setPeople] = useState(1);
  const [billAmount, setBillAmount] = useState(0);
  const [activeTip, setActiveTip] = useState(null);

  useEffect(() => {
    const total = groupOrderItems.reduce((sum, item) => sum + item.price, 0);
    setBillAmount(total);
  }, [groupOrderItems]);

  const handlePeopleChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (val > 0) setPeople(val);
  };

  const handleProceed = () => {
    if (groupOrderItems.length === 0) {
      alert('Your group order is empty!');
      return;
    }
    if (!people || people <= 0) {
      alert('Please enter a valid number of people.');
      return;
    }
    navigate('/paymentpage');
  };

  const tips = [
    { id: 1, icon: '📦', title: 'Group Delivery', content: 'Order together to save on delivery fees and get bulk discounts.' },
    { id: 2, icon: '🧾', title: 'Itemized Bills', content: 'Split by items so everyone pays only for what they ordered.' },
    { id: 3, icon: '⏱️', title: 'Schedule Orders', content: 'Plan your group meal in advance for stress-free dining.' },
    { id: 4, icon: '💰', title: 'Shared Payments', content: 'Use our bill splitter to easily divide costs among friends.' }
  ];

  return (
    <div className="group-dining">
      <header className="group-dining__header">
        <h1>Group Dining & Delivery</h1>
        <p>Order together, split bills easily, and enjoy group discounts</p>
      </header>

      <section className="group-dining__cards">
        <div className="group-dining__card">
          <h3>Start a Group Order</h3>
          <p>Browse restaurants and invite friends to join your order</p>
          <button onClick={() => navigate('/delivery')}>Browse Restaurants</button>
        </div>
      </section>

      <section className="group-dining__bill-splitter">
        <h3>Bill Splitter</h3>
        {groupOrderItems.length === 0 ? (
          <p>No items added to your group order yet.</p>
        ) : (
          <div className="group-dining__selected-items">
            {groupOrderItems.map((item) => (
              <div key={item.id} className="group-dining__selected-item">
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

        <button onClick={handleProceed} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
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
