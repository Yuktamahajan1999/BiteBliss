/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import {
  FaUtensils,
  FaShippingFast,
  FaHeadset,
  FaHeartbeat,
  FaUserTie,
  FaQuoteLeft,
  FaTimes,
} from 'react-icons/fa';

const EmployeesPage = () => {
  const [activeForm, setActiveForm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    resume: null,
  });

  const handleApplyClick = (position) => {
    setActiveForm(position);
    setFormData((prev) => ({ ...prev, position }));
  };

  const handleCloseForm = () => {
    setActiveForm(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, resume: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Application for ${formData.position} submitted successfully!`);
    setActiveForm(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      experience: '',
      resume: null,
    });
  };

  return (
    <div className="employees-container">
      <header className="employees-header">
        <div className="header-content">
          <h1>Join Our Team at Bite Bliss</h1>
          <p className="subtitle">Where passion for food meets opportunities for growth</p>
          <div className="header-icon">🍳</div>
        </div>
      </header>

      <div className="content-wrapper">
        {/* Benefits */}
        <section className="employees-benefits">
          <h2 className="section-title">
            <FaHeartbeat className="icon" /> Why Work With Us?
          </h2>
          <div className="benefits-grid">
            {[
              { icon: '🍕', title: 'Free Meals & Discounts', desc: 'Enjoy delicious meals on us and exclusive employee discounts' },
              { icon: '📈', title: 'Career Growth', desc: 'Clear promotion paths and leadership opportunities' },
              { icon: '🧠', title: 'Skill Development', desc: 'Regular training programs to enhance your skills' },
              { icon: '🏖️', title: 'Paid Time Off', desc: 'Generous vacation and personal days' },
              { icon: '🎉', title: 'Team Events', desc: 'Monthly celebrations and team-building activities' },
              { icon: '🩺', title: 'Health Benefits', desc: 'Comprehensive medical coverage for you and family' },
            ].map((item, i) => (
              <div key={i} className="benefit-card">
                <div className="benefit-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Health & Wellness */}
        <section className="employees-health-benefits">
          <h2 className="section-title">
            <FaHeartbeat className="icon" /> Health & Wellness
          </h2>
          <p className="section-intro">
            We prioritize your well-being with comprehensive health benefits designed to support you and your family.
          </p>
          <div className="health-benefits-grid">
            <div className="health-card">
              <div className="health-icon"><FaHeartbeat /></div>
              <h3>Medical Insurance</h3>
              <p>Full coverage for you and dependents</p>
            </div>
            <div className="health-card">
              <div className="health-icon">🏥</div>
              <h3>Accident Coverage</h3>
              <p>Protection for unexpected emergencies</p>
            </div>
            <div className="health-card">
              <div className="health-icon">💊</div>
              <h3>Telemedicine</h3>
              <p>24/7 access to doctors online</p>
            </div>
            <div className="health-card">
              <div className="health-icon">🩺</div>
              <h3>Health Checkups</h3>
              <p>Annual physicals and screenings</p>
            </div>
          </div>
        </section>

        {/* Career Growth */}
        <section className="employees-career">
          <h2 className="section-title">
            <FaUserTie className="icon" /> Career Growth
          </h2>
          <div className="career-content">
            <p>
              At Bite Bliss, we believe in nurturing talent. From delivery agents to kitchen staff and managers,
              we offer structured growth paths and internal promotions. 
            </p>
            <div className="career-path">
              {[
                { role: 'Entry Level', duration: '0-6 months' },
                { role: 'Team Lead', duration: '6-18 months' },
                { role: 'Supervisor', duration: '1.5-3 years' },
                { role: 'Management', duration: '3+ years' }
              ].map((item, idx) => (
                <div className="path-item" key={idx}>
                  <h4>{item.role}</h4>
                  <p>{item.duration}</p>
                  {idx < 3 && <div className="path-arrow">→</div>} 
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* Openings */}
        <section className="employees-openings">
          <h2 className="section-title">Current Openings</h2>
          <div className="openings-grid">
            {[
              {
                icon: <FaShippingFast />,
                title: 'Delivery Partner',
                details: ['Flexible shift options', 'Own vehicle preferred', 'Competitive mileage reimbursement'],
              },
              {
                icon: <FaUtensils />,
                title: 'Kitchen Assistant',
                details: ['Food prep experience preferred', 'Learn from professional chefs', 'Morning and evening shifts available'],
              },
              {
                icon: <FaHeadset />,
                title: 'Customer Support',
                details: ['Excellent communication skills', 'Problem-solving mindset', 'Full-time and part-time positions'],
              },
            ].map((job, idx) => (
              <div key={idx} className="opening-card">
                <div className="opening-icon">{job.icon}</div>
                <h3>{job.title}</h3>
                <ul className="opening-details">
                  {job.details.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
                <button className="apply-btn" onClick={() => handleApplyClick(job.title)}>Apply Now</button>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="employees-testimonials">
          <h2 className="section-title">Our Team Stories</h2>
          <div className="testimonials-grid">
            {[
              {
                text: 'Working at Bite Bliss helped me grow from a delivery boy to a supervisor. The training programs and supportive management made all the difference.',
                author: 'Rahul Patel',
                role: 'Delivery Team Supervisor',
                avatar: 'R',
              },
              {
                text: "The work culture is amazing - supportive, friendly, and always focused on growth. I've learned so much in the kitchen here.",
                author: 'Neha Sharma',
                role: 'Lead Kitchen Assistant',
                avatar: 'N',
              },
            ].map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <FaQuoteLeft className="quote-icon" />
                <p className="testimonial-text">&quot;{testimonial.text}&quot;</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.avatar}</div>
                  <div className="author-info">
                    <h4>{testimonial.author}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modal Form */}
      {activeForm && (
        <div className="application-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={handleCloseForm}>
              <FaTimes />
            </button>
            <h3>Apply for {activeForm}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Position</label>
                <input type="text" name="position" value={activeForm} readOnly />
              </div>
              <div className="form-group">
                <label>Relevant Experience</label>
                <textarea name="experience" value={formData.experience} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Upload Resume</label>
                <input type="file" onChange={handleFileChange} />
              </div>
              <button type="submit" className="submit-btn">Submit Application</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
