import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";

export const updateProfile = async (req, res) => {
  try {
    const { image, ...otherData } = req.body;
    let updatedData = otherData;

    // Check if an image is provided and if it's a valid base64 image
    if (image) {
      if (image.startsWith("data:image")) {
        try {
          // Upload image to Cloudinary
          const uploadResponse = await cloudinary.uploader.upload(image);
          updatedData.image = uploadResponse.secure_url;
        } catch (error) {
          console.log("Error uploading image:", error);
          return res.status(400).json({
            success: false,
            message: "Error uploading image, please try again later.",
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid image format.",
        });
      }
    }

    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedData, {
      new: true, // Return the updated user
    });

    // Check if user was updated successfully
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.log("Error in updateProfile:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};
