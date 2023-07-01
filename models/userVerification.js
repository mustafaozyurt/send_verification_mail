const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const nodemailer = require("nodemailer");
require("dotenv").config();
const uuid = require("uuid").v4;
const bcrypt = require("bcrypt");

// the object schema for database
const UserVerification = new Schema({
  userID: String,
  uniqueString: String,
  createdAt: Date,
  expiresAt: Date,
});

// the function that sends the verification mail
UserVerification.statics.sendVerificationMail = async function (email, _id) {
  try {

    // unique string of user 
    const uniqueString = uuid() + _id;

    // connecting to main account of app
    const transport = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD,
      },
    });

    // setting the essentials of mail
    // first we put as parameter _id of user than unique string of userVerification
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Account Verification",
      text: `Please click on the following link to verify your account: ${process.env.BASE_URL}user/verify/${_id}/${uniqueString}`,
    };

    //sending mail
    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    // hashing unique string
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(uniqueString, salt);

    const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);

    // creating userVerification Model
    const verificationRecord = await this.create({
      userID: _id,
      uniqueString: hash,
      createdAt: new Date(),
      expiresAt: expiresAt,
    });

    return verificationRecord;
  } catch (err) {
    throw Error(err);
  }
};

module.exports = mongoose.model("UserVerificationModel", UserVerification);
