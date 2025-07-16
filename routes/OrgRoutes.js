import express from "express";
import {register, login, getAllUsers, editOrg, deleteReport, updateReport, deleteOrg, deleteUser, suspendUser, reactivateUser} from "../controllers/OrgController.js";
import { authMiddleware, requireOrg} from "../middleware/middleware.js";

const router = express.Router();

router.post("", register);
router.post("/session", login);
router.get("", authMiddleware, requireOrg, getAllUsers);
router.put("/:id", authMiddleware, requireOrg, editOrg);
router.delete("/:id", authMiddleware, requireOrg, deleteOrg);
router.delete("/reports/:reportId", authMiddleware, requireOrg, deleteReport);
router.patch("/reports/:reportId", authMiddleware, requireOrg, updateReport);

// Nuovi endpoint per gestione utenti
router.delete("/users/:userId", authMiddleware, requireOrg, deleteUser);
router.patch("/users/:userId/suspend", authMiddleware, requireOrg, suspendUser);
router.patch("/users/:userId/reactivate", authMiddleware, requireOrg, reactivateUser);

export default router;