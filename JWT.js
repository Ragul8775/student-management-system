const { sign, verify } = require("jsonwebtoken");
require('dotenv').config();

// creating a JWT token
const createToken = (user) => {
  const accessToken = sign(
  
    { rollno: user.rollno, role: user.role,name :user.name ,dept:user.dept},

    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '30m' }
  );

  return accessToken;
};

// Middleware to verify the JWT token from the cookie
const VerifyToken = (req, res, next) => {
  const accessToken = req.cookies["access-token"];

  if (!accessToken) {
    return res.status(400).json({ error: "User not authenticated" });
  }

  try {
    const validToken = verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    if (validToken) {

      req.user = validToken; // Store the decoded token in the req.user object
      /* console.log(req.user) */
      return next();
    }
  } catch (err) {
    console.log(err);
    res.status(403).json({ message: "Forbidden: Invalid Token" });
  }
};


module.exports = { createToken, VerifyToken };