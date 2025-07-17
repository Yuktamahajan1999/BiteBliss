/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrash2, FiHeart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ManageRecommendations = () => {
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const myRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/recommend`, { headers });
        const formattedMyRecs = myRes.data.map(rec => ({
          id: rec._id,
          restaurantId: rec.restaurantId?._id || rec.restaurantId,
          name: rec.restaurantId?.name || "Unnamed",
          image: rec.restaurantId?.image || "",
          cuisine: Array.isArray(rec.restaurantId?.cuisine) ? rec.restaurantId.cuisine.join(', ') : "N/A",
          location: rec.restaurantId?.address || rec.restaurantId?.location || "Unknown",
          time: rec.restaurantId?.time || "",
          liked: rec.liked,
          isRecommendation: true,
        }));
        const freqRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/recommend/frequent`, { headers });
        const formattedFreq = freqRes.data.map(item => ({
          id: item.id,
          restaurantId: item.id,
          name: item.name || "Unnamed",
          image: item.image || "",
          cuisine: Array.isArray(item.cuisine) ? item.cuisine.join(', ') : item.cuisine || "N/A",
          location: item.address || item.location || "Unknown",
          time: item.time || "",
          liked: false,
          isRecommendation: false,
        }));
        const existingIds = new Set(formattedMyRecs.map(r => r.restaurantId));
        const filteredFreq = formattedFreq.filter(fr => !existingIds.has(fr.restaurantId));

        setAllRestaurants([...formattedMyRecs, ...filteredFreq]);
      } catch (error) {
        console.error("Error fetching data:", error);
        setAllRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleDelete = async (id, isRecommendation) => {
    if (isRecommendation) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/recommend/deleteRecommend?id=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error("Delete error:", error);
      }
    }

    setAllRestaurants(prev => prev.filter(r => r.id !== id));
  };

  const toggleLike = async (rec) => {
    const updatedLiked = !rec.liked;

    try {
      if (rec.isRecommendation) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/recommend/updateRecommend?id=${rec.id}`,
          { liked: updatedLiked },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setAllRestaurants(prev =>
          prev.map(r => r.id === rec.id ? { ...r, liked: updatedLiked } : r)
        );
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/recommend/create`,
          { restaurantId: rec.restaurantId, rating: 5, liked: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const newRec = response.data.recommendation;

        setAllRestaurants(prev =>
          prev.map(r =>
            r.id === rec.id
              ? {
                ...r,
                id: newRec._id,
                liked: true,
                isRecommendation: true,
              }
              : r
          )
        );
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  if (loading) return <p>Loading recommendations...</p>;

  return (
    <div className="recommend-container">
      <header className="recommend-header">
        <h1>🍽️ Manage Recommendations</h1>
        <p>Save and organize your favorite dining spots</p>
      </header>

      <section className="recommend-section">
        <h2>Your Recommendations</h2>
        {allRestaurants.length > 0 ? (
          <div className="recommend-cards">
            {allRestaurants.map(rec => (
              <div className="recommend-card" key={rec.id}>
                <div
                  className="recommend-card-link"
                  onClick={() => navigate(`/restaurantdetails/${rec.restaurantId}`)}
                >
                  <h3>{rec.name}</h3>
                  {rec.image && <img src={rec.image} alt={rec.name} className="recommend-card-image" />}
                  <p className="recommend-card-detail">{rec.cuisine}</p>
                  <p className="recommend-card-detail">{rec.location}</p>
                  {rec.time && <p className="recommend-card-detail">{rec.time}</p>}
                </div>

                <div className="recommend-card-actions">
                  <button
                    className={`recommend-like-btn ${rec.liked ? 'liked' : ''}`}
                    onClick={() => toggleLike(rec)}
                  >
                    <FiHeart />
                  </button>
                  <button
                    className="recommend-delete-btn"
                    onClick={() => handleDelete(rec.id, rec.isRecommendation)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="recommend-empty">No recommendations added yet</p>
        )}
      </section>
    </div>
  );
};

export default ManageRecommendations;
