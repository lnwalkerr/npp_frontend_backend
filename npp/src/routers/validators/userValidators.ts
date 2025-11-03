import { body, param, query } from "express-validator";
import User from "../../models/user";
import platform from "../../models/platform";
import { Utils } from "../../utils/utils";

export class userValidator {
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
    return [
      body("userId", "User Token is Required")
        .notEmpty()
        .custom((userId, { req }) => {
          return User.findOne({
            $or: [{ candidateId: userId }, { phone: userId }],
            otpStatus: true,
          })
            .populate("userType")
            .populate("constituency")
            .populate("registrationType")
            .then((user) => {
              if (user) {
                req.admin = user;
                return true;
              } else {
                throw new Error("User Does Not Exist");
              }
            });
        }),
      body()
        .custom((value) => value.password || value.mpin)
        .withMessage("Either 'password' or 'mpin' must be provided"),
      body("mpin")
        .optional() // Makes it optional
        .isLength({ min: 4, max: 4 })
        .withMessage("MPIN must be exactly 4 digits.") // Checks if the length is exactly 4
        .isNumeric() // Ensures it's numeric
        .withMessage("MPIN must be numeric."),
      body("platformName").exists().withMessage("Plz provide required field"),
      body("platformToken")
        .exists()
        .withMessage("Plz provide required field")
        .custom((platformToken, { req }) => {
          return platform
            .findOne({ name: req.body.platformName })
            .then(async (plat) => {
              if (plat) {
                let check = await Utils.comparePassword({
                  plainPassword: plat.platformId,
                  encryptedPassword: platformToken,
                });
                req.platformId = plat._id;

                // condition for which usertype access which platform
                const isMember =
                  req.admin["userType"].type === "member" ||
                  req.admin["userType"].type === "admin";
                const isWebOrAndroid =
                  req.body.platformName === "web" ||
                  req.body.platformName === "android";

                if (
                  (isMember && isWebOrAndroid) ||
                  (!isMember && !isWebOrAndroid)
                ) {
                  return true;
                } else {
                  throw new Error(
                    "You are not authorized to login to this platform"
                  );
                }
              } else {
                throw new Error("wrong field provided");
              }
            });
        }),
      body("deviceDetail").exists().withMessage("Plz provide required field"),
    ];
  }
}
