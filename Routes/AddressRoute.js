import express from 'express';
import {
    createAddress,
    getAddresses,
    updateAddress,
    deleteAddress
} from '../Controllers/AddressController.js';
import checkLogin from '../Middlewares/CheckLogin.js';
import { addressValidation } from '../Middlewares/Validation.js';

const addressRouter = express.Router();

addressRouter.post('/createAddress', checkLogin, addressValidation, createAddress);
addressRouter.get('/getAddress', checkLogin, addressValidation, getAddresses);
addressRouter.put('/updateAddress', checkLogin, addressValidation, updateAddress);
addressRouter.delete('/deleteAddress', checkLogin, addressValidation, deleteAddress);

export default addressRouter;
