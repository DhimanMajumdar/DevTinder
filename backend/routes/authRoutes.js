import express from "express";
import { signup, login, logout } from "../controllers/authController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

// Signup route
router.post("/signup", signup);

// Login route
router.post("/login", login);

// Logout route
router.post("/logout", logout);

// Protected route to get the current user
router.get("/me", protectRoute, (req, res) => {
  res.json({
    success: true,
    user: req.user, // Send the current user information
  });
});

export default router;
