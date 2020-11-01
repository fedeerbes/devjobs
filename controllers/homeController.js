const mongoose = require("mongoose");
const OpenPosition = mongoose.model("OpenPosition");
const routes = require("../routes/routes");

exports.showJobs = async (req, res) => {
  const openPositions = await OpenPosition.find().lean();

  if (!openPositions) {
    return next();
  }
  res.render("home", {
    pageTitle: "devJobs",
    tagline: "Find and Publish web developers jobs",
    button: true,
    bar: true,
    openPositions,
    routes,
  });
};
