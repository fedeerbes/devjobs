const mongoose = require("mongoose");
require("./config/db");

const express = require("express");
const exhbs = require("express-handlebars");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const createError = require("http-errors");

const router = require("./routes");
const passport = require("./config/passport");

require("dotenv").config({ path: "variables.env" });

const app = express();

// enable body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// validate fields
app.use(expressValidator());

// enable template engine
app.engine(
  "handlebars",
  exhbs({
    defaultLayout: "layout",
    helpers: require("./helpers/handlebars"),
  })
);
app.set("view engine", "handlebars");

// static files
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// enable passport
app.use(passport.initialize());
app.use(passport.session());

// alerts and flash messages
app.use(flash());

// custom middleware
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

app.use("/", router());

// 404
app.use((req, res, next) => {
  next(createError(404, "Not Found"));
});

// Admin errors
app.use((error, req, res) => {
  const status = error.status || 500;
  res.locals.message = error.message;
  res.locals.status = error.status;
  res.status(status);
  console.log(status);
  res.render("error");
});

const host = "0.0.0.0.";
const port = process.env.PORT;

app.listen(port, host, () => {
  console.log("Server running");
});
