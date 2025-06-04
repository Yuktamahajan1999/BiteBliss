/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { socialLinks, appStores, paymentMethods } from "../data";

const Bottom = ({ currentYear }) => {
  return (
    <div className="footer-bottom">
      <div className="footer-divider"></div>

      <div className="footer-bottom-content">
        <div className="footer-copyright">
          <p>&copy; {currentYear} Bite Bliss™ Ltd. All rights reserved.</p>
        </div>
        
        <div className="footer-social-apps">
          <div className="footer-social-links">
            {socialLinks.map((social, index) => (
              <a 
                key={`social-${index}`}
                href={social.link} 
                className="footer-social-link"
                aria-label={social.name}
              >
                <img 
                  src={social.icon} 
                  alt={social.name} 
                  className="social-icon" 
                />
              </a>
            ))}
          </div>

          <div className="footer-app-stores">
            {appStores.map((store, index) => (
              <a 
                key={`store-${index}`}
                href={store.link} 
                className="footer-app-link"
                aria-label={store.alt}
              >
                <img 
                  src={store.src} 
                  alt={store.alt} 
                  className="footer-app-image" 
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-payment-methods">
        {paymentMethods.map((method, index) => (
          <img 
            key={`payment-${index}`}
            src={method.icon} 
            alt={method.name} 
            className="payment-icon"
          />
        ))}
      </div>
    </div>
  );
};

export default Bottom;