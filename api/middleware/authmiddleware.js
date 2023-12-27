const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/user");
const authCheck = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    console.log(token);
    if (!token) {
      return res.status(400).json({ success: false, msg: "Token not found" });
    }

    const decoded = await promisify(jwt.verify)(token, "sumitghimire");
    console.log("The decoded is", decoded);
    const newUser = await User.findById(decoded.id);
    if (!newUser) {
      return res.status(400).json({ success: false, msg: "User not found" });
    }
    req.user = newUser;
    next();
  } catch (err) {
    console.log("error while checking auth", err);
    res.status(400).json({
      success: false,
      err: err,
      msg: "Error while checking auth",
    });
  }
};
module.exports = authCheck;
