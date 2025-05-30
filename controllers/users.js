// const User = require("../models/user");

// module.exports.renderSignupForm = (req, res)=>{
//     res.render("users/register.ejs");
// };



// module.exports.register = async(req,res)=>{
//         try{
//             let {username,email,password} = req.body;
//             const newUser =  new User({email,username});
//             const registeredUser = await User.register(newUser, password);
//             console.log(registeredUser);
//             req.login(registeredUser,(err) => {
//                 if(err) {
//                     return next (err);
//                 }

//                 req.flash("success","Welcome to MediVault!");
//                 res.redirect("/dashboard");

//             });
            

//         } catch(e) {
//             req.flash("error", e.message);
//             res.redirect("/register");
//         }
//     };


    
//     module.exports.renderLoginForm  = (req,res) =>{
//         res.render("users/login.ejs");
//     };


//     module.exports.login = async (req,res) => {
//         req.flash("success","Welcome  back to MediVault !");
//         let redirectUrl = res.locals.redirectUrl || "/dashboard";
//         res.redirect(redirectUrl);
       
//     };

//     module.exports.logout  = (req,res,next)=>{
//         req.logout((err)=>{
//             if(err) {
//                 return next(err);
//             }
//             req.flash("success","you are logged out!");
//             res.redirect("/");
//         });
//     }; 

const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/register.ejs");
};

module.exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/register");
    }

    // Create and register user
    const newUser = new User({ username,email });
    const registeredUser = await User.register(newUser, password);
    console.log("Registered User:", registeredUser);

    // Log the user in
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to MediVault!");
      res.redirect("/");
    });

  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};

module.exports.renderLoginForm = (req, res) => {
    if (req.isAuthenticated()) {
    req.flash("info", "You are already logged in.");
    return res.redirect("/");
  }
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to MediVault!");
  const redirectUrl = res.locals.redirectUrl || "/";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/");
  });
};
