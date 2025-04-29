import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Helper function to sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  });
};

export const signup = async (req, res) => {
  const { name, email, password, age, gender, genderPreferences } = req.body;
  try {
    if (!name || !email || !password || !age || !gender || !genderPreferences) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: "You must be at least 18 years old",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Ensure password is hashed (check User model for password hashing)
    const newUser = await User.create({
      name,
      email,
      password, // Ensure the password is hashed before saving to the DB
      age,
      gender,
      genderPreferences,
    });

    // Generate JWT token for new user
    const token = signToken(newUser._id);

    // Set cookie with JWT token
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true, // Ensures cookie is not accessible via JavaScript
      sameSite: "strict", // CSRF protection
      secure: process.env.NODE_ENV === "production", // Only use secure cookies in production
    });

    res.status(201).json({
      success: true,
      user: newUser, // Send the created user data
    });
  } catch (error) {
    console.error("Error in signup controller:", error); // Log the full error stack in development
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Find the user by email and include password for comparison
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    // Generate JWT token for logged-in user
    const token = signToken(user._id);

    // Set cookie with JWT token
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true, // Cookie can't be accessed by JS
      sameSite: "strict", // Protect against CSRF attacks
      secure: process.env.NODE_ENV === "production", // Only use secure cookies in production
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error in login controller:", error); // Log full error stack in development
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const logout = async (req, res) => {
  // Clear the JWT token cookie
  res.clearCookie("jwt");
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
