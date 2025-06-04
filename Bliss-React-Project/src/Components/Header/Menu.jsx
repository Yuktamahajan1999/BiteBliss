/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react'
import { Link } from 'react-router-dom'

const Menu = ({ links }) => {
    return (
        <div className='menu-navbar'>
            <div className='menu-container'>
                {links.map((link, index) => (
                    <Link to={link.to} key={index} className='menu-link'>
                        {link.icon}
                        <h4>{link.text}</h4>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Menu
