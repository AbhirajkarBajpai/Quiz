const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const catchAsync = require("../utils/CatchAsync");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };
  // if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  if (req.body.password.length < 8) {
    return res.status(400).json({
      status: "fail",
      message: "Password must be at least eight characters long",
    });
  }

  const newUser = await User.create({
    role: req.body.role || "user", // Default role: user
    userName: req.body.userName,
    password: req.body.password,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    return res
      .status(400)
      .json({ status: "fail", message: "Missing userName and password!" });
  }

  const user = await User.findOne({ userName }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return res
      .status(400)
      .json({ status: "fail", message: "Incorrect username or password" });
  }

  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res
      .status(401)
      .json({ status: "fail", message: "Please log in to access!" });
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return res
      .status(401)
      .json({ status: "fail", message: "User no longer exists!" });
  }

  req.user = currentUser; // Grant access
  res.locals.user = currentUser;
  next();
});

//Restrict Access to Specific Roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          status: "fail",
          message: "You do not have permission to perform this action!",
        });
    }
    next();
  };
};

exports.isLoggedIn = async (req, res) => {
  console.log("checking for auth");
  if (req.cookies.jwt) {
    console.log("till here");
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      console.log("till here2");
      const currentUser = await User.findById(decoded.id);
      if (!currentUser)
        return res.status(400).json({ message: "User not found." });

      return res
        .status(200)
        .json({
          userId: currentUser._id,
          user: currentUser,
          role: currentUser.role,
        });
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Invalid token. Please log in again." });
    }
  }
  return res.status(400).json({ message: "User not logged in." });
};
