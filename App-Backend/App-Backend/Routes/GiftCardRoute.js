import express from 'express';
import {
    createGiftCard,
    claimGiftCard,
    applyCoupon,
    getUserPreferences,
} from '../Controllers/GiftCardController.js';
import checkLogin from '../Middlewares/CheckLogin.js';

const giftcardrouter = express.Router();

giftcardrouter.post('/create', checkLogin, createGiftCard);
giftcardrouter.post('/claim', checkLogin, claimGiftCard);
giftcardrouter.post('/user/apply-coupon', checkLogin, applyCoupon);
giftcardrouter.get('/user/preferences', checkLogin, getUserPreferences);

export default giftcardrouter;
