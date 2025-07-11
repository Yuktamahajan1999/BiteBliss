/* eslint-disable no-unused-vars */
import React from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SearchBar from "./Search";
import Navbar from "./Navbar";
import Menu from "./Menu";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";

const Header = () => {

  const { user, logout } = useUser();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const profileLinks = [
    {
      icon: <AccountCircleIcon className="profile-icon" />,
      link: "/profile",
      text: "Profile",
      className: "profile-nav-link",
    },
  ];


  const authButtons = user
    ? [
      {
        text: "Logout",
        onClick: handleLogout,
        className: "logout-btn"
      }
    ]
    : [
      { text: "LogIn", link: "/login", className: "login-btn" },
      { text: "SignUp", link: "/signup", className: "signup-btn" }
    ];
  const menuLinks = [
    {
      icon: <img src="/Icons/delivery-bike.png" alt="Delivery" className="icon" />,
      text: "Delivery",
      to: "/delivery",
    },
    {
      icon: <img src="/Icons/dining-room.png" alt="Dining" className="icon" />,
      text: "Dining",
      to: "/dining",
    },
  ];

  return (
    <header className="header-box">
      <nav className="header-container">
        <div className="navbar-header">
          <Navbar links={profileLinks} buttons={authButtons} />
        </div>

        <SearchBar
          SearchItem="Search for Restaurants, Cuisines, or Dishes"
          showLocationBar={false}
          showSearchBar={true}
        />

        <Menu links={menuLinks} />
      </nav>
    </header>
  );
};

export default Header;
