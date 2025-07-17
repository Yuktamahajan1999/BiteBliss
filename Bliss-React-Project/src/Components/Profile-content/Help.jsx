/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import {
  FiHelpCircle, FiMail, FiPhone, FiMessageSquare,
  FiClock, FiChevronDown, FiShoppingBag,
  FiCreditCard, FiTruck, FiX, FiSend
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getSocket} from "../socket";

function HelpPage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const toggleTopic = (index) => {
    setActiveTopic(activeTopic === index ? null : index);
  };
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.token) {
      toast.error("Please login to access support chat");
      return;
    }

    getSocket(user.token).then(socket => {
      socketRef.current = socket;

      socketRef.current.on("connect", () => {
        setSocketConnected(true);
        const userId = user._id || user.id;
        socketRef.current.emit("join", {
          userId,
          role: "user"
        });
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("Connection error:", err.message);
        setSocketConnected(false);
        toast.error("Chat service unavailable. Trying to reconnect...");
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
        setSocketConnected(false);
      });

      socketRef.current.on("chatMessage", (message) => {
        setMessages(prev => {
          if (prev.some(m => m._id === message._id || m.tempId === message.tempId)) {
            return prev;
          }
          return [
            ...prev,
            {
              ...message,
              key: message._id || `${message.sender}-${Date.now()}`,
              timestamp: new Date(message.createdAt || Date.now()).toLocaleTimeString()
            }
          ];
        });
      });
    });

    return () => {
      if (socketRef.current) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?._id) {
          socketRef.current.emit("leaveRoom", { userId: user._id });
        }
        socketRef.current.off("connect");
        socketRef.current.off("connect_error");
        socketRef.current.off("disconnect");
        socketRef.current.off("chatMessage");
        socketRef.current.disconnect();
      }
      setMessages([]);
    };
  }, []);


  useEffect(() => {
    if (!showChat) return;

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id || user?.id;
    if (!userId) return;

    const loadMessages = async () => {
      try {
        console.log("📥 Loading chat history for user:", userId);
        const res = await fetch(`http://localhost:8000/chat/chatmessage?userId=${userId}`);
        const data = await res.json();
        console.log("✅ Chat history loaded:", data);

        setMessages(data.map(m => ({
          ...m,
          key: m._id,
          timestamp: new Date(m.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        })));
      } catch (err) {
        console.error("❌ Failed to load chat history:", err);
        setMessages([]);
      }
    };

    loadMessages();
  }, [showChat]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      toast.warning("Please enter a message");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      toast.error("Please login to send messages");
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const message = {
      userId: user._id || user.id,
      sender: "user",
      text: newMessage,
      tempId
    };

    setMessages(prev => [...prev, {
      ...message,
      key: tempId,
      timestamp: new Date().toLocaleTimeString()
    }]);

    socketRef.current.emit("chatMessage", message);
    setNewMessage('');
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
      id: 1,
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
      id: 2,
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
      id: 3,
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
          {topics.map((topic) => (
            <div
              key={topic.id}
              className={`topic-card ${activeTopic === topic.id ? 'active' : ''}`}
            >
              <button
                className="topic-header"
                onClick={() => toggleTopic(topic.id)}
              >
                <div className="topic-icon">{topic.icon}</div>
                <div className="topic-title-wrap">
                  <h3 className="topic-title">{topic.title}</h3>
                  <p className="topic-desc">{topic.shortDesc}</p>
                </div>
                <FiChevronDown
                  className={`chevron ${activeTopic === topic.id ? 'open' : ''}`}
                />
              </button>

              {activeTopic === topic.id && (
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
                messages.map((message, index) => (
                  <div
                    key={message.key || message._id || `${message.sender}-${index}`}
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
              <button
                className="close-chat"
                onClick={() => {
                  setShowChat(false);
                  setMessages([]);
                  if (socketRef.current) {
                    const user = JSON.parse(localStorage.getItem("user"));
                    socketRef.current.emit("leaveChat", { userId: user._id });
                  }
                }}
              >
                <FiX />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default HelpPage;