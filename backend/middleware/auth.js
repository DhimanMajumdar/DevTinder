import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized - No token provided",
      });
    }

    // Token verification and decoding
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user with the decoded ID
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Not authorized - User not found",
      });
    }

    req.user = currentUser; // Attach the current user to the request object
    next();
  } catch (error) {
    console.log("Error in auth middleware", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Not authorized - Invalid Token",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
};
