const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/user");
const passport = require("passport");
const { route } = require("./listing");
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/user.js");

router.route("/signup")
// GET Signup Page
.get(userController.renderSignupForm)
// POST Signup
.post(wrapAsync(userController.signUp));


router.route("/login")
.get( userController.renderLoginForm )
.post(
  saveRedirectUrl,
  passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), 
  userController.login );

router.get("/logout", userController.logout)

module.exports = router;