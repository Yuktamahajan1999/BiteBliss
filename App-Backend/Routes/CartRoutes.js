import express from 'express';
import {
  addToCart,
  removeItemFromCart,
  getCart,
  clearCart,
  updateItemQuantity
} from '../Controllers/CartController.js';
import checkLogin from '../Middlewares/CheckLogin.js';

const Cartrouter = express.Router();

// Add item to cart
Cartrouter.post('/addtocart', checkLogin, addToCart);

// Remove item from cart
Cartrouter.delete('/removefromcart', checkLogin, removeItemFromCart);

// Get current cart
Cartrouter.get('/getcart', checkLogin, getCart);

// Clear entire cart
Cartrouter.delete('/clearcart', checkLogin, clearCart);

// Update quantity of an item
Cartrouter.put('/updatecart', checkLogin, updateItemQuantity);

export default Cartrouter;
