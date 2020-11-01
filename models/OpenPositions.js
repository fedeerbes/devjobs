const mongoose = require("mongoose");
const slug = require("slug");
const shortId = require("shortId");
mongoose.Promise = global.Promise;

const openPositionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: "Position name is mandatory",
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
    required: "Location is mandatory",
  },
  salary: {
    type: String,
    default: 0,
  },
  contract: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  url: {
    type: String,
    lowercase: true,
  },
  skills: [String],
  candidates: [
    {
      name: String,
      email: String,
      cv: String,
    },
  ],
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "User is required",
  },
});

openPositionSchema.pre("save", function (next) {
  const url = slug(this.title);
  this.url = `${url}-${shortId.generate()}`;
  next();
});

// index
openPositionSchema.index({ title: "text" });

module.exports = mongoose.model("OpenPosition", openPositionSchema);
