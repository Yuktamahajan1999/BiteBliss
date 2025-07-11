import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaTrain, FaShoppingBag } from "react-icons/fa";
import { toast } from "react-toastify";

const OrderOnTrain = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [trainDetails, setTrainDetails] = useState({
    pnr: "",
    trainNumber: "",
    station: "",
    instructions: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!state?.cart?.items || state.cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderPlaced(true);
      navigate('/paymentpage', {
        state: {
          ...state.cart,
          orderType: 'train',
          trainDetails
        }
      });
    }, 1000);
  };

  return (
    <div className="order-train-container">
      <h2><FaTrain /> Order Food on Train</h2>

      {orderPlaced ? (
        <div className="order-success">
          <div className="success-icon">✓</div>
          <h3>Order Placed Successfully!</h3>
          <p>Your meal will be delivered to your seat.</p>
          <button 
            className="new-order-btn"
            onClick={() => setOrderPlaced(false)}
          >
            Place New Order
          </button>
        </div>
      ) : (
        <>
          {state?.cart?.items?.length > 0 && (
            <div className="train-order-items">
              <h3><FaShoppingBag /> Your Order</h3>
              <ul>
                {state.cart.items.map((item, index) => (
                  <li key={index}>
                    {item.name} × {item.quantity} - ₹{(item.price * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
              <p>Restaurant: {state.cart.restaurant?.name}</p>
            </div>
          )}

          <form className="order-train-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>PNR Number</label>
              <input
                type="text"
                value={trainDetails.pnr}
                onChange={(e) =>
                  setTrainDetails({ ...trainDetails, pnr: e.target.value })
                }
                required
                pattern="[A-Za-z0-9]{10}"
              />
            </div>

            <div className="form-group">
              <label>Train Number</label>
              <input
                type="text"
                value={trainDetails.trainNumber}
                onChange={(e) =>
                  setTrainDetails({
                    ...trainDetails,
                    trainNumber: e.target.value
                  })
                }
                required
                pattern="[0-9]{5}"
              />
            </div>

            <div className="form-group">
              <label>Delivery Station</label>
              <input
                type="text"
                value={trainDetails.station}
                onChange={(e) =>
                  setTrainDetails({
                    ...trainDetails,
                    station: e.target.value
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Special Instructions</label>
              <textarea
                placeholder="Optional"
                rows="3"
                maxLength="140"
                value={trainDetails.instructions}
                onChange={(e) =>
                  setTrainDetails({
                    ...trainDetails,
                    instructions: e.target.value
                  })
                }
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={isSubmitting ? "submitting" : ""}
            >
              {isSubmitting ? "Processing..." : "Proceed to Payment"}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default OrderOnTrain;
