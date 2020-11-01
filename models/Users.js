const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
mongoose.Promise = global.Promise;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  token: String,
  expires: Date,
  image: String,
});

// hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const hash = await bcrypt.hash(this.password, 12);
  this.password = hash;
  next();
});

userSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    next("Email already in use");
  } else {
    next(error);
  }
});

// auth users
userSchema.methods = {
  comparePassword: function (password) {
    return bcrypt.compareSync(password, this.password);
  },
};

module.exports = mongoose.model("User", userSchema);
