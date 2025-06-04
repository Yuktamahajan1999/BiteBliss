import jwt from "jsonwebtoken";
import User from "../Models/User.js";

const checkLogin = async (req, res, next) => {
  const headers = req.headers.authorization;

  if (!headers) {
    return res.status(401).json({ message: "Authorization header is missing" });
  }

  const token = headers.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token is missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user._id,
      role: user.role,
      name: user.name,
      token,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token", error: err.message });
  }
};

export default checkLogin;
