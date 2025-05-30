const User = require ("./models/user");

module.exports.preventLoggedInAccess = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.flash("info", "You're already logged in.");
    return res.redirect("/");
  }
  next();
};



module.exports.isLoggedIn = (req,res,next) =>{
    //console.log(req.user);
    //console.log(req.path,"..",req.originalUrl);
    if(!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must log in for this action!");
        return res.redirect("/login");
    }
    next();

};

module.exports.saveRedirectUrl =(req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
        
    }
    next();
};