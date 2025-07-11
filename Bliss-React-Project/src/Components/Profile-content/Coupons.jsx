/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {
  FaPercentage,
  FaTruck,
  FaRegSmile,
  FaPlusCircle,
  FaClock,
  FaFire
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const iconMap = {
  FaPercentage: <FaPercentage />,
  FaTruck: <FaTruck />,
  FaRegSmile: <FaRegSmile />,
  FaPlusCircle: <FaPlusCircle />,
  FaClock: <FaClock />
};

const Coupons = ({ subtotal = 0 }) => {
  const [coupons, setCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState('');

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data } = await axios.get('http://localhost:8000/coupons/allCoupons');
        setCoupons(data);
      } catch {
        setCoupons([]);
      }
    };
    fetchCoupons();

    const fetchAppliedCoupons = async () => {
      const token = localStorage.getItem('token');
      try {
        const { data } = await axios.get(
          `http://localhost:8000/coupons/getCoupons`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (data.length > 0) {
          setAppliedCoupon(data[0].code); 
        }
      } catch {
        setAppliedCoupon('');
      }
    };
    fetchAppliedCoupons();
  }, []);

  const handleApply = async (code, minOrder) => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        'http://localhost:8000/coupons/applyCoupon',
        { userId, code, orderAmount: subtotal },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAppliedCoupon(code);
      toast.success(`Coupon "${code}" applied!`, { autoClose: 1000 });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to apply coupon');
    }
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
        {coupons.map((coupon, index) => {
          const isEligible = !coupon.minOrder || subtotal >= coupon.minOrder;
          return (
            <div className="coupon-card" key={index}>
              {coupon.tag && (
                <div className="coupon-tag" style={{ backgroundColor: coupon.color }}>
                  <FaFire className="tag-icon" />
                  {coupon.tag}
                </div>
              )}
              <div className="coupon-icon-wrapper" style={{ color: coupon.color }}>
                {iconMap[coupon.icon] || <FaPercentage />}
              </div>
              <div className="coupon-details">
                <h3 className="coupon-title">{coupon.title}</h3>
                <p className="coupon-description">{coupon.description}</p>
                <div className="coupon-code-wrapper">
                  <span className="coupon-code">
                    Use code: <strong>{coupon.code}</strong>
                  </span>
                  <button
                    className="apply-button"
                    disabled={appliedCoupon === coupon.code || !isEligible}
                    onClick={() => handleApply(coupon.code, coupon.minOrder)}
                  >
                    {appliedCoupon === coupon.code ? "Applied" : isEligible ? "Apply" : `Min order ₹${coupon.minOrder}`}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Coupons;