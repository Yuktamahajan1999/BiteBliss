/* eslint-disable no-unused-vars */
import React from 'react'
const Rating = () => {
  return (
    <div className='rating-container'>
      <div className='food-boy-icon'>
        <img src="/Icons/food-boy.webp" alt="" className='food-boy' />
      </div>
      <hr className='rating-divider' />
      <div className='rating-intro-container'>
        <div className='rating-header'>
          <img src="/Icons/rating.png" alt="" className='tip-icon' />
        </div>
        <div className='rating-intro'>
          <h2>Understanding your rating</h2>
          <p className="intro-text">
            Your <strong>Bite Bliss</strong> rating reflects your interactions with delivery partners.
            A high rating means smoother deliveries, exclusive perks, and happier experiences!
          </p>
        </div>
      </div>
      <hr className='rating-divider' />
      <div>
        <div className='tip-card-container'>
          <div className='tip-card'>
            <h4>Short wait times</h4>
            <p>Ensure your address and instructions are accurate to minimize drop-off delays and make the delivery smooth and efficient.</p>
          </div>
          <div><img src="/Icons/delivery-bike.png" alt="" className='tip-icon' /></div>
        </div>
      </div>
      <hr className='rating-divider' />
      <div className="courtesy-container">
        <div>
          <img src="/Icons/food-recieve.jpg" alt="" className='tip-icon' />
        </div>
        <div className='tip-card'>
          <h4>Courtesy Matters</h4>
          <p>A smile or thank you makes a delivery partner’s day brighter.</p>
        </div>
      </div>
      <hr className='rating-divider' />
      <div className='generosity-container'>
        <div className='tip-card'>
          <h4>Generosity</h4>
          <p>If possible, offer a tip to show appreciation for the dedication of the delivery partner and their effort in delivering your meal.</p>
        </div>
        <div>
          <img src="/Icons/food-tip.jpg" alt="" className='tip-icon' />
        </div>
      </div>
      <hr className='rating-divider' />
      <div className='rating-calculation'>
        <div>
          <img src="/Icons/user-rating.avif" alt="" className='tip-icon' />
        </div>
        <div className='tip-card'>
          <h4>How Your Rating is calculated</h4>
          <p>Your rating is the average of scores given by delivery partners after completing at least five orders, reflecting your overall interaction and impact on their experience.</p>
          <p>A high rating shows the joy you bring to each delivery experience—thanks for spreading positivity! Your thoughtful interactions inspire smiles and make Bite Bliss truly blissful.</p>
        </div>
      </div>
      <hr className='rating-divider' />
      <div className='btn-container'>
        <button className="rating-btn" aria-label="Confirm and close rating section">Okay</button>
      </div>
    </div>
  )
}

export default Rating;
