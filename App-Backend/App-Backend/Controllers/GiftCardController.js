import { GiftCard, UserPreference } from '../Models/UserModal.js';
import mongoose from 'mongoose';

// Utility to generate a 16-character alphanumeric card code
const generateCardCode = (length = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Create a new gift card
export const createGiftCard = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, occasion, message } = req.body;

        let cardCode;
        do {
            cardCode = generateCardCode();
        } while (await GiftCard.findOne({ cardCode }));

        const pin = Math.random().toString().slice(2, 8); 
        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + 1); 

        const newCard = await GiftCard.create({
            cardCode,
            redeemedBy: null,
            pin,
            expirationDate,
            amount,
            occasion,
            message,
        });

        return res.status(201).json({
            message: 'Gift Card Created',
            cardCode,
            pin,
            amount,
            expirationDate,
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create gift card' });
    }
};


// Claim a gift card
export const claimGiftCard = async (req, res) => {
    try {
        const userId = req.user.id;
        const { cardCode, pin } = req.body;

        const card = await GiftCard.findOne({ cardCode });

        if (!card) return res.status(404).json({ error: 'Card not found' });
        if (card.pin !== pin)
            return res.status(403).json({ error: 'Invalid PIN' });

        if (card.redeemedAt)
            return res.status(400).json({ error: 'Gift card already redeemed' });


        if (new Date() > card.expirationDate)
            return res.status(400).json({ error: 'Gift card expired' });

        card.redeemedBy = userId;
        card.redeemedAt = new Date();
        await card.save();
        return res.status(200).json({ message: 'Gift card claimed successfully!' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to claim gift card' });
    }
};

// Save coupon to user preference
export const applyCoupon = async (req, res) => {
    try {
        const userId = req.user.id;
        const { code } = req.body;

        const updated = await UserPreference.findOneAndUpdate(
            { user: userId },
            { $addToSet: { appliedCoupons: { code } } },
            { new: true, upsert: true }
        );

        return res.status(200).json({ message: 'Coupon applied!', coupons: updated.appliedCoupons });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to apply coupon' });
    }
};

// Get user preferences
export const getUserPreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const preferences = await UserPreference.findOne({ user: userId });

        return res.status(200).json(preferences || {});
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch user preferences' });
    }
};
