const mongoose = require('mongoose');
const CommonSchema = new mongoose.Schema({
    "Name" : {type : String},
    "Email" : {type : String},
    "Phone" : {type : String},
    "Message" : {type : String},
},{
    collectoion : "Common"
})
module.exports = mongoose.model('CommonSchema',CommonSchema);