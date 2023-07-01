const userRouter = require("express").Router();
const { signup, signin, verify } = require("../controllers/user.js");

// post
userRouter.post("/signup", signup);
userRouter.post("/signin", signin);

//verification link 
userRouter.get("/verify/:userID/:uniquestring", verify);

//after verification
userRouter.get("/verified", (req, res) => {
  res.render("./verified.ejs");
});

module.exports = userRouter;
