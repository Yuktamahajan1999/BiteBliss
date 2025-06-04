import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrash2, FiHeart } from 'react-icons/fi';

const ManageRecommendations = () => {
  const [myRecommendations, setMyRecommendations] = useState([]);
  const [friendRecommendations, setFriendRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [myRes, friendRes] = await Promise.all([
          axios.get("http://localhost:8000/recommend", { headers }),
          // axios.get("http://localhost:8000/recommend/friends", {
          //   headers: { Authorization: `Bearer ${token}` },
          // })
        ]);

        setMyRecommendations(myRes.data);

        const formattedFriendRecs = friendRes.data.map(rec => ({
          id: rec._id,
          name: rec.restaurantId?.name || "Unnamed",
          cuisine: rec.restaurantId?.cuisine || "N/A",
          location: rec.restaurantId?.location || "Unknown",
          recommendedBy: rec.recommendedBy?.name || "Friend",
          liked: rec.liked,
        }));

        setFriendRecommendations(formattedFriendRecs);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [token]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/recommend/deleteRecommend?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMyRecommendations(prev => prev.filter(rec => rec._id !== id));
    } catch (error) {
      console.error('Error deleting recommendation:', error);
    }
  };

  const toggleLike = async (id, isFriend) => {
    const list = isFriend ? friendRecommendations : myRecommendations;
    const rec = list.find(r => r._id === id || r.id === id);
    const updatedLiked = !rec?.liked;

    try {
      await axios.put(`http://localhost:8000/recommend/updateRecommend?id=${id}`, { liked: updatedLiked }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (isFriend) {
        setFriendRecommendations(prev =>
          prev.map(r => r.id === id ? { ...r, liked: updatedLiked } : r)
        );
      } else {
        setMyRecommendations(prev =>
          prev.map(r => r._id === id ? { ...r, liked: updatedLiked } : r)
        );
      }
    } catch (err) {
      console.error('Error updating like:', err);
    }
  };

  if (loading) return <p>Loading recommendations...</p>;

  return (
    <div className="recommendations-container">
      <header className="recommendations-header">
        <h1>🍽️ Manage Recommendations</h1>
        <p>Save and organize your favorite dining spots</p>
      </header>

      <section className="recommendations-section">
        <h2>Your Recommendations</h2>
        {myRecommendations.length > 0 ? (
          <div className="cards-container">
            {myRecommendations.map(rec => (
              <div className="recommendation-card" key={rec._id}>
                <div className="card-content">
                  <h3>{rec.restaurantId?.name || "Unnamed"}</h3>
                  <p className="details">
                    {rec.restaurantId?.cuisine || "N/A"} • {rec.restaurantId?.location || "Unknown"}
                  </p>
                </div>
                <div className="card-actions">
                  <button
                    className={`like-btn ${rec.liked ? 'liked' : ''}`}
                    onClick={() => toggleLike(rec._id, false)}
                  >
                    <FiHeart />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(rec._id)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">No recommendations added yet</p>
        )}
      </section>

      <section className="recommendations-section">
        <h2>Friend Recommendations</h2>
        {friendRecommendations.length > 0 ? (
          <div className="cards-container">
            {friendRecommendations.map(rec => (
              <div className="recommendation-card" key={rec.id}>
                <div className="card-content">
                  <h3>{rec.name}</h3>
                  <p className="details">{rec.cuisine} • {rec.location}</p>
                  <p className="recommended-by">Recommended by: {rec.recommendedBy}</p>
                </div>
                <div className="card-actions">
                  <button
                    className={`like-btn ${rec.liked ? 'liked' : ''}`}
                    onClick={() => toggleLike(rec.id, true)}
                  >
                    <FiHeart />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">No recommendations from friends</p>
        )}
      </section>
    </div>
  );
};

export default ManageRecommendations;
