const express = require("express");
const passport = require("../middleware/passport");
const { forwardAuthenticated } = require("../middleware/checkAuth");

const router = express.Router();

router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/posts",
    failureRedirect: "/auth/login",
  }),
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// student-added routing get status to see if the user is logged in or not
router.get('/status', (req, res) => {
  res.json({ authenticated: req.isAuthenticated() });
});

module.exports = router;
