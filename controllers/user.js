const User = require("../models/user.js");
const UserVerification = require("../models/userVerification.js");
const bcrypt = require("bcrypt");
require("dotenv").config();

// sign up endpoint
exports.signup = async (req, res) => {
  const { email, name, password, dateOfBirth } = req.body;
  console.log(name, email, password, dateOfBirth);

  try {
    const user = await User.signup(email, name, password, dateOfBirth);

    if (user && !user.verification) {
      // Pass email and _id to sendVerificationMail function
      UserVerification.sendVerificationMail(user.email, user._id);

      res.status(200).json({
        status: "PENDİNG",
        message: "Verification Mail Sent",
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "Failed",
      message: err.message,
    });
  }
};

// sign in endpoint
exports.signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Kullanıcıyı doğrula ve kullanıcı bilgilerini al
    const user = await User.signin(email, password);

    res.status(200).json({
      status: "Success",
      message: "Signed In Successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "Failed",
      message: err.message,
    });
  }
};

//verifying endpoint
exports.verify = async (req, res) => {
  const userID = req.params.userID;
  const uniqueString = req.params.uniquestring;

  try {
    const verificationRecord = await UserVerification.find({ userID });

    if (!verificationRecord) {
      throw new Error("Invalid verification link");
    }

    if (verificationRecord[0].expiresAt < new Date()) {
      await UserVerification.deleteOne({ userID });
      await User.deleteOne({ _id: userID });
      throw new Error("Verification link has expired, please sign up again!");
    }

    const isMatch = await bcrypt.compare(
      uniqueString,
      verificationRecord[0].uniqueString
    );

    if (!isMatch) {
      throw new Error("Invalid verification link");
    }

    await User.findByIdAndUpdate(userID, { verification: true });

    await UserVerification.deleteOne({ userID });

    res.redirect("/user/verified");
  } catch (err) {
    let message = err.message;
    console.error(err);
    res.redirect(`/user/verified?error=true&message=${message}`);
  }
};
