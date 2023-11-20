const express = require("express");
const mongoose = require("mongoose");
const courseRoute = require("./controller/courseRoute");
const app = express();
const bodyParser = require("body-parser"); //to read the body part of the request
const cors = require("cors"); //to read the body part of the request
const randomstring = require('randomstring');
const twilio = require('twilio');

mongoose.set("strictQuery",true);
mongoose.connect("mongodb+srv://test:12345@cluster0.pcqzgrb.mongodb.net/Eduportal")
var db = mongoose.connection;
db.on("open",()=> console.log("Connected to DB"));
db.on("error",()=>console.log("Error while connecting to DB"));


//to read the body part of the request


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());

app.use("/courseRoute",courseRoute);
app.listen(4000,()=>{
    console.log("server started at 4000");
})
