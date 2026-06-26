const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({
            success: false,
            error: "Token expired. Please login again.",
          });
      }
      return res.status(401).json({ success: false, error: "Invalid token." });
    }

    // 3. Check if user still exists
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "User no longer exists." });
    }

    // 4. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ success: false, error: "Authentication failed." });
  }
};

module.exports = { protect };
