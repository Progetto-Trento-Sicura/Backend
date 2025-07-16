import express from "express";
import {createReport, deleteReport, getReport, getAllReports, updateReport, getUserOnlyReports, getMyReports} from "../controllers/ReportController.js";
import { authMiddleware } from "../middleware/middleware.js"; 

const router = express.Router();

router.post("", authMiddleware, createReport);
router.delete("/:reportId", authMiddleware, deleteReport);
router.get("", getAllReports);
router.get("/users", getUserOnlyReports);
router.get("/mine", authMiddleware, getMyReports);  
router.patch("/:reportId", authMiddleware, updateReport);
router.get("/:reportId", authMiddleware, getReport);

export default router;