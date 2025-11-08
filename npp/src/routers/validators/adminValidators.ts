import { body, param, query } from "express-validator";
import User from "../../models/user";
import platform from "../../models/platform";

export class adminValidator {
  static create() {
    return [
      body("userType", "userType Is Required"),
      body("firstName", "firstName Is Required"),
      body("lastName", "lastName Is Required"),
      body("email", "email Is Required")
        .isEmail()
        .notEmpty()
        .withMessage("Email is not valid")
        .toLowerCase()
        .custom((value, { req }) => {
          return User.findOne({ email: value })
            .select("email")
            .then((user) => {
              if (user) {
                throw new Error("User already exists with the provided email");
              } else {
                return true;
              }
            });
        })
        .withMessage("User already exists with the provided email"),
      body("phone", "phone Is Required")
        .notEmpty()
        .isLength({ min: 10, max: 10 })
        .withMessage("Mobile Number must include 10 digits only")
        .custom((value, { req }) => {
          return User.findOne({ phone: value })
            .select("phone")
            .then((user) => {
              if (user) {
                throw new Error(
                  "User already exists with the provided mobile number"
                );
              } else {
                return true;
              }
            });
        })
        .withMessage("User already exists with the provided mobile number"),
      body("password")
        .optional() // Marking the password as optional
        .isStrongPassword()
        .withMessage(
          "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one special character"
        ),
    ];
  }

  static login() {
    let userData: any;
    return [
      body("userId", "UserId is Required")
        .notEmpty()
        .custom(async (userId, { req }) => {
          try {
            userData = await User.findOne({
              phone: userId,
              otpStatus: true,
              status: true,
            })
              .populate("userType")
              .populate("constituency")
              .populate("registrationType");
          } catch (e) {
            userData = await User.findOne({
              username: userId,
              otpStatus: true,
              status: true,
            })
              .populate("userType")
              .populate("constituency")
              .populate("registrationType");
          }

          if (!userData) throw new Error("User Does Not Exist");

          req.admin = userData;
          return true;
        }),
      body("password", "Password is Required").trim().notEmpty(),
      body("platformName").exists().withMessage("Plz provide required field"),
      body("platformToken")
        .trim()
        .notEmpty()
        .withMessage("Plz provide required field")
        .custom((value, { req }) => {
          return platform
            .findOne({ name: req.body.platformName })
            .then(async (plat) => {
              if (plat) {
                req.platformId = plat._id;
                return true;
              } else {
                throw new Error("wrong field provided");
              }
            });
        }),
      body("deviceDetail").exists().withMessage("Plz provide required field"),
    ];
  }
}
