import mongoose from 'mongoose';
import Cart from '../Models/CartModel.js';
import Restaurant from '../Models/Restaurant.js';

export const addToCart = async (req, res) => {
    try {
        const { restaurantId, itemName, price, quantity } = req.body;
        const userId = req.user.id;

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

        const menuItems = restaurant.menu.flatMap(cat => cat.items);
        const selectedItem = menuItems.find(item => item.name === itemName);
        if (!selectedItem) return res.status(404).json({ message: 'Item not found' });

        let cart = await Cart.findOne({ userId });
        
        if (cart && String(cart.restaurant?.id) !== String(restaurantId)) {
            await Cart.deleteOne({ userId });
            cart = null;
        }

        if (!cart) {
            cart = new Cart({
                userId,
                restaurant: {
                    id: restaurant._id,
                    name: restaurant.name,
                    location: restaurant.address
                },
                items: []
            });
        }

        const itemIndex = cart.items.findIndex(item => item.name === itemName);
        if (itemIndex >= 0) {
            cart.items[itemIndex].quantity += quantity || 1;
        } else {
            cart.items.push({
                itemId: new mongoose.Types.ObjectId(),
                name: selectedItem.name,
                price: selectedItem.price,
                quantity: quantity || 1
            });
        }

        await cart.save();
        res.status(200).json({
            ...cart.toObject(),
            restaurant: {
                _id: cart.restaurant.id,
                name: cart.restaurant.name,
                location: cart.restaurant.location
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { restaurantId } = req.query;

        let cart = await Cart.findOne({ userId });
        
        if (!cart || (cart.restaurant && String(cart.restaurant.id) !== String(restaurantId))) {
            return res.status(200).json({
                userId,
                restaurant: null,
                items: []
            });
        }

        res.status(200).json({
            ...cart.toObject(),
            restaurant: {
                _id: cart.restaurant.id,
                name: cart.restaurant.name,
                location: cart.restaurant.location
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const removeItemFromCart = async (req, res) => {
    try {
        const { itemName } = req.body;
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter(item => item.name !== itemName);
        await cart.save();

        res.status(200).json({
            ...cart.toObject(),
            restaurant: {
                _id: cart.restaurant?.id,
                name: cart.restaurant?.name,
                location: cart.restaurant?.location
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        await Cart.deleteOne({ userId });
        res.status(200).json({ 
            userId,
            restaurant: null,
            items: [],
            message: 'Cart cleared' 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateItemQuantity = async (req, res) => {
    try {
        const { itemName, quantity } = req.body; 
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const item = cart.items.find(item => item.name === itemName);
        if (!item) return res.status(404).json({ message: 'Item not found in cart' });

        if (quantity <= 0) {
            cart.items = cart.items.filter(item => item.name !== itemName);
        } else {
            item.quantity = quantity;
        }

        await cart.save();
        res.status(200).json({
            ...cart.toObject(),
            restaurant: {
                _id: cart.restaurant.id,
                name: cart.restaurant.name,
                location: cart.restaurant.location
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};