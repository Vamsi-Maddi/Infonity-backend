// MongoDB Schema for user registration
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    "fullName": { type: String },
    "email": { type: String },
    "phone": { type: String },
    "password": { type: String },
    "resetToken": { type: String },
    "resetTokenExpiration":{type:Date}
},
    {
        collection: "Users"
    });

module.exports = mongoose.model('UserSchema', userSchema);


