import express from "express";
import {register, login, deleteUser, editUser} from "../controllers/UserController.js";
import { authMiddleware } from "../middleware/middleware.js"; 



const router = express.Router();

router.post("", register);
router.post("/session", login);
//router.post("/logout", authMiddleware, logout); 
router.delete("/:id", authMiddleware, deleteUser);
router.put("/:id", authMiddleware, editUser);


export default router;