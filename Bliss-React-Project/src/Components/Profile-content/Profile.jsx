/* eslint-disable no-unused-vars */
import React, { useContext } from 'react';
import { UserContext, useUser } from '../UserContext';
import { Link, useNavigate } from 'react-router-dom';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SettingsIcon from '@mui/icons-material/Settings';

const Profile = () => {
    const { theme,logout } = useUser();
    const navigate = useNavigate()

    const handlelogout =() => {
        logout()
        navigate('/login')
    }

    return (
        <div className={`profile-header ${theme}`}>
            <div className={`profile-section ${theme}`}>
                <Link to="/profilesection">
                    <div className={`profile-card ${theme}`}>
                        <div className="profile-details">
                            <img src="Icons/Avatar.png" alt="Avatar" />
                        </div>
                        <div className="profile-info">
                            <h1>Name</h1>
                            <h3>Email</h3>
                            <h4>View Activity</h4>
                        </div>
                    </div>
                </Link>

                {/* Account Settings */}
                <div className={`profile-category ${theme}`}>
                    <h2>Account Settings</h2>
                    <Link to="/profilesection">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/profile.png" alt="Profile" className="feature-icon" /> Profile</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                    <Link to="/appearance">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/appearance.png" alt="Appearance" className="feature-icon" /> Appearance</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                    <Link to="/profile/rating">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/rate.png" alt="Rating" className="feature-icon" /> Your Rating</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                </div>

                {/* Food Features */}
                <div className={`profile-category ${theme}`}>
                    <h2>Food Features</h2>
                    <Link to="/foodorders">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/food-order.png" alt="" className="feature-icon" /> Food Order</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                    <Link to="/eatlist">
                        <div className={`profile ${theme}`}>
                            <h3><img src="/Icons/fav-icon.png" alt="" className="feature-icon" /> My Eatlists</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                    <Link to="/groupdining">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/group.png" alt="" className="feature-icon" /> Group Dining</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                    <Link to="/orderontrain">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/train.png" alt="" className="feature-icon" /> Order on Train</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                    <Link to="/tablebooking/:id">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/table.png" alt="" className="feature-icon" /> Table Bookings</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                    <Link to="/corporatecatering">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/collab.png" alt="" className="feature-icon" /> Corporate Catering</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                     <Link to="/chefform">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/chef.png" alt="" className="feature-icon" /> Chef Form</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                    <Link to="/hiddenrestaurant">
                        <div className={`profile ${theme}`}>
                            <h3><VisibilityOffIcon className="feature-icon" /> Hidden Restaurants</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                    <Link to="/managerecommedations">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/thumbs-icon.png" alt="" className="feature-icon" /> Manage Recommendations</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                </div>

                {/* Interactive Features */}
                <div className={`profile-category ${theme}`}>
                    <h2>Interactive Features</h2>
                    <Link to="/virtucook">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/videos.png" alt="" className="feature-icon" /> VirtuCook</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                    <Link to="/taste-bot">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/kitchen.png" alt="" className="feature-icon" /> Taste Bot</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                </div>

                {/* Rewards */}
                <div className={`profile-category ${theme}`}>
                    <h2>Rewards and Collections</h2>
                    <Link to="/rewards">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/rewards.png" alt="" className="feature-icon" /> Rewards</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                    <Link to="/coupons">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/coupons.png" alt="" className="feature-icon" /> Coupons</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                    <Link to="/feedingindia">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/volunteer.png" alt="" className="feature-icon" /> Feeding India</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                </div>

                {/* Payments */}
                <div className={`profile-category ${theme}`}>
                    <h2>Payments and Subscriptions</h2>
                    <Link to="/buy-gift-card">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/voucher.png" alt="" className="feature-icon" /> Buy Gift Card</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                    <Link to="/claim-gift-card">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/coupon.png" alt="" className="feature-icon" /> Claim Gift Card</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                    <Link to="/paymentpage">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/pay.png" alt="" className="feature-icon" /> Payment Methods</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                </div>

                {/* Business */}
                <div className={`profile-category ${theme}`}>
                    <h2>Bite Bliss For Enterprise</h2>
                    <Link to="/employeespage">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/staff.png" alt="" className="feature-icon" /> For Employees</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                    <Link to="/partner">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/collab.png" alt="" className="feature-icon" /> Partner With Us</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                </div>

                {/* Support */}
                <div className={`profile-category ${theme}`}>
                    <h2>More</h2>
                    <Link to="/about">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/info.png" alt="" className="feature-icon" /> About</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                    <Link to="/feedback">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/feedback.png" alt="" className="feature-icon" /> Send Feedback</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                    <Link to="/helppage">
                        <div className={`profile ${theme}`}>
                            <h3><img src="Icons/help.png" alt="" className="feature-icon" /> Help</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                    <Link to="/settings">
                        <div className={`profile ${theme}`}>
                            <h3><SettingsIcon className="feature-icon" /> Settings</h3>
                            <KeyboardArrowRightIcon className="arrow-icon" />
                        </div>
                    </Link>
                    <div className={`profile ${theme}`} onClick={handlelogout}>
                        <h3><img src="Icons/logout.png" alt="" className="feature-icon" /> Log Out</h3>
                        <KeyboardArrowRightIcon className="arrow-icon" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
