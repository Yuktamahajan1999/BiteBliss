/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import SearchBar from './Search';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';

const Navbar = ({ logo, links, buttons }) => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-location">
                    <SearchBar showLocationBar={true} showSearchBar={false} />
                </div>
                <div className="navbar-actions">
                    <ul className="navbar-links">
                        {links.map((link, index) => (
                            <li key={index}>
                                {link.onClick ? (
                                    <div className="navbar-link" onClick={link.onClick} style={{ cursor: 'pointer' }}>
                                        {link.icon}
                                        <h4>{link.text}</h4>
                                    </div>
                                ) : (
                                    <Link to={link.link} className="navbar-link">
                                        {link.icon}
                                        <h4>{link.text}</h4>
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>

                    <div className="navbar-buttons">
                        {buttons.map((button, index) => (
                            button.onClick ? (
                                <Button
                                    key={index}
                                    onClick={button.onClick}
                                    className={`btn btn-outline-info ${button.className}`}
                                >
                                    {button.text}
                                </Button>
                            ) : (
                                <Link to={button.link} key={index} className="btn-link">
                                    <Button className={`btn btn-outline-info ${button.className}`}>
                                        {button.text}
                                    </Button>
                                </Link>
                            )
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
