// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// const passportLocalMongoose = require("passport-local-mongoose");

// const userSchema = new Schema({
//     email:{
//         type :String,
//         required : true
//     }
// });


// userSchema.plugin(passportLocalMongoose); //will automatically implement username, hashing , salting and hashed password

// module.exports = mongoose.model("User", userSchema);


const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    // optionally you can add username if you want separate from email
    username: String,
});

// Tell passport-local-mongoose to use 'email' as the username field
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports = mongoose.model("User", userSchema);
