const mongoose = require("mongoose");
const EduportalSchema = new mongoose.Schema({
    "Name": { type: String },
    "Description": { type: String },
    "Duration": { type: Number },
    "Author" : {type: String},
    "Thumbnail" : {type : String},
    "Links": [{
        "Linkname": { type: String },
        "Url": { type: String }
    }
    ]

}, {
    collection: "Courses"
})

module.exports = mongoose.model("EduportalSchema", EduportalSchema);