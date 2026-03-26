const jwt = require("jsonwebtoken");

function ownerAuth(req, res, next) {
  const token = req.cookies.ownerToken;
  if (!token) {
    return res.redirect("/owners/login?error=Please login as owner");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "vane_owner_secret");
    req.owner = decoded;
    next();
  } catch (_err) {
    res.clearCookie("ownerToken");
    return res.redirect("/owners/login?error=Session expired. Please login again");
  }
}

module.exports = ownerAuth;