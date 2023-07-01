const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const validator = require("validator");

// the object schema for database
const User = new Schema({
  name: String,
  email: String,
  password: String,
  dateOfBirth: Date,
  verification: Boolean,
});

// to check the data from the request's body is okay for our app
User.statics.signup = async function (email, name, password, dateOfBirth) {
  if (
    email.trim() === "" ||
    name.trim() === "" ||
    password.trim() === "" ||
    dateOfBirth.trim() === ""
  ) {
    throw Error("Empty input fields");
  } else if (!validator.isEmail(email)) {
    throw Error("Please enter a valid email address!");
  } else if (password.length < 6) {
    throw Error("The password must be at least 6 characters");
  } else if (!new Date(dateOfBirth).getTime()) {
    throw Error("Please enter a valid date");
  }
  const exists = await this.findOne({ email });

  if (exists) {
    console.log("email already exists");
    throw Error("This email is already registered");
  }

  // hashing password
  const salt = await bcrypt.genSalt();

  if (!salt) {
    throw Error("Failed while adding salt numbers.");
  }
  const hash = await bcrypt.hash(password, salt);

  if (!hash) {
    throw Error("Failed while hashing password..");
  }

  // create a user model and set the verification: false 
  const user = await this.create({
    name,
    email,
    password: hash,
    dateOfBirth,
    verification: false,
  });

  if (!user) {
    throw Error("Failed while saving user");
  }

  return user;
};

User.statics.signin = async function (email, password) {
  if (email.trim() === "" || password.trim() === "") {
    throw Error("Please fill all the fields!");
  } else if (!validator.isEmail(email)) {
    throw Error("Please enter a valid email address!");
  }

  const user = await this.findOne({ email });

  if (!user) {
    throw Error("Email is wrong!");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Password is wrong!");
  }

  // if the verification is false, dont accept the request
  if (user.verification == false) {
    throw Error("First you need to verify your email address");
  }

  return user;
};

module.exports = mongoose.model("UserModel", User);
