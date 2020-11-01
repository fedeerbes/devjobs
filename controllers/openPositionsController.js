const mongoose = require("mongoose");
const multer = require("multer");
const shortId = require("shortid");

const OpenPosition = mongoose.model("OpenPosition");
const routes = require("../routes/routes");

exports.newPositionForm = (req, res) => {
  res.render("newPosition", {
    pageTitle: "New Position",
    tagline: "Complete the form and publish the position",
    newPositionFormUrl: routes.NEW_OPEN_POSITION,
    routes,
    logout: true,
    userName: req.user.name,
    userImage: req.user.image,
  });
};

exports.addNewPosition = async (req, res) => {
  const openPosition = new OpenPosition(req.body);
  openPosition.author = req.user._id;
  openPosition.skills = req.body.skills.split(",");
  const newOpenPosition = await openPosition.save();

  res.redirect(`${routes.OPEN_POSITIONS}/${newOpenPosition.url}`);
};

exports.showOpenPosition = async (req, res, next) => {
  const url = req.params.url;
  const openPositionObject = await OpenPosition.findOne({ url })
    .populate("author")
    .lean();
  if (!openPositionObject) {
    return next();
  }

  res.render("openPosition", {
    pageTitle: openPositionObject.title,
    openPositionObject,
    bar: true,
  });
};

exports.editPositionForm = async (req, res, next) => {
  const url = req.params.url;
  const openPositionObject = await OpenPosition.findOne({ url });

  if (!openPositionObject) {
    return next();
  }

  res.render("editPosition", {
    pageTitle: `Edit - ${openPositionObject.title}`,
    openPositionObject: openPositionObject.toJSON(),
    logout: true,
    userName: req.user.name,
    userImage: req.user.image,
  });
};

exports.editPosition = async (req, res) => {
  const url = req.params.url;
  const updatedPosition = req.body;
  updatedPosition.skills = req.body.skills.split(",");

  const openPositionObject = await OpenPosition.findOneAndUpdate(
    { url },
    updatedPosition,
    {
      new: true,
      runValidators: true,
    }
  );

  res.redirect(`${routes.OPEN_POSITIONS}/${openPositionObject.url}`);
};

// validate and sanitize open position fields
exports.validateOpenPosition = (req, res, next) => {
  // sanitize
  req.sanitizeBody("title").escape();
  req.sanitizeBody("company").escape();
  req.sanitizeBody("location").escape();
  req.sanitizeBody("salary").escape();
  req.sanitizeBody("contract").escape();
  req.sanitizeBody("skills").escape();

  // validate
  req.checkBody("title", "Title is required").notEmpty();
  req.checkBody("company", "Company is required").notEmpty();
  req.checkBody("location", "Location is required").notEmpty();
  req.checkBody("contract", "Contract is required").notEmpty();
  req.checkBody("skills", "Skills is required").notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash(
      "error",
      errors.map((error) => error.msg)
    );

    res.render("newPosition", {
      pageTitle: "New Position",
      tagline: "Complete the form and publish the position",
      newPositionFormUrl: routes.NEW_OPEN_POSITION,
      logout: true,
      userName: req.user.name,
      userImage: req.user.image,
      messages: req.flash(),
    });
  }

  next();
};

exports.deleteOpenPosition = async (req, res) => {
  const { id } = req.params;

  const openPosition = await OpenPosition.findById(id);

  if (verifyAuthor(openPosition, req.user)) {
    openPosition.remove();
    res.status(200).send("Open position has been deleted.");
  } else {
    res.status(403).send("Error");
  }
};

const verifyAuthor = (openPosition = {}, user = {}) =>
  openPosition.author.equals(user._id);

// config multer
const configMulter = {
  storage: (fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __dirname + "../../public/uploads/cv");
    },
    filename: (req, file, cb) => {
      const extension = file.mimetype.split("/")[1];
      cb(null, `${shortId.generate()}.${extension}`);
    },
  })),
  fileFilter(req, file, cb) {
    if (file.mimetype === "application/pdf") {
      // cb with true for allowed images
      cb(null, true);
    } else {
      cb(new Error("Format not valid"), false);
    }
  },
  limits: { fileSize: 100000 },
};

const upload = multer(configMulter).single("cv");

// upload PDF file
exports.uploadCV = (req, res, next) => {
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
      res.redirect(routes.BACK);
      return;
    } else {
      next();
    }
  });
};

exports.addCandidate = async (req, res, next) => {
  const { url } = req.params;
  const openPosition = await OpenPosition.findOne({ url });

  if (!openPosition) {
    return next();
  }

  const newCandidate = {
    name: req.body.name,
    email: req.body.email,
    cv: req.file.filename,
  };

  const newCandidates = [...openPosition.candidates, newCandidate];
  openPosition.candidates = newCandidates;
  await openPosition.save();

  req.flash("success", "CV uploaded correctly");
  res.redirect("/");
};

exports.showCandidates = async (req, res, next) => {
  const { id } = req.params;
  const openPosition = await OpenPosition.findById(id);

  if (
    !openPosition ||
    openPosition.author.toString() !== req.user._id.toString()
  ) {
    return next();
  }

  res.render("candidates", {
    pageTitle: `Candidates - ${openPosition.title}`,
    logout: true,
    userName: req.user.name,
    userImage: req.user.image,
    candidates: openPosition.toJSON().candidates,
  });
};

exports.search = async (req, res) => {
  const openPositions = await OpenPosition.find({
    $text: {
      $search: req.body.q,
    },
  }).lean();

  res.render("home", {
    pageTitle: `Results from search: ${req.body.q}`,
    bar: true,
    openPositions,
    routes,
  });
};
