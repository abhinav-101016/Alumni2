import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";

import User from "../models/User.js";
import { sendVerificationEmail } from "../utils/email.js";
import { updateRoleIfGraduated } from "../middleware/updateRoleIfGraduated.js";

const router = express.Router();

const SALT_ROUNDS = 12;
const OTP_EXPIRY = 10 * 60 * 1000;

const generateOTP = () =>
Math.floor(100000 + Math.random() * 900000).toString();



/* =====================================================
LOGIN RATE LIMITER
===================================================== */

const loginLimiter = rateLimit({
windowMs: 15 * 60 * 1000,
max: 5,
message: {
message: "Too many login attempts. Try again later."
},
standardHeaders: true,
legacyHeaders: false,
});



/* =====================================================
REGISTER
===================================================== */

router.post(
"/register",
[
body("name").isLength({ min: 2 }),
body("email").isEmail(),
body("phone").isLength({ min: 10 }),
body("password").isLength({ min: 6 }),
body("dob").isISO8601(),
body("passingYear").isInt(),
body("rollNumber").notEmpty(),
body("gender").isIn(["male","female","other"]),
body("course").isIn(["Btech","Mtech","MCA","MBA"]),
],

async (req,res)=>{

const errors = validationResult(req);

if(!errors.isEmpty()){
return res.status(400).json({errors:errors.array()});
}

try{

const {
name,
email,
phone,
password,
dob,
gender,
bloodGroup,
city,
country,
bio,
course,
branch,
passingYear,
hostel,
rollNumber
} = req.body;

const existingUser = await User.findOne({
$or:[
{email},
{phone},
{"academic.rollNumber":rollNumber}
]
});

if(existingUser){
return res.status(409).json({message:"User already exists"});
}

const passwordHash = await bcrypt.hash(password,SALT_ROUNDS);

const CURRENT_YEAR = new Date().getFullYear();

const role =
Number(passingYear) < CURRENT_YEAR ? "alumni":"student";

const otp = generateOTP();

const otpExpiresAt = new Date(Date.now()+OTP_EXPIRY);

const user = new User({

name:name.trim(),
email,
phone,
role,

auth:{
passwordHash,
emailVerification:{otp,otpExpiresAt}
},

verification:{
isEmailVerified:false,
isPhoneVerified:false,
isVerifiedByAdmin:false
},

accountStatus:"pending",

profile:{
dob:new Date(dob),
gender,
bloodGroup,
bio,

location:{
city,
country
}
},

academic:{
rollNumber,
course,
branch,
passingYear:Number(passingYear),
hostel
}

});

await user.save();

await sendVerificationEmail(email,otp);

const safeUser = user.toObject();
delete safeUser.auth;

res.status(201).json({
message:"User registered. Verify email.",
user:safeUser
});

}catch(error){

console.error(error);
res.status(500).json({message:"Server error"});

}

}
);



/* =====================================================
VERIFY EMAIL
===================================================== */

router.post("/verify-email", async(req,res)=>{

try{

const {email,otp} = req.body;

const user = await User.findOne({email});

if(!user){
return res.status(404).json({message:"User not found"});
}

if(
!user.auth.emailVerification ||
user.auth.emailVerification.otp !== otp ||
Date.now() > user.auth.emailVerification.otpExpiresAt
){
return res.status(400).json({message:"Invalid or expired OTP"});
}

user.verification.isEmailVerified = true;
user.accountStatus = "active";

user.auth.emailVerification = undefined;

await user.save();

const safeUser = user.toObject();
delete safeUser.auth;

res.json({
message:"Email verified",
user:safeUser
});

}catch(error){
res.status(500).json({message:"Server error"});
}

});



/* =====================================================
RESEND OTP
===================================================== */

router.post("/resend-otp", async(req,res)=>{

try{

const {email} = req.body;

const user = await User.findOne({email});

if(!user){
return res.status(404).json({message:"User not found"});
}

const otp = generateOTP();

const otpExpiresAt = new Date(Date.now()+OTP_EXPIRY);

user.auth.emailVerification = {otp,otpExpiresAt};

await user.save();

await sendVerificationEmail(email,otp);

res.json({message:"OTP resent"});

}catch(error){

res.status(500).json({message:"Server error"});

}

});



/* =====================================================
LOGIN (SECURE VERSION)
===================================================== */

router.post("/login", loginLimiter, async(req,res)=>{

try{

const {identifier,password} = req.body;

const user = await User.findOne({
$or:[
{email:identifier},
{phone:identifier}
]
});

if(!user){
return res.status(401).json({message:"Invalid credentials"});
}

/* EMAIL VERIFICATION CHECK */

if(!user.verification.isEmailVerified){
return res.status(403).json({message:"Verify email first"});
}

/* ACCOUNT STATUS CHECK */

if(user.accountStatus === "suspended" || user.accountStatus === "rejected"){
return res.status(403).json({message:"Account access denied"});
}

/* PASSWORD CHECK */

const isMatch = await bcrypt.compare(
password,
user.auth.passwordHash
);

if(!isMatch){
return res.status(401).json({message:"Invalid credentials"});
}

/* AUTO ROLE UPDATE */

await updateRoleIfGraduated(user);

/* TOKEN CREATION */

const token = jwt.sign(
{
id:user._id,
role:user.role
},
process.env.JWT_SECRET,
{expiresIn:"1h"}
);

/* SECURE COOKIE */

res.cookie("token", token, {
httpOnly: true,
secure: true,
sameSite: "none",
maxAge: 60 * 60 * 1000
});

const safeUser = user.toObject();
delete safeUser.auth;

let redirect=null;

if(
user.role==="alumni" &&
user.isProfileComplete===false
){
redirect="/complete-profile";
}

res.json({
message:"Login successful",
role:user.role,
redirect,
user:safeUser
});

}catch(error){

console.error(error);
res.status(500).json({message:"Server error"});

}

});

/* =====================================================
LOGOUT
===================================================== */

router.post("/logout", (req, res) => {
  try {
    // Clear the cookie by setting its expiration to the past
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/", // Ensure the path matches where the cookie was set
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
});

router.get("/status", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ isLoggedIn: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // FETCH FRESH DATA FROM DB
    const user = await User.findById(decoded.id).select("-auth"); 

    if (!user) {
      return res.status(404).json({ isLoggedIn: false });
    }

    res.json({ 
      isLoggedIn: true, 
      user: user // Now the frontend gets the REAL accountStatus
    });
  } catch (err) {
    res.status(401).json({ isLoggedIn: false });
  }
});

export default router;