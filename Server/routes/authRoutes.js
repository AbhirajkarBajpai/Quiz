const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/isLoggedIn", authController.isLoggedIn);

// router.use(authController.protect);

// router.get("/protected-route", (req, res) => {
//   res.status(200).json({ message: "You have accessed a protected route!" });
// });

router.get("/admin-only", authController.restrictTo("admin"), (req, res) => {
  res.status(200).json({ message: "Welcome Admin!" });
});

module.exports = router;
