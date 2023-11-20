// MongoDB Schema for user registration
const mongoose = require("mongoose");
const InstructorSchema = new mongoose.Schema({
    "fullName": { type: String },
    "email": { type: String },
    "phone": { type: String },
    "password": { type: String }
},
    {
        collection: "Instructors"
    });

module.exports = mongoose.model('InstructorSchema', InstructorSchema);