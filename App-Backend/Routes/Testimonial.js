import express from 'express';
import {
  createTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial
} from '../Controllers/Testimonial.js';
import checkLogin from '../Middlewares/CheckLogin.js';
import checkRole from '../Middlewares/CheckRole.js';

const testimonialRouter = express.Router();
testimonialRouter.post('/', checkLogin, createTestimonial);
testimonialRouter.get('/getAlltestimonial', getAllTestimonials);
testimonialRouter.get('/gettestimonial', checkLogin, getTestimonialById);
testimonialRouter.put('/updatetestimonial', checkLogin, updateTestimonial);
testimonialRouter.delete('/deletetestimonial', checkLogin, deleteTestimonial);

export default testimonialRouter;
