/* eslint-disable no-unused-vars */
import React, { useState } from "react";

const OrderOnTrain = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderPlaced(true);
    }, 1500);
  };

  return (
    <div className="order-train-container">
      <h2 className="order-train-title">🚆 Order Food on Train</h2>
      <p className="order-train-desc">
        Traveling by train? Enjoy hot meals delivered to your seat!
      </p>

      {orderPlaced ? (
        <div className="order-success">
          <div className="success-icon">✓</div>
          <h3>Order Placed Successfully!</h3>
          <p>Your meal will be delivered to your seat.</p>
          <button 
            className="new-order-btn"
            onClick={() => setOrderPlaced(false)}
          >
            Place New Order
          </button>
        </div>
      ) : (
        <form className="order-train-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="text" 
              placeholder="Enter PNR Number" 
              required 
              pattern="[A-Za-z0-9]{10}"
              title="10 character PNR number"
            />
          </div>
          
          <div className="form-group">
            <input 
              type="text" 
              placeholder="Train Number" 
              required 
              pattern="[0-9]{5}"
              title="5 digit train number"
            />
          </div>
          
          <div className="form-group">
            <input 
              type="text" 
              placeholder="Station Name" 
              required 
            />
          </div>
          
          <div className="form-group">
            <textarea 
              placeholder="Special Instructions (optional)" 
              rows="3" 
              maxLength="140"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={isSubmitting ? "submitting" : ""}
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </button>
        </form>
      )}
    </div>
  );
};

export default OrderOnTrain;