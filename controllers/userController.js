const mongoose = require("mongoose");
const multer = require("multer");
const User = mongoose.model("User");
const routes = require("../routes/routes");
const shortId = require("shortid");

// config multer
const configMulter = {
  storage: (fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __dirname + "../../public/uploads/profile");
    },
    filename: (req, file, cb) => {
      const extension = file.mimetype.split("/")[1];
      cb(null, `${shortId.generate()}.${extension}`);
    },
  })),
  fileFilter(req, file, cb) {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      // cb with true for allowed images
      cb(null, true);
    } else {
      cb(new Error("Format not valid"), false);
    }
  },
  limits: { fileSize: 100000 },
};

const upload = multer(configMulter).single("image");

exports.uploadImage = (req, res, next) => {
  upload(req, res, function (error) {
    if (error) {
      if (
        error instanceof multer.MulterError ||
        error.code === "LIMIT_FILE_SIZE"
      ) {
        req.flash("error", "File size too large. Max: 100kb");
      } else {
        req.flash("error", error.message);
      }
      res.redirect(routes.ADMIN);
      return;
    } else {
      next();
    }
  });
};

exports.createAccountForm = (req, res) => {
  res.render("createAccount", {
    pageTitle: "Create your account in DevJobs",
    tagline: "Start submitting open positions for free, just create an account",
    routes,
  });
};

exports.validateFields = (req, res, next) => {
  req.sanitizeBody("name").escape();
  req.sanitizeBody("email").escape();
  req.sanitizeBody("password").escape();
  req.sanitizeBody("confirm").escape();

  req.checkBody("name", "Name is mandatory").notEmpty();
  req.checkBody("email", "Email must be valid").isEmail();
  req.checkBody("password", "Password is mandatory").notEmpty();
  req.checkBody("confirm", "Confirm password is mandatory").notEmpty();
  req.checkBody("confirm", "Passwords don't match").equals(req.body.password);

  const errors = req.validationErrors();

  if (errors.length) {
    req.flash(
      "error",
      errors.map((error) => error.msg)
    );
    res.render("createAccount", {
      pageTitle: "Create your account in DevJobs",
      tagline:
        "Start submitting open positions for free, just create an account",
      routes,
      messages: req.flash(),
    });

    return;
  }

  next();
};

exports.createAccount = async (req, res, next) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.redirect(routes.LOGIN);
  } catch (error) {
    req.flash("error", error);
    res.redirect(routes.CREATE_ACCOUNT);
  }
};

exports.loginForm = (req, res) => {
  res.render("login", {
    pageTitle: "Login in DevJobs",
    routes,
  });
};

exports.editProfileForm = (req, res) => {
  res.render("editProfile", {
    pageTitle: "Edit your profile",
    routes,
    user: req.user.toJSON(),
    logout: true,
    userName: req.user.name,
    userImage: req.user.image,
  });
};

exports.editProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.name = req.body.name;
  user.email = req.body.email;

  if (req.body.password) {
    user.password = req.body.password;
  }

  if (req.file) {
    user.image = req.file.filename;
  }

  await user.save();

  req.flash("success", "Profile updated");
  res.redirect(routes.ADMIN);
};

// sanitize and validate profile fields
exports.validateProfile = (req, res, next) => {
  req.sanitizeBody("name").escape();
  req.sanitizeBody("email").escape();
  if (req.body.password) {
    req.sanitizeBody("password").escape();
  }

  req.checkBody("name", "Name is required").notEmpty();
  req.checkBody("email", "Emails is required").notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash(
      "error",
      errors.map((error) => error.msg)
    );

    res.render("editProfile", {
      pageTitle: "Edit your profile",
      routes,
      user: req.user.toJSON(),
      logout: true,
      userName: req.user.name,
      userImage: req.user.image,
      messages: req.flash(),
    });
  }

  next();
};
