const jwt = require("jsonwebtoken");

function userAuth(req, res, next) {
  const token = req.cookies.userToken;
  if (!token) {
    return res.redirect("/users/login?error=Please login first");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "vane_user_secret");
    req.user = decoded;
    next();
  } catch (_err) {
    res.clearCookie("userToken");
    return res.redirect("/users/login?error=Session expired. Please login again");
  }
}

module.exports = userAuth;