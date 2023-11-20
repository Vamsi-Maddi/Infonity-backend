const express = require("express");
const EduportalSchema = require("../model/EduportalSchema");
const UserSchema = require("../model/UserSchema");
const InstructorSchema = require("../model/InstructorSchema");
const CommonSchema = require("../model/CommonSchema")
const mongoose = require("mongoose");
const courseRoute = express.Router();
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const randomstring = require('randomstring');
const twilio = require('twilio');

//------------------Twilio setup ------------------------------

const accountSid = 'AC715502cc15ba6a7bcec16b5b35ec5732'; // Replace with your Twilio Account SID
const authToken = 'a53605d3a92f69a2cdf298e2f54a60cd'; // Replace with your Twilio Auth Token
const twilioPhoneNumber = '+12056235094'; // Replace with your Twilio Phone Number
const twilioClient = twilio(accountSid, authToken);



//---------------- route for creating a new course ---------------------------

courseRoute.post("/create-course", (req, res) => {
    EduportalSchema.create(req.body, (err, data) => {
        if (err) {
            return err;
        }
        else {
            res.json(data);
        }
    })
})


// -------------- route for getting the list of all available courses ------------------
courseRoute.get("/", (req, res) => {
    EduportalSchema.find((err, data) => {
        if (err)
            return err;
        else
            res.json(data);
    })
})
//--------------- route for getting the student details ----------------
courseRoute.get("/get-student", (req, res) => {
    UserSchema.find((err, data) => {
        if (err)
            return err;
        else
            res.json(data);
    })
})

//--------------- route for getting student details by id -----------------

courseRoute.get("/view-student/:id", (req, res) => {
    UserSchema.findById(mongoose.Types.ObjectId(req.params.id),(err, data) => {
        if (err)
            return err;
        else
            res.json(data);
    })
})


// --------- route for getting instructor details by id -------------------
courseRoute.get("/view-instructor/:id", (req, res) => {
    InstructorSchema.findById(mongoose.Types.ObjectId(req.params.id),(err, data) => {
        if (err)
            return err;
        else
            res.json(data);
    })
})



//-------------- route for veiwing the content of a particular course --------------------
courseRoute.get("/view-content/:id", (req, res) => {
    EduportalSchema.findById(mongoose.Types.ObjectId(req.params.id),(err, data) => {
        if (err)
            return err;
        else
            res.json(data);
    })
})


// --------------- route for updating a particular course --------------------
courseRoute.route("/update-course/:id")
    .get((req, res) => {
        EduportalSchema.findById(mongoose.Types.ObjectId(req.params.id), (err, data) => {
            if (err) {
                return err;
            }
            else {
                res.json(data);
            }
        })
    }).put((req, res) => {
        EduportalSchema.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id),
            {$set: req.body },
            (err, data) => {
                if (err) {
                    return err;
                }
                else {
                    res.json(data);
                }
            })

    })


// ------------ route for deleting a particular course ---------------------

courseRoute.delete("/delete-course/:id", (req, res) => {
    EduportalSchema.findByIdAndRemove(mongoose.Types.ObjectId(req.params.id),
        (err, data) => {
            if (err) {
                return err;
            }
            else {
                res.json(data);
            }
        })
})


// --------------------route for updating the content of a particular course ---------------------


courseRoute.post('/update-content/:id', (req, res) => {
    const updatedLinks = req.body.updatedLinks;
    
    EduportalSchema.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id),
        { $push: {Links : { $each : updatedLinks} } },
        (err, data) => {
            if (err) {
                return err;
            }
            else {
                res.json(data);
            }
        })
})


// ------------------- route for signup ----------------------------


courseRoute.post("/signup", (req, res) => {
    const email  = req.body.email;

    // Check if the user already exists
    UserSchema.findOne({ email: email })
        .then(existingUser => {
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'User with this email already exists' });
            } else {
                // Create a new user
                UserSchema.create(req.body, (err, data) => {
                    if (err) {
                        return err;
                    } else {
                        res.json(data);
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error creating user:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        });
});



// --------------- route for login ---------------------


courseRoute.post("/login", (req, res) => {
    const {email, password } = req.body;
    UserSchema.findOne({email: email, password : password })
    .then(user =>{
        if (user) {
            console.log("Login successful");
            res.status(200).json([user._id,user.fullName]);
            
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    })
    .catch (error => {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    })
});

// --------------------route for handling the forgot password -------------------------

// Forgot Password Route - Step 1: Send OTP
courseRoute.post('/forgot-password', async (req, res) => {
    const { mobile } = req.body;
  
    try {
      // Check if the user exists
      const user = await UserSchema.findOne({ phone: mobile });
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User with this mobile number does not exist' });
      }
  
      // Generate random 6-digit OTP
      const otp = randomstring.generate({ length: 6, charset: 'numeric' });
  
      // Save OTP to the user
      user.resetToken = otp;
      user.resetTokenExpiration = Date.now() + 10 * 60 * 1000; // OTP is valid for 10 minutes
      await user.save();
  
      // Send OTP to the user's mobile number using Twilio
      await twilioClient.messages.create({
        body: `Your OTP for password reset is: ${otp}`,
        from: twilioPhoneNumber,
        to: `+91${mobile}`, // Assuming mobile is in E.164 format (+1234567890)
      });
  
      res.status(200).json({ success: true, message: 'OTP sent to your mobile number' });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ success: false, message: 'Error sending OTP:'});
    }
  });


// ---------------------route for handling the reset password -------------------------------

// Forgot Password Route - Step 2: Verify OTP and Reset Password
courseRoute.post('/reset-password', async (req, res) => {
    const { mobile, otp, newPassword } = req.body;
  
    try {
      // Check if the user exists
      const user = await UserSchema.findOne({ phone: mobile, resetToken: otp, resetTokenExpiration: { $gt: Date.now() } });
  
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid OTP or OTP expired' });
      }
  
      // Update password and clear resetToken
      user.password = newPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      await user.save();
  
      res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ success: false, message: `Error resetting password:${error.message}` });
    }
  });
  
  

// ------------------route for login of instructors -----------------------------------


courseRoute.post("/instructor-login", (req, res) => {
    const {email, password } = req.body;
    InstructorSchema.findOne({email: email, password : password })
    .then(user =>{
        if (user) {
            console.log("Login successful");
            res.status(200).json([user._id,user.fullName]);
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    })
    .catch (error => {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    })
});

//------------------route to post a message from landing page -------------------------------

courseRoute.post("/post-message", (req, res) => {
    CommonSchema.create(req.body, (err, data) => {
        if (err) {
            return err;
        }
        else {
            res.json(data);
        }
    })
})

module.exports = courseRoute;




// object id - > for machine learning course ->65450d8914be22a9ff34097a
// for example if we want to update machine learning course deatails then we need to type
// http://localhost:4000/courseRoute/update-course/object id of that course  (document)
// i.e  = http://localhost:4000/courseRoute/update-course/65450d8914be22a9ff34097a