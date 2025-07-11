/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import {
  FaPercentage,
  FaTruck,
  FaRegSmile,
  FaPlusCircle,
  FaClock,
  FaFire
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const coupons = [
  {
    title: 'Flat 20% Off',
    description: 'Get 20% off on orders above ₹500',
    code: 'FLAT20',
    icon: <FaPercentage />,
    color: '#FF7043',
    tag: 'Popular'
  },
  {
    title: 'Free Delivery',
    description: 'No delivery charge on your first 3 orders',
    code: 'DELIVERYFREE',
    icon: <FaTruck />,
    color: '#5C6BC0'
  },
  {
    title: 'First Order Special',
    description: 'Enjoy a sweet 25% off on your first order',
    code: 'WELCOME25',
    icon: <FaRegSmile />,
    color: '#66BB6A'
  },
  {
    title: 'Buy 1 Get 1 Free',
    description: 'Applicable on select meals only',
    code: 'BOGOBLISS',
    icon: <FaPlusCircle />,
    color: '#EC407A'
  },
  {
    title: 'Limited Time Deal',
    description: 'Hurry! Offer valid only till midnight',
    code: 'MIDNIGHT50',
    icon: <FaClock />,
    color: '#26C6DA',
    tag: 'Expiring Soon'
  }
];

const Coupons = () => {
  const [appliedCoupon, setAppliedCoupon] = useState('');

  const handleApply = (code) => {
    setAppliedCoupon(code);
  
    toast.success(
      `✅ You’ve applied coupon: "${code}". Proceed to checkout!`,
      {
        position: 'top-right',
        autoClose: 1000,
      }
    );
  };
  

  return (
    <div className="coupons-page">
      <div className="coupons-header">
        <h1 className="coupons-title">Available Coupons & Deals</h1>
        <p className="coupons-subtitle">
          Save more on every order with these exciting offers!
        </p>
      </div>

      <div className="coupons-grid">
        {coupons.map((coupon, index) => (
          <div className="coupon-card" key={index}>
            {coupon.tag && (
              <div className="coupon-tag" style={{ backgroundColor: coupon.color }}>
                {coupon.tag === 'Expiring Soon' && <FaFire className="tag-icon" />}
                {coupon.tag}
              </div>
            )}
            <div className="coupon-icon-wrapper" style={{ color: coupon.color }}>
              {coupon.icon}
            </div>
            <div className="coupon-details">
              <h3 className="coupon-title">{coupon.title}</h3>
              <p className="coupon-description">{coupon.description}</p>
              <div className="coupon-code-wrapper">
                <span className="coupon-code">
                  Use code: <strong>{coupon.code}</strong>
                </span>
                <button className="apply-button" onClick={() => handleApply(coupon.code)}>
                  Apply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Coupons;
