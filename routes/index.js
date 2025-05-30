
// const express = require('express');
// const router = express.Router();

// router.get('/', (req, res) => res.render('pages/index'));
// router.get('/login', (req, res) => res.render('pages/login'));
// router.get('/register', (req, res) => res.render('pages/register'));
// router.get('/dashboard', (req, res) => res.render('pages/dashboard'));

// module.exports = router;

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { isLoggedIn } = require('../middleware');


// const MONGO_URL = "mongodb://127.0.0.1:27017/medivault";

// main()
//   .then(() => {
//     console.log("connected to DB");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// async function main() {
//   await mongoose.connect(MONGO_URL);
// }


router.get('/', (req, res) => {
  res.render('pages/index',{
  user: req.user 
  });
});


router.get('/', (req, res) =>{
   if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }

  res.render('pages/index');
});
 
// router.get('/login', (req, res) => res.render('users/login'));
// router.get('/register', (req, res) => res.render('users/register'));

// router.get('/dashboard', isLoggedIn, (req, res) => {
//   const medicines = [
//     { name: "Paracetamol", time: "08:00 AM" },
//     { name: "Ibuprofen", time: "12:00 PM" },
//     { name: "Amoxicillin", time: "06:00 PM" }
//   ];

  // const alerts = [
  //   "Your prescription for Paracetamol expires tomorrow.",
  //   "Time to take your Ibuprofen dose.",
  //   "New medicine added to your schedule."
  // ];

//   //  This was missing
//  const todayMeds = [
//   {
//     name: "Paracetamol",
//     dosage: "500mg",
//     times: ["08:00 AM", "08:00 PM"],
//     isTakenToday: true
//   },
//   {
//     name: "Ibuprofen",
//     dosage: "400mg",
//     times: ["12:00 PM"],
//     isTakenToday: false
//   }
// ];


//   res.render('pages/dashboard', {
//     userName: 'John Doe',
//     medicines: medicines,
//     alerts: alerts,
//     todayMeds: todayMeds //  Pass it to EJS here
//   });
// });



module.exports = router;
