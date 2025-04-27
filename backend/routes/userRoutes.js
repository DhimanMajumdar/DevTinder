import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { updateProfile } from "../controllers/userController.js";

const router = express.Router();

router.put("/update-profile", protectRoute, updateProfile);

export default router;
