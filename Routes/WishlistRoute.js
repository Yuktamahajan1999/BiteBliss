import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} from '../Controllers/WishlistController.js';
import checkLogin from '../Middlewares/CheckLogin.js';
import checkRole from '../Middlewares/CheckRole.js';

const Wishlistrouter = express.Router();

Wishlistrouter.get('/', checkLogin,checkRole(["user"]), getWishlist);
Wishlistrouter.post('/addtowishlist', checkLogin,checkRole(["user"]), addToWishlist);
Wishlistrouter.delete('/removefromwishlist', checkLogin,checkRole(["user"]), removeFromWishlist);

export default Wishlistrouter;
