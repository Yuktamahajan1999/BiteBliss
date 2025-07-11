/* eslint-disable no-unused-vars */
import React from "react";
import FooterLinks from "./FooterLinks";
import Bottom from "./BottomBar";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-mobile-logo">
        <img 
          src="/Icons/bitebliss.jpeg"
          alt="Bite Bliss Logo" 
          className="footer-logo" 
        />
      </div>

      <div className="footer-desktop-content">
        <div className="footer-container">
          <FooterLinks />
          <Bottom currentYear={currentYear} />
        </div>
      </div>
    </footer>
  );
};

export default Footer;