const jwt = require("jsonwebtoken");
const userModel = require("../models/UserModel");

// FUNCTION TO ENABLE ME TO PROTECT A LOGIN ENDPOINT FROM UNAUTHENTICATED USERS.
async function AuthUser(req, res, next) {
  // const token = req.body.token || req.query.token || req.headers["x-access-token"];

  //   GET THE TOKEN FROM THE AUTHORIZATION HEADER
  const token = req.headers.authorization;

  if (!token) {
    return res.status(409).send("A token is required for authentication 😑");
  }
  try {
    //CHECK IF THE TOKEN MATCHES THE SUPPOSED ORIGIN
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await userModel.findById(decodedToken.user_id);

    // PASS THE USER DOWN TO THE ENDPOINTS HERE
    req.user = user;

    // PASS DOWN FUNCTIONALITY TO THE ENDPOINT
    next();
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      status: 400,
      message: error,
    });
  }
}

module.exports = AuthUser;
