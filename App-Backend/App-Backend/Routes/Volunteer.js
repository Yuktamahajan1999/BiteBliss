import express from 'express';
import {
  createVolunteer,
  getAllVolunteers,
  getVolunteerById,
  updateVolunteer,
  deleteVolunteer
} from '../Controllers/VolunteerController.js';
import checkLogin from '../Middlewares/CheckLogin.js';

const volunteerRouter = express.Router();


volunteerRouter.post('/', createVolunteer);
volunteerRouter.get('/getAllvolunteer', checkLogin, getAllVolunteers);
volunteerRouter.get('/getvolunteer', checkLogin, getVolunteerById);
volunteerRouter.put('/updatevolunteer', checkLogin, updateVolunteer);
volunteerRouter.delete('/deletevolunteer', checkLogin, deleteVolunteer);

export default volunteerRouter;
