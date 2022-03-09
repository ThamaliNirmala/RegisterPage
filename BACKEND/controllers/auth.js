const User = require("../models/auth");
const ErrorResponse = require("../utils/errorResponse");

//when we use asynchrones function we need try catch block
exports.register = async (req, res, next) => {
  const { username, email, password } = req.body; //destructure method

  try {
    const user = await User.create({
      username,
      email,
      password, //this.password filed of user.js in models
    });
    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    //backend validation
    return next(new ErrorResponse("Please provide an email and password", 400)); //throws a new error
  } //400 Bad Request

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      //true
      return next(new ErrorResponse("Invalid Credentials", 401));
    }

    const isMatch = await user.matchPasswords(password); //matching the passwords from the received from request and from the db

    if (!isMatch) {
      return next(new ErrorResponse("Invalid Credentials", 401)); //401 for unauthorized
    }

    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      // 500 internal server error
      success: false,
      error: error.message,
    });
  }
};

const sendToken = (user, statusCode, res) => {
  //JWT get
  const token = user.getSignedToken();
  res.status(200).json({ success: true, token });
};