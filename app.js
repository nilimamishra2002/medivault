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
const Medicine= require("./models/Medicine.js");

const indexRouter = require("./routes/index.js");
const userRouter = require("./routes/user.js");
const dashboardRoutes = require('./routes/dashboard');
const recordRoutes = require('./routes/records');
require('dotenv').config();
// const authRoutes = require('./middleware/auth'); // You imported but didn't use it

// --- Connect to MongoDB ---
//const MONGO_URL = "mongodb://127.0.0.1:27017/medivault";

mongoose.connect(process.env.ATLASDB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to ATLAS DB'))
.catch(err => console.error('DB connection error:', err));

// --- Set up view engine ---
app.engine("ejs", ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Middleware ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride("_method"));

const sessionOptions = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.ATLASDB_URL,
    crypto:{
      secret:process.env.SECRET
    },
    touchAfter:24*3600,
   }),
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  }
};
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Prevent caching for authenticated routes (optional, you had this)
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Set locals for flash messages and current user
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});


// Session middleware
// app.use(session({
//     secret: 'your-secret-key',
//     resave: true,
//     saveUninitialized: true
// }));


// // Session middleware
// app.use(session({
//     secret: 'your-secret-key',
//     resave: true,
//     saveUninitialized: true
// }));

// // Flash middleware
// app.use(flash());

// // Global variables for flash messages
// app.use(function (req, res, next) {
//     res.locals.success_msg = req.flash('success_msg');
//     res.locals.error_msg = req.flash('error_msg');
//     next();
// });


app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// --- Routes ---
app.use('/', indexRouter);
app.use('/', userRouter);
app.use('/dashboard', dashboardRoutes);
app.use('/records', recordRoutes);

// --- 404 and Error Handling (Optional) ---
// app.use((err, req, res, next) => {
//   const { statusCode = 500, message = "Something went wrong!" } = err;
//   res.status(statusCode).render("error", { message });
// });

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

