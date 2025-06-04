// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import SearchIcon from '@mui/icons-material/Search';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import RateReviewIcon from '@mui/icons-material/RateReview';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import InfoIcon from '@mui/icons-material/Info';
import axios from 'axios';
import menuData from '../data';

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [activeTab, setActiveTab] = useState('menu');
  const [deliveryMode, setDeliveryMode] = useState('delivery');
  const [searchQuery, setSearchQuery] = useState('');
  const [ setHasOrderedBefore] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState({});
  const [isScrolled] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/restaurant/getRestaurantById?id=${id}`);

        setRestaurant({
          ...res.data,
          images: [
            res.data.image || "/default-restaurant.jpg",
            "/restaurant-interior.jpg",
            "/restaurant-food.jpg"
          ],
          offers: [
            { text: "No packaging charges", icon: <LocalOfferIcon /> },
            { text: "Price match guarantee", icon: <LocalOfferIcon /> },
            { text: "Frequently reordered", icon: <LocalOfferIcon /> },
            { text: "Special discounts for customers", icon: <LocalOfferIcon /> }
          ],
          deliveryTime: "20-30 mins",
          distance: "2 km",
          fssaiNo: "10924015000015",
          description: "A premium dining experience with a focus on fresh, locally-sourced ingredients. Our chefs craft each dish with care and attention to detail, ensuring every bite is memorable."
        });
        
        if (menuData.categories.length > 0) {
          setSelectedCategory(menuData.categories[0].name);
        }
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);


  const addToCart = (itemName, price) => {
    setCart(prev => ({
      ...prev,
      [itemName]: {
        quantity: (prev[itemName]?.quantity || 0) + 1,
        price
      }
    }));
    setHasOrderedBefore(true);
  };

  const removeFromCart = (itemName) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemName]) {
        if (newCart[itemName].quantity > 1) {
          newCart[itemName].quantity -= 1;
        } else {
          delete newCart[itemName];
        }
      }
      return newCart;
    });
  };

  const getTotalItems = () => Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => Object.entries(cart).reduce((sum, [_, item]) => sum + (item.quantity * item.price), 0);

  const filteredCategories = menuData.categories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  const displayCategories = searchQuery 
    ? filteredCategories 
    : filteredCategories.filter(cat => cat.name === selectedCategory);

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev === restaurant.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? restaurant.images.length - 1 : prev - 1));
  };

  const toggleDescription = (itemName) => {
    setShowFullDescription(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const renderCartButton = (item) => {
    const cartItem = cart[item.name];
    if (cartItem && cartItem.quantity > 0) {
      return (
        <div className="quantity-controls">
          <button onClick={(e) => {
            e.stopPropagation();
            removeFromCart(item.name);
          }} className="quantity-btn"><RemoveIcon fontSize="small" /></button>
          <span>{cartItem.quantity}</span>
          <button onClick={(e) => {
            e.stopPropagation();
            addToCart(item.name, item.price);
          }} className="quantity-btn"><AddIcon fontSize="small" /></button>
        </div>
      );
    }
    return (
      <button onClick={(e) => {
        e.stopPropagation();
        addToCart(item.name, item.price);
      }} className="add-btn">ADD</button>
    );
  };

  const handleRestaurantInfoClick = () => {
    if (restaurant) {
      navigate(`/restaurantinfo/${restaurant._id}`);
    }
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading restaurant details...</p>
    </div>
  );
  
  if (!restaurant) return (
    <div className="not-found">
      <h2>Restaurant not found</h2>
      <p>We couldn&apos;t find the restaurant you&apos;re looking for.</p>
      <button onClick={() => navigate('/')} className="back-home-btn">Back to Home</button>
    </div>
  );

  return (
    <div className='restaurant-page'>
      {/* Fixed Header on Scroll */}
      <div className={`fixed-header ${isScrolled ? 'visible' : ''}`}>
        <div className="header-content">
          <button className="back-button" onClick={() => navigate(-1)}><ArrowBackIosIcon fontSize="small" /></button>
          <h3>{restaurant.name}</h3>
        </div>
      </div>

      {/* Header */}
      <div className="restaurant-header">
        <button className="back-button" onClick={() => navigate(-1)}><ArrowBackIosIcon fontSize="small" /></button>
        <div className="search-bar">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search within menu"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => setIsFavorite(!isFavorite)}>
            {isFavorite ? <FavoriteIcon className="favorite-icon" /> : <FavoriteBorderIcon />}
          </button>
        </div>
      </div>

      {/* Delivery Toggle */}
      <div className="delivery-toggle">
        <button className={`toggle-btn ${deliveryMode === 'delivery' ? 'active' : ''}`} onClick={() => setDeliveryMode('delivery')}>
          <span>Delivery</span>
          {deliveryMode === 'delivery' && <div className="active-indicator"></div>}
        </button>
        {restaurant.hasDining && (
          <button className={`toggle-btn ${deliveryMode === 'dining' ? 'active' : ''}`} onClick={() => setDeliveryMode('dining')}>
            <span>Dining</span>
            {deliveryMode === 'dining' && <div className="active-indicator"></div>}
          </button>
        )}
      </div>

      {/* Hero Section */}
      <div className="restaurant-hero">
        <div className="restaurant-image-gallery">
          <img src={restaurant.images[currentImageIndex]} alt={restaurant.name} className="gallery-image" />
          {restaurant.images.length > 1 && (
            <>
              <button className="gallery-nav prev" onClick={prevImage}><ArrowBackIosIcon fontSize="small" /></button>
              <button className="gallery-nav next" onClick={nextImage}><ArrowBackIosIcon fontSize="small" style={{ transform: 'rotate(180deg)' }} /></button>
              <div className="gallery-indicator">
                {restaurant.images.map((_, index) => (
                  <span key={index} className={index === currentImageIndex ? 'active' : ''} />
                ))}
              </div>
            </>
          )}
          <div className="image-overlay"></div>
        </div>
        <div className="restaurant-info">
          <div onClick={handleRestaurantInfoClick} className="info-link">
            <h1>{restaurant.name}<InfoIcon className="info-icon" /></h1>
          </div>
          <p className="cuisine-type">{restaurant.cuisine}</p>
          <p className="location"><LocationOnIcon fontSize="small" /> {restaurant.location}</p>
          <div className="rating">
            <div className="rating-badge">
              <StarIcon className="star-icon" />
              <span>{restaurant.rating}</span>
            </div>
            <span className="rating-count">({restaurant.ratingCount} ratings)</span>
          </div>
          {deliveryMode === 'delivery' ? (
            <div className="delivery-info">
              <span><ScheduleIcon fontSize="small" /> {restaurant.deliveryTime}</span>
              <span>• {restaurant.distance}</span>
            </div>
          ) : (
            restaurant.hasDining && (
              <div className="dining-info">
                <Link to={`/table-booking/${id}`} className="book-table-btn">Book a Table</Link>
              </div>
            )
          )}
        </div>
      </div>

      {/* About Section */}
      <div className="about-section">
        <h3>About {restaurant.name}</h3>
        <p className={`restaurant-description ${showFullDescription['restaurant'] ? 'expanded' : ''}`}>
          {restaurant.description}
        </p>
        {restaurant.description.length > 150 && (
          <button 
            className="read-more-btn" 
            onClick={() => toggleDescription('restaurant')}
          >
            {showFullDescription['restaurant'] ? 'Read Less' : 'Read More'}
          </button>
        )}
      </div>

      {/* Offers */}
      <div className="offers-section">
        <div className="section-header">
          <LocalOfferIcon className="section-icon" />
          <h3>Offers</h3>
        </div>
        <div className="offer-tag"><LocalOfferIcon className="offer-icon" /><span>Free Delivery</span></div>
        <div className="offers-list">
          {restaurant.offers.map((offer, index) => (
            <div key={index} className="offer-item">
              <span className="offer-icon">{offer.icon}</span>
              <span>{offer.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Group Order */}
      <div className="group-order-banner">
        <div className="group-icon-container">
          <GroupIcon className="group-icon" />
        </div>
        <div className="group-order-info">
          <h4>Start group order</h4>
        </div>
        <button className="start-group-btn">Start</button>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button className={`tab ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
            <RestaurantIcon className="tab-icon" />
            <span>Menu</span>
            <div className="tab-indicator"></div>
          </button>
          <button className={`tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
            <RateReviewIcon className="tab-icon" />
            <span>Reviews</span>
            <div className="tab-indicator"></div>
          </button>
        </div>
      </div>

      {/* Menu */}
      {activeTab === 'menu' && (
        <div className="menu-section">
          <div className="menu-columns">
            <div className="categories-column">
              {menuData.categories.map(category => (
                <div 
                  key={category.name} 
                  className={`category-item ${selectedCategory === category.name ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {category.name}
                  {selectedCategory === category.name && <div className="category-indicator"></div>}
                </div>
              ))}
            </div>
            <div className="items-column">
              {displayCategories.map(category => (
                <div key={category.name} className="category-items">
                  <h3 className="category-title">{category.name}</h3>
                  <p className="category-description">{category.description}</p>
                  {category.items.map(item => (
                    <div key={item.name} className="menu-item" onClick={() => toggleDescription(item.name)}>
                      <div className="item-details">
                        <div className="item-type">
                          {item.type === 'veg' ? 
                           <img src="/Icons/veg.png" alt="Veg" className="veg-icon" /> :
                           <img src="/Icons/non veg.png" alt="Non-Veg" className="non-veg-icon" />
                          }
                        </div>
                        <div className="item-text">
                          <h4>{item.name}</h4>
                          {item.highlyReordered && <div className="highlight-tag">Popular</div>}
                          <p className="item-price">₹{item.price}</p>
                          <p className={`item-description ${showFullDescription[item.name] ? 'expanded' : ''}`}>
                            {item.description}
                          </p>
                          {item.description.length > 80 && (
                            <button 
                              className="read-more-btn small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDescription(item.name);
                              }}
                            >
                              {showFullDescription[item.name] ? 'Read Less' : 'Read More'}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="item-actions">
                        {item.image && <img src={item.image} alt={item.name} className="item-image" />}
                        {deliveryMode === 'delivery' && renderCartButton(item)}
                        {deliveryMode === 'dining' && restaurant.hasDining && (
                          <Link to={`/table-booking/${id}`}>
                            <button className="book-table-btn">Book Table</button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews */}
      {activeTab === 'reviews' && (
        <div className="reviews-section">
          <div className="overall-rating">
            <div className="rating-circle">
              <StarIcon className="big-star" />
              <span>{restaurant.rating}</span>
            </div>
            <p>Based on {restaurant.reviewCount || 0} reviews</p>
          </div>
          <div className="review-filters">
            <button className="filter-btn active">All</button>
            <button className="filter-btn">5 Star</button>
            <button className="filter-btn">4 Star</button>
            <button className="filter-btn">3 Star</button>
            <button className="filter-btn">2 Star</button>
            <button className="filter-btn">1 Star</button>
          </div>
          <div className="review-list">
            {restaurant.reviews?.length > 0 ? (
              restaurant.reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="reviewer">
                      <img src={review.userImage || "/default-user.png"} alt={review.userName} />
                      <div>
                        <span className="reviewer-name">{review.userName}</span>
                        <span className="review-date">{review.date}</span>
                      </div>
                    </div>
                    <div className="review-rating">
                      <StarIcon className="small-star" />
                      <span>{review.rating}</span>
                    </div>
                  </div>
                  <p className="review-text">{review.text}</p>
                  <div className="review-actions">
                    <button className="like-btn">Helpful</button>
                    <button className="comment-btn">Comment</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-reviews">
                <StarIcon className="empty-star" />
                <h4>No reviews yet</h4>
                <p>Be the first to review this restaurant</p>
                <button className="write-review-btn">Write a Review</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart Summary */}
      {getTotalItems() > 0 && (
        <div className="cart-summary slide-up">
          <div className="cart-total">
            <span className="item-count">{getTotalItems()} {getTotalItems() === 1 ? 'ITEM' : 'ITEMS'}</span>
            <span className="total-price">₹{getTotalPrice()}</span>
            <span className="view-cart" onClick={() => {/* Navigate to cart */}}>View Cart</span>
          </div>
          <div className="cart-buttons">
            {deliveryMode === 'delivery' ? (
              <button className="checkout-btn">PROCEED TO CHECKOUT</button>
            ) : (
              <Link to={`/table-booking/${id}`}>
                <button className="book-table-btn">BOOK TABLE</button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Book Table Only */}
      {getTotalItems() === 0 && deliveryMode === 'dining' && restaurant.hasDining && (
        <div className="cart-summary slide-up">
          <Link to={`/table-booking/${id}`}>
            <button className="book-table-btn full-width">BOOK TABLE</button>
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="restaurant-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>About {restaurant.name}</h4>
            <p>Part of Bite Bliss Plastic-Free Future Program</p>
            <p>FSSAI License No: {restaurant.fssaiNo}</p>
          </div>
          <div className="footer-section">
            <h4>Menu Information</h4>
            <p>• Menu items, nutritional information and prices are set directly by the restaurant</p>
            <p>• Nutritional information values displayed are indicative</p>
            <p>• An average active adult requires 2,000 kcal energy per day</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Bite Bliss. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;