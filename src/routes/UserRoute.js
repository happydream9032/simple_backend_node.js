const express = require("express");
const { signup, login, getUserData, googlelogin, newPassword, forgetpassword, confirmation, deleteUserData } = require("../controller/AppController");
const AuthUser = require("../middleware/AuthUser");

// CREATING EXPRESS ROUTE HANDLER
const router = express.Router();

// SIGN-UP POST ROUTER
router.post("/signup", signup);

// LOGIN POST ROUTER
router.post("/login", login);

router.post("/googlelogin", googlelogin);

router.post("/forgetpassword", forgetpassword);

router.post("/resetpassword", newPassword);

router.post("/confirmation/:token", confirmation);

router.post("/deleteuser", deleteUserData);

// GET USER DATA ROUTER
router.get("/", AuthUser, getUserData);

module.exports = router;
