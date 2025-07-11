import express from "express"
import { getChatMessages, getChatUsers } from "../Controllers/ChatController.js"

const chatRouter = express.Router()

chatRouter.get('/chatmessage',getChatMessages)

chatRouter.get('/chatusers', getChatUsers); 


export  default chatRouter;