/* eslint-disable no-unused-vars */
import React from "react";
import { countries, languages, quickLinks } from "../data";


const FooterLinks = () => {
   

    return (
        <div className="footer-links">
            <div className="footer-dropdown-section">
                <div className="footer-dropdowns">
                    <div className="footer-dropdown">
                        <button className="footer-dropdown-btn" aria-label="Select country">
                            <i className="fas fa-flag"></i>
                            <span>Country</span>
                            <i className="fas fa-chevron-down dropdown-arrow"></i>
                        </button>
                        <ul className="footer-dropdown-menu">
                            {countries.map((country, index) => (
                                <li key={`country-${index}`}>
                                    <a className="dropdown-item" href="#">
                                        <img 
                                            src={country.flag} 
                                            alt={country.name} 
                                            className="flag-icon" 
                                        />
                                        {country.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-dropdown">
                        <button className="footer-dropdown-btn" aria-label="Select language">
                            <i className="fas fa-language"></i>
                            <span>Language</span>
                            <i className="fas fa-chevron-down dropdown-arrow"></i>
                        </button>
                        <ul className="footer-dropdown-menu">
                            {languages.map((lang, index) => (
                                <li key={`lang-${index}`}>
                                    <a className="dropdown-item" href="#">
                                        <img 
                                            src={lang.icon} 
                                            alt={lang.name} 
                                            className="language-icon" 
                                        />
                                        {lang.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {quickLinks.map((section, index) => (
                <div className="footer-quick-links" key={`links-${index}`}>
                    <h3 className="footer-links-title">{section.title}</h3>
                    <ul className="footer-links-list">
                        {section.links.map((link, linkIndex) => (
                            <li key={`link-${index}-${linkIndex}`}>
                                <a href={link.url} className="footer-link">
                                    {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default FooterLinks;