const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
//const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { preventLoggedInAccess,saveRedirectUrl } = require("../middleware.js");


const userController = require ("../controllers/users.js");


// const { isLoggedIn } = require("../middleware");

// // Protect the dashboard route
// router.get("/dashboard", isLoggedIn, (req, res) => {
//   res.render("dashboard");
// });



// router.get("/signup", (req, res) => {
//     res.render("users/signup.ejs");
// });
//router.get("/signup",userController.renderSignupForm);
router
  .route("/register")
  .get(preventLoggedInAccess, userController.renderSignupForm)
  .post(preventLoggedInAccess, wrapAsync(userController.register));

router
  .route("/login")
  .get(preventLoggedInAccess, userController.renderLoginForm)
  .post(
    preventLoggedInAccess, 
    saveRedirectUrl,
    passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
}),
    userController.login
);

router.get("/logout", userController.logout);



module.exports = router;