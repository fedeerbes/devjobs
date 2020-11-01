const passport = require("passport");
const mongoose = require("mongoose");
const crypto = require("crypto");

const OpenPosition = mongoose.model("OpenPosition");
const User = mongoose.model("User");
const routes = require("../routes/routes");
const sendEmail = require("../handlers/email");

exports.authUser = passport.authenticate("local", {
  successRedirect: routes.ADMIN,
  failureRedirect: routes.LOGIN,
  failureFlash: true,
  badRequestMessage: "Missing credentials",
});

// check for auth user
exports.verifyUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect(routes.LOGIN);
};

exports.showAdminPanel = async (req, res) => {
  const openPositions = await OpenPosition.find({
    author: req.user._id,
  }).lean();

  res.render("admin", {
    pageTitle: "Admin Panel",
    tagline: "Submit and admin your open positions from here",
    routes,
    openPositions,
    logout: true,
    userName: req.user.name,
    userImage: req.user.image,
  });
};

exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "Logout successfully");
  return res.redirect(routes.LOGIN);
};

exports.formRestorePassword = (req, res) => {
  res.render("restorePassword", {
    pageTitle: "Restore Password",
    tagline:
      "If you have an account but you forgot your password, complete the form to restore it.",
    routes,
  });
};

exports.sendToken = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    req.flash("error", "Account doesn't exist");
    return res.redirect(routes.LOGIN);
  }

  user.token = crypto.randomBytes(20).toString("hex");
  user.expires = Date.now() + 3600000;

  await user.save();
  const resetUrl = `http://${req.headers.host}${routes.RESET_PASSWORD}/${user.token}`;

  await sendEmail.send({
    user,
    subject: "Password Reset",
    resetUrl,
    file: "reset",
  });

  req.flash("success", "Check your email for instructions");
  res.redirect(routes.LOGIN);
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ token, expires: { $gt: Date.now() } });

  if (!user) {
    req.flash("error", "Invalid token");
    return res.redirect(routes.RESET_PASSWORD);
  }

  res.render("newPassword", {
    pageTitle: "New Password",
  });
};

exports.savePassword = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ token, expires: { $gt: Date.now() } });

  if (!user) {
    req.flash("error", "Invalid token");
    return res.redirect(routes.RESET_PASSWORD);
  }

  user.password = req.body.password;
  user.token = undefined;
  user.expires = undefined;

  await user.save();

  req.flash("success", "Password updated");
  res.redirect(routes.LOGIN);
};
