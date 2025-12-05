// app.js
require('dotenv').config(); // load env first

const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

const User = require("./models/user.js");
const Medicine = require("./models/Medicine.js");

const indexRouter = require("./routes/index.js");
const userRouter = require("./routes/user.js");
const dashboardRoutes = require('./routes/dashboard');
const recordRoutes = require('./routes/records');

// --- Validate required env vars early ---
if (!process.env.ATLASDB_URL) {
  console.error("Missing ATLASDB_URL in environment. Exiting.");
  process.exit(1);
}
if (!process.env.SECRET) {
  console.error("Missing SECRET in environment. Exiting.");
  process.exit(1);
}

// --- Connect to MongoDB ---
// removed deprecated options (useNewUrlParser / useUnifiedTopology)
mongoose.connect(process.env.ATLASDB_URL, {
  // recommended options can go here if needed, mongoose will handle defaults
  serverSelectionTimeoutMS: 10000
})
.then(() => {
  console.log('Connected to ATLAS DB');
  // start server only after DB connected
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('DB connection error:', err);
  process.exit(1); // fail fast
});

// --- Set up view engine ---
app.engine("ejs", ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Middleware ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride("_method"));

// If running behind a proxy (Render, Heroku, etc), enable trust proxy
// This is required to make req.secure and secure cookies work correctly.
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

// Session store (connect-mongo)
const mongoStore = MongoStore.create({
  mongoUrl: process.env.ATLASDB_URL,
  crypto: {
    secret: process.env.SECRET
  },
  touchAfter: 24 * 3600 // seconds
});

mongoStore.on('error', function (e) {
  console.error('MongoStore error', e);
});

const sessionOptions = {
  name: 'session', // change default cookie name for security
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false, // better practice
  store: mongoStore,
  cookie: {
    // cookie settings
    httpOnly: true,
    // In production, use secure cookies (HTTPS). Controlled by env var below.
    secure: process.env.COOKIE_SECURE === '1', 
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
};
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Prevent caching for authenticated routes (optional)
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Set locals for flash messages and current user
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;
  res.locals.user = req.user || null; // if your views expect `user`
  next();
});

// --- Routes ---
app.use('/', indexRouter);
app.use('/', userRouter);
app.use('/dashboard', dashboardRoutes);
app.use('/records', recordRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).render('404'); // create a 404.ejs or adjust as needed
});

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error(err);
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error", { message, err });
});

module.exports = app;
