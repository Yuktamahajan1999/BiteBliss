/* eslint-disable no-unused-vars */
import { useEffect, useReducer, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import menuData from '../data';

// Icons
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

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu');
  const [deliveryMode, setDeliveryMode] = useState('delivery');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState({});

  const cartReducer = (state, action) => {
    switch (action.type) {
      case 'ADD_ITEM': {
        const { name, price } = action.payload;
        const existingItem = state[name] || { quantity: 0, price };
        return {
          ...state,
          [name]: {
            ...existingItem,
            quantity: existingItem.quantity + 1,
          }
        };
      }
      case 'REMOVE_ITEM': {
        const { name } = action.payload;
        const existingItem = state[name];
        if (!existingItem) return state;

        if (existingItem.quantity === 1) {
          const { [name]: _, ...rest } = state;
          return rest;
        } else {
          return {
            ...state,
            [name]: {
              ...existingItem,
              quantity: existingItem.quantity - 1,
            }
          };
        }
      }
      default:
        return state;
    }
  };

  const initialCartState = {};


  const [cart, dispatch] = useReducer(cartReducer, initialCartState);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/restaurant/getRestaurantById?id=${id}`);

        const images = [];
        if (res.data.image) images.push(res.data.image);
        if (res.data.photos && Array.isArray(res.data.photos)) {
          images.push(...res.data.photos);
        }

        setRestaurant({
          ...res.data,
          images: images.length > 0 ? images : ["/default-restaurant.jpg"],
          offers: [
            { text: "No packaging charges", icon: <LocalOfferIcon /> },
            { text: "Price match guarantee", icon: <LocalOfferIcon /> },
            { text: "Frequently reordered", icon: <LocalOfferIcon /> },
            { text: "Special discounts for customers", icon: <LocalOfferIcon /> }
          ],
          deliveryTime: res.data.time || "20-30 mins",
          distance: res.data.distance || "2 km",
          fssaiNo: res.data.fssaiNumber || "10924015000015",
          description:
            res.data.description ||
            "A premium dining experience with a focus on fresh, locally-sourced ingredients. Our chefs craft each dish with care and attention to detail, ensuring every bite is memorable.",
          diningAvailability: res.data.diningAvailability ?? res.data.hasDining ?? false,
          location: res.data.address || "",
          rating: res.data.rating || 0,
          ratingCount: res.data.ratingCount || 0,
          cuisine: res.data.cuisine || [],
          reviews: res.data.reviews || [],
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

  const renderFoodTypeIcon = (type) => (
    <img
      src={type === 'veg' ? '/Icons/veg.png' : '/Icons/non veg.png'}
      alt={type}
      style={{
        width: '18px',
        height: '18px',
        marginRight: '8px',
        display: 'block'
      }}
    />
  );

  const addToCart = (itemName, price) => {
    dispatch({ type: 'ADD_ITEM', payload: { name: itemName, price } });
  };

  const removeFromCart = (itemName) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { name: itemName } });
  };


  const getTotalItems = () => Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => Object.entries(cart).reduce((sum, [, item]) => sum + (item.quantity * item.price), 0);

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
    if (deliveryMode === 'dining') return null;
    const cartItem = cart[item.name];
    if (cartItem && cartItem.quantity > 0) {
      return (
        <div className="restaurant-quantity-controls">
          <button onClick={(e) => {
            e.stopPropagation();
            removeFromCart(item.name);
          }} className="restaurant-quantity-btn"><RemoveIcon fontSize="small" /></button>
          <span>{cartItem.quantity}</span>
          <button onClick={(e) => {
            e.stopPropagation();
            addToCart(item.name, item.price);
          }} className="restaurant-quantity-btn"><AddIcon fontSize="small" /></button>
        </div>
      );
    }
    return (
      <button onClick={(e) => {
        e.stopPropagation();
        addToCart(item.name, item.price);
      }} className="restaurant-add-btn">ADD</button>
    );
  };

  const handleRestaurantInfoClick = () => {
    if (restaurant) {
      navigate(`/restaurantinfo/${restaurant._id}`);
    }
  };

  if (loading) return (
    <div className="restaurant-loading-screen">
      <div className="restaurant-spinner"></div>
      <p>Loading restaurant details...</p>
    </div>
  );

  if (!restaurant) return (
    <div className="restaurant-not-found">
      <h2>Restaurant not found</h2>
      <p>We couldn&apos;t find the restaurant you&apos;re looking for.</p>
      <button onClick={() => navigate('/')} className="restaurant-back-home-btn">Back to Home</button>
    </div>
  );

  return (
    <div className='restaurant-details-page'>
      <>
        <div className="restaurant-details-header">
          <button className="restaurant-back-button" onClick={() => navigate(-1)}><ArrowBackIosIcon fontSize="small" /></button>
          <div className="restaurant-search-bar">
            <SearchIcon className="restaurant-search-icon" />
            <input
              type="text"
              placeholder="Search within menu"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="restaurant-header-actions">
            <button className="restaurant-icon-btn" onClick={() => setIsFavorite(!isFavorite)}>
              {isFavorite ? <FavoriteIcon className="restaurant-favorite-icon" /> : <FavoriteBorderIcon />}
            </button>
          </div>
        </div>

        <div className="restaurant-delivery-toggle">
          <button
            className={`restaurant-toggle-btn ${deliveryMode === 'delivery' ? 'restaurant-toggle-active' : ''}`}
            onClick={() => setDeliveryMode('delivery')}
          >
            <span className='delivery-span'>Delivery</span>
          </button>
          {restaurant.diningAvailability && (
            <button
              className={`restaurant-toggle-btn dining-toggle-btn ${deliveryMode === 'dining' ? 'restaurant-toggle-active' : ''}`}
              onClick={() => setDeliveryMode('dining')}
            >
              <span className='dining-span'>Dining</span>
            </button>
          )}
          {(deliveryMode === 'dining' && restaurant.diningAvailability) && (
            <div className="restaurant-dining-info dining-cta">
              <Link to={`/table-booking/${id}`} className="restaurant-book-table-btn">Book a Table</Link>
            </div>
          )}
        </div>

        <div className="restaurant-hero-section">
          {restaurant.images.length > 0 && (
            <div className="restaurant-image-gallery">
              <div className="gallery-center-wrapper">
                {restaurant.images.length > 1 && (
                  <button className="restaurant-gallery-nav restaurant-gallery-prev" onClick={prevImage}>
                    <ArrowBackIosIcon fontSize="small" />
                  </button>
                )}

                {(() => {
                  const currentMedia = restaurant.images[currentImageIndex];
                  if (typeof currentMedia === "string" &&
                    (currentMedia.endsWith(".mp4") ||
                      currentMedia.endsWith(".webm") ||
                      currentMedia.endsWith(".ogg"))) {
                    return (
                      <video
                        src={currentMedia}
                        className="restaurant-gallery-media"
                        controls
                        autoPlay={false}
                        muted
                        loop
                      />
                    );
                  } else {
                    return (
                      <img
                        src={currentMedia}
                        alt={restaurant.name}
                        className="restaurant-gallery-media"
                      />
                    );
                  }
                })()}

                {restaurant.images.length > 1 && (
                  <button className="restaurant-gallery-nav restaurant-gallery-next" onClick={nextImage}>
                    <ArrowBackIosIcon fontSize="small" className="gallery-next-icon" />
                  </button>
                )}
              </div>
              {restaurant.images.length > 1 && (
                <div className="restaurant-gallery-indicator">
                  {restaurant.images.map((_, index) => (
                    <span
                      key={index}
                      className={index === currentImageIndex ? "restaurant-indicator-active" : ""}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          {restaurant.images.length > 0 && <div className="restaurant-image-overlay"></div>}
        </div>
        <div className="restaurant-info-section">
          <div onClick={handleRestaurantInfoClick} className="restaurant-info-link">
            <h1>{restaurant.name}<InfoIcon className="restaurant-info-icon" /></h1>
          </div>
          <p className="restaurant-cuisine-type">{(restaurant.cuisine || []).join(", ")}</p>
          <p className="restaurant-location"><LocationOnIcon fontSize="small" /> {restaurant.location}</p>
          <div className="restaurant-rating">
            <div className="restaurant-rating-badge">
              <StarIcon className="restaurant-star-icon" />
              <span>{restaurant.rating}</span>
            </div>
            <span className="restaurant-rating-count">({restaurant.ratingCount} ratings)</span>
          </div>
          {deliveryMode === 'delivery' ? (
            <div className="restaurant-delivery-info">
              <span><ScheduleIcon fontSize="small" /> {restaurant.deliveryTime}</span>
              <span>• {restaurant.distance}</span>
            </div>
          ) : null}
        </div>

        <div className="restaurant-about-section">
          <h3>About {restaurant.name}</h3>
          <p className={`restaurant-description ${showFullDescription['restaurant'] ? 'restaurant-description-expanded' : ''}`}>
            {restaurant.description}
          </p>
          {restaurant.description.length > 150 && (
            <button
              className="restaurant-read-more-btn"
              onClick={() => toggleDescription('restaurant')}
            >
              {showFullDescription['restaurant'] ? 'Read Less' : 'Read More'}
            </button>
          )}
        </div>

        <div className="restaurant-offers-section">
          <div className="restaurant-section-header">
            <LocalOfferIcon className="restaurant-section-icon" />
            <h3>Offers</h3>
          </div>
          <div className="restaurant-offer-tag"><LocalOfferIcon className="restaurant-offer-icon" /><span>Free Delivery</span></div>
          <div className="restaurant-offers-list">
            {restaurant.offers.map((offer, index) => (
              <div key={index} className="restaurant-offer-item">
                <span className="restaurant-offer-icon">{offer.icon}</span>
                <span>{offer.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="restaurant-group-order-banner">
          <div className="restaurant-group-icon-container">
            <GroupIcon className="restaurant-group-icon" />
          </div>
          <div className="restaurant-group-order-info">
            <h4>Start group order</h4>
          </div>
          <button className="restaurant-start-group-btn">Start</button>
        </div>

        <div className="restaurant-tabs-container">
          <div className="restaurant-tabs">
            <button className={`restaurant-tab ${activeTab === 'menu' ? 'restaurant-tab-active' : ''}`} onClick={() => setActiveTab('menu')}>
              <RestaurantIcon className="restaurant-tab-icon" />
              <span>Menu</span>
              <div className="restaurant-tab-indicator"></div>
            </button>
            <button className={`restaurant-tab ${activeTab === 'reviews' ? 'restaurant-tab-active' : ''}`} onClick={() => setActiveTab('reviews')}>
              <RateReviewIcon className="restaurant-tab-icon" />
              <span>Reviews</span>
              <div className="restaurant-tab-indicator"></div>
            </button>
          </div>
        </div>

        {activeTab === 'menu' && (
          <div className="restaurant-menu-section">
            <div className="restaurant-menu-columns">
              <div className="restaurant-categories-column">
                {menuData.categories.map(category => (
                  <div
                    key={category.name}
                    className={`restaurant-category-item ${selectedCategory === category.name ? 'restaurant-category-active' : ''}`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    {category.name}
                    {selectedCategory === category.name && <div className="restaurant-category-indicator"></div>}
                  </div>
                ))}
              </div>
              <div className="restaurant-items-column">
                {displayCategories.map(category => (
                  <div key={category.name} className="restaurant-category-items">
                    <h3 className="restaurant-category-title">{category.name}</h3>
                    <p className="restaurant-category-description">{category.description}</p>
                    {category.items.map(item => (
                      <div key={item.name} className="restaurant-menu-item" onClick={() => toggleDescription(item.name)}>
                        <div className="restaurant-item-details">
                          <div className="restaurant-item-type">
                            {renderFoodTypeIcon(item.type)}
                            <h4 className="restaurant-item-name">{item.name}</h4>
                            {item.highlyReordered && <div className="restaurant-highlight-tag">Popular</div>}
                          </div>
                          <p className="restaurant-item-price">₹{item.price}</p>
                          <p className={`restaurant-item-description ${showFullDescription[item.name] ? 'restaurant-description-expanded' : ''}`}>
                            {item.description}
                          </p>
                          {item.description.length > 80 && (
                            <button
                              className="restaurant-read-more-btn restaurant-read-more-small"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDescription(item.name);
                              }}
                            >
                              {showFullDescription[item.name] ? 'Read Less' : 'Read More'}
                            </button>
                          )}
                        </div>
                        <div className="restaurant-item-actions">
                          {item.image && <img src={item.image} alt={item.name} className="restaurant-item-image" />}
                          {renderCartButton(item)}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="restaurant-reviews-section">
            <div className="restaurant-overall-rating">
              <div className="restaurant-rating-circle">
                <StarIcon className="restaurant-big-star" />
                <span>{restaurant.rating}</span>
              </div>
              <p>Based on {restaurant.ratingCount || 0} reviews</p>
            </div>
            <div className="restaurant-review-filters">
              <button className="restaurant-filter-btn restaurant-filter-active">All</button>
              <button className="restaurant-filter-btn">5 Star</button>
              <button className="restaurant-filter-btn">4 Star</button>
              <button className="restaurant-filter-btn">3 Star</button>
              <button className="restaurant-filter-btn">2 Star</button>
              <button className="restaurant-filter-btn">1 Star</button>
            </div>
            <div className="restaurant-review-list">
              {restaurant.reviews?.length > 0 ? (
                restaurant.reviews.map(review => (
                  <div key={review.id} className="restaurant-review-item">
                    <div className="restaurant-review-header">
                      <div className="restaurant-reviewer">
                        <img src={review.userImage || "/default-user.png"} alt={review.userName} />
                        <div>
                          <span className="restaurant-reviewer-name">{review.userName}</span>
                          <span className="restaurant-review-date">{review.date}</span>
                        </div>
                      </div>
                      <div className="restaurant-review-rating">
                        <StarIcon className="restaurant-small-star" />
                        <span>{review.rating}</span>
                      </div>
                    </div>
                    <p className="restaurant-review-text">{review.text}</p>
                    <div className="restaurant-review-actions">
                      <button className="restaurant-like-btn">Helpful</button>
                      <button className="restaurant-comment-btn">Comment</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="restaurant-no-reviews">
                  <StarIcon className="restaurant-empty-star" />
                  <h4>No reviews yet</h4>
                  <p>Be the first to review this restaurant</p>
                  <button className="restaurant-write-review-btn">Write a Review</button>
                </div>
              )}
            </div>
          </div>
        )}

        {getTotalItems() > 0 && (
          <div className="restaurant-cart-summary">
            <div className="restaurant-cart-total">
              <span className="restaurant-item-count">{getTotalItems()} {getTotalItems() === 1 ? 'ITEM' : 'ITEMS'}</span>
              <span className="restaurant-total-price">₹{getTotalPrice()}</span>
              <span className="restaurant-view-cart" onClick={() => { navigate('/foodorders') }}>View Cart</span>
            </div>
            <div className="restaurant-cart-buttons">
              {deliveryMode === 'delivery' ? (
                <button className="restaurant-checkout-btn">PROCEED TO CHECKOUT</button>
              ) : null}
            </div>
          </div>
        )}

        <div className="restaurant-footer-section">
          <div className="restaurant-footer-content">
            <div className="restaurant-footer-part">
              <h4>About {restaurant.name}</h4>
              <p>Part of Bite Bliss Plastic-Free Future Program</p>
              <p>FSSAI License No: {restaurant.fssaiNo}</p>
            </div>
            <div className="restaurant-footer-part">
              <h4>Menu Information</h4>
              <p>• Menu items, nutritional information and prices are set directly by the restaurant</p>
              <p>• Nutritional information values displayed are indicative</p>
              <p>• An average active adult requires 2,000 kcal energy per day</p>
            </div>
          </div>
          <div className="restaurant-footer-bottom">
            <p>© 2025 Bite Bliss. All rights reserved.</p>
          </div>
        </div>
      </>
    </div>
  );
};

export default RestaurantDetails;