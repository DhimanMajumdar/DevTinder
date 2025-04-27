import User from "../models/User.js";

export const swipeRight = async (req, res) => {
  try {
    const { likedUserId } = req.params;
    const currentUser = await User.findById(req.user.id);
    const likedUser = await User.findById(likedUserId);
    if (!likedUser) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }
    if (!currentUser.likes.includes(likedUserId)) {
      currentUser.likes.push(likedUserId);
      await currentUser.save();

      // if the other user already liked us, it is a match, so lets update both the users
      if (likedUser.likes.includes(currentUser.id)) {
        currentUser.matches.push(likedUser);
        likedUser.matches.push(currentUser.id);

        await Promise.all([await currentUser.save(), await likedUser.save()]);
      }

      // Todo send notification if it is a match -> socket.io
    }
    res.status(200).json({
      success: true,
      user: currentUser,
    });
  } catch (error) {
    console.log("Error in swipeRight", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const swipeLeft = async (req, res) => {
  try {
    const { dislikedUserId } = req.params;
    const currentUser = await User.findById(req.user.id);

    if (!currentUser.dislikes.includes(dislikedUserId)) {
      currentUser.dislikes.push(dislikedUserId);
      await currentUser.save();
    }

    res.status(200).json({
      success: true,
      user: currentUser,
    });
  } catch (error) {
    console.log("Error in swipeLeft", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMatches = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "matches",
      "name image"
    );
    res.status(200).json({
      success: true,
      matches: user.matches,
    });
  } catch (error) {
    console.log("Error in getMatches", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getUserProfiles = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const users = await User.find({
      $and: [
        { _id: { $ne: currentUser.id } },
        { _id: { $nin: currentUser.likes } },
        { _id: { $nin: currentUser.dislikes } },
        { _id: { $nin: currentUser.matches } },
        {
          gender:
            currentUser.genderPreferences === "both"
              ? { $in: ["male", "female"] }
              : currentUser.genderPreferences,
        },
        { genderPreferences: { $in: [currentUser.gender, "both"] } },
      ],
    });
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log("Error in getUserProfiles:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
