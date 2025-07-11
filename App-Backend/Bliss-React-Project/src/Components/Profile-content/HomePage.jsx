// eslint-disable-next-line no-unused-vars
import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    return (
        <div className="bitebliss-container">
            <nav className="bitebliss-navbar">
                <h1 className="bitebliss-logo">🍴 Bite Bliss</h1>
                <div className="bitebliss-auth-buttons">
                    <button className="login-btn" onClick={() => navigate('/login')}>Login</button>
                    <button className="signup-btn" onClick={() => navigate('/signup')}>Signup</button>
                </div>
            </nav>

            <section className="bitebliss-hero">
                <h2>Welcome to Bite Bliss</h2>
                <div className="bitebliss-hero-content">
                    <p className="bitebliss-hero-description">Your one-stop platform for delicious food, recipes, and culinary adventures! Whether you&apos;re a seasoned chef or just starting out, Bite Bliss brings you handpicked recipes, restaurant deals, and exciting food experiences tailored for every craving.</p>
                    <p className="bitebliss-hero-subtext">From curated recipe collections to on-the-go meal solutions, we help you discover new flavors, master cooking techniques, and enjoy effortless dining at your favorite spots.</p>
                </div>
            </section>

            <section className="bitebliss-feature-section">
                <h3 className="bitebliss-feature-title">Our Features</h3>
                <div className="bitebliss-feature-grid">
                    <div className="bitebliss-feature-card">
                        <span className="bitebliss-feature-icon">🍳</span>
                        <h3>VirtuCook</h3>
                        <p>Interactive cooking experiences with step-by-step guidance</p>
                    </div>
                    <div className="bitebliss-feature-card">
                        <span className="bitebliss-feature-icon">📖</span>
                        <h3>Recipe Book</h3>
                        <p>Explore thousands of curated recipes from around the world</p>
                    </div>
                    <div className="bitebliss-feature-card">
                        <span className="bitebliss-feature-icon">👥</span>
                        <h3>Group Dining</h3>
                        <p>Plan and book meals with friends and family</p>
                    </div>
                    <div className="bitebliss-feature-card">
                        <span className="bitebliss-feature-icon">🚆</span>
                        <h3>Order on Train</h3>
                        <p>Get food delivered right to your train seat</p>
                    </div>
                    <div className="bitebliss-feature-card">
                        <span className="bitebliss-feature-icon">👨‍🍳</span>
                        <h3>Corporate Catering</h3>
                        <p>Meal solutions for your office and events</p>
                    </div>
                    <div className="bitebliss-feature-card">
                        <span className="bitebliss-feature-icon">🤖</span>
                        <h3>TasteBot</h3>
                        <p>AI-powered features including Quick Fix Meals and Famous Dishes</p>
                    </div>
                </div>
            </section>

            <footer className="bitebliss-footer">
                <p>&copy; {currentYear} Bite Bliss. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default HomePage;