/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { 
  FiHelpCircle, FiMail, FiPhone, FiMessageSquare, 
  FiClock, FiChevronDown, FiShoppingBag, 
  FiCreditCard, FiTruck, FiX, FiSend
} from 'react-icons/fi';

function HelpPage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const toggleTopic = (index) => {
    setActiveTopic(activeTopic === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I place an order?",
      answer: "Browse restaurants, add items to cart, select delivery address, choose payment method, and confirm your order. You'll receive an order confirmation via email/SMS."
    },
    {
      question: "Can I cancel or modify my order?",
      answer: "Orders cannot be modified once placed. Cancellations are only possible within 1 minute of ordering. After preparation begins, cancellations may not be possible."
    },
    {
      question: "How long does delivery take?",
      answer: "Delivery times vary (typically 30-45 mins) based on restaurant preparation time, distance, and traffic. You can track real-time status in your orders section."
    },
    {
      question: "What if my order is delayed?",
      answer: "If your order is significantly delayed, please contact support. We may provide compensation depending on the circumstances."
    },
    {
      question: "How do I apply a promo code?",
      answer: "Add items to cart, then enter your promo code in the 'Apply Promo' field before checkout. Valid codes will show discount immediately."
    },
    {
      question: "What if items are missing from my order?",
      answer: "Contact support immediately with your order number. We'll investigate and may refund missing items or offer credit."
    },
    {
      question: "How do I track my delivery?",
      answer: "Go to 'My Orders' to see real-time tracking with delivery partner details and live location (when available)."
    },
    {
      question: "What are your delivery hours?",
      answer: "Delivery hours vary by restaurant, typically 8AM-11PM. Some locations offer 24/7 delivery for select restaurants."
    },
    {
      question: "How do I change my delivery address?",
      answer: "Address can only be changed before placing order. After ordering, contact support immediately - changes may not be possible if preparation has started."
    }
  ];

  const topics = [
    {
      title: "Ordering Process",
      icon: <FiShoppingBag />,
      shortDesc: "Learn how to place and manage your food orders",
      fullContent: (
        <div className="topic-content">
          <ol>
            <li>Browse restaurants and menu items</li>
            <li>Customize your meal (if options available)</li>
            <li>Review your cart and apply promo codes</li>
            <li>Select delivery address and time</li>
            <li>Choose payment method and confirm order</li>
          </ol>
          <p>Note: Orders cannot be modified after placement.</p>
        </div>
      )
    },
    {
      title: "Payment Options",
      icon: <FiCreditCard />,
      shortDesc: "Information about accepted payment methods",
      fullContent: (
        <div className="topic-content">
          <ul>
            <li>Credit/Debit Cards (Visa, Mastercard)</li>
            <li>UPI Payments (GPay)</li>
            <li>Net Banking</li>
            <li>Cash on Delivery (availability shown at checkout)</li>
          </ul>
          <p>All payments are securely processed with encryption.</p>
        </div>
      )
    },
    {
      title: "Delivery Information",
      icon: <FiTruck />,
      shortDesc: "Track orders and understand delivery times",
      fullContent: (
        <div className="topic-content">
          <ul>
            <li>Standard delivery: 30-45 minutes (most orders)</li>
            <li>Express delivery: 20-30 minutes (select restaurants)</li>
            <li>Scheduled delivery: Choose future time slots</li>
            <li>Live tracking: Follow your delivery in real-time</li>
          </ul>
          <p>Delivery fees vary based on distance and restaurant.</p>
        </div>
      )
    }
  ];

  const contactMethods = [
    {
      icon: <FiMail />,
      title: "Email Support",
      details: "team@bitebliss.com",
      response: "Typically replies within 10 minutes.",
      action: "Send Email",
      onClick: () => window.location.href = 'mailto:team@bitebliss.com?subject=Bite%20Bliss%20Support'
    },
    {
      icon: <FiPhone />,
      title: "Phone Support",
      details: "+91 98765 43210",
      response: "Available 24/7",
      action: "Call Now",
      onClick: () => window.location.href = 'tel:+919876543210'
    },
    {
      icon: <FiMessageSquare />,
      title: "Live Chat",
      details: "In-app messaging",
      response: "Instant connection",
      action: "Start Chat",
      onClick: () => setShowChat(true)
    }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    
    const userMessage = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, userMessage]);
    setNewMessage('');
    
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: "Thanks for your message! Our support team will respond shortly.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <div className="help-page">
      <div className="help-hero">
        <div className="help-tag">
          <FiHelpCircle /> How can we help?
        </div>
        <h1>Welcome to Bite Bliss Help Center</h1>
        <p className="help-subtitle">
          Find answers to common questions or get in touch with our support team for personalized assistance.
        </p>
      </div>

      <div className="topics-section">
        <h2 className="section-title">Popular Help Topics</h2>
        <div className="topics-accordion">
          {topics.map((topic, index) => (
            <div 
              key={index} 
              className={`topic-card ${activeTopic === index ? 'active' : ''}`}
            >
              <button 
                className="topic-header"
                onClick={() => toggleTopic(index)}
              >
                <div className="topic-icon">{topic.icon}</div>
                <div className="topic-title-wrap">
                  <h3 className="topic-title">{topic.title}</h3>
                  <p className="topic-desc">{topic.shortDesc}</p>
                </div>
                <FiChevronDown className={`chevron ${activeTopic === index ? 'open' : ''}`} />
              </button>
              
              {activeTopic === index && (
                <div className="topic-expanded">
                  {topic.fullContent}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="faq-section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${activeFaq === index ? 'active' : ''}`}
              onClick={() => toggleFaq(index)}
            >
              <button className="faq-button">
                <h3 className="faq-question">{faq.question}</h3>
                <FiChevronDown className="faq-icon" />
              </button>
              {activeFaq === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="contact-section">
        <h2 className="section-title">Direct Support Channels</h2>
        <p className="contact-description">
          Our team is available 24/7 to help with any issues. Average response time is under 15 minutes.
        </p>
        
        <div className="contact-grid">
          {contactMethods.map((method, index) => (
            <div key={index} className="contact-card">
              <div className="contact-icon">{method.icon}</div>
              <h3 className="contact-method">{method.title}</h3>
              <p className="contact-detail">{method.details}</p>
              <div className="contact-response">
                <FiClock /> {method.response}
              </div>
              <button 
                className="contact-button" 
                onClick={method.onClick}
              >
                {method.action}
              </button>
            </div>
          ))}
        </div>

        {showChat && (
          <div className="chat-container">
            <div className="chat-header">
              <h3>Bite Bliss Support Chat</h3>
              <button 
                className="close-chat" 
                onClick={() => setShowChat(false)}
              >
                <FiX />
              </button>
            </div>
            
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="empty-chat">
                  <p>Hello! How can we help you today?</p>
                  <div className="chat-quick-questions">
                    <button onClick={() => setNewMessage("How do I cancel my order?")}>
                      How to cancel order?
                    </button>
                    <button onClick={() => setNewMessage("My order is late")}>
                      My order is late
                    </button>
                    <button onClick={() => setNewMessage("Wrong items delivered")}>
                      Wrong items received
                    </button>
                  </div>
                </div>
              ) : (
                messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`message ${message.sender}`}
                  >
                    <div className="message-content">
                      <p>{message.text}</p>
                      <span className="timestamp">{message.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                required
              />
              <button type="submit">
                <FiSend />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default HelpPage;