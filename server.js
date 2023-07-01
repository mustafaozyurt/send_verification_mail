//required frameworks
const express = require("express");
const app = express();
const userRouter = require("./routes/user.js");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// to use .env file
require("dotenv").config();

const port = process.env.PORT || 5000;

// to take data from body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// to be able to use verified.ejs
app.set("views", path.join(__dirname, "./views"));

// router
app.use("/user", userRouter);

// testing that connection to database and port is okay or not
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected successfully");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("Error connecting to the database", err);
  });

module.exports = app;
