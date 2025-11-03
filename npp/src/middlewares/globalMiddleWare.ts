import { validationResult } from "express-validator";
import * as Jwt from "jsonwebtoken";
import user from "../models/user";
import { Utils } from "../utils/utils";

export class globalMiddleWare {
  static checkError(req, res, next) {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      console.log("error::", error);
      let message = error.array()[0].msg;
      return res.status(400).json({
        message,
        status_code: 400,
      });
    } else {
      next();
    }
  }

  // for admin
  static async adminAuthenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader ? authHeader.slice(7, authHeader.length) : null;
      Jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
          console.log("err::", err);
          return res.status(401).json({
            status_code: 401,
            message: "Not Authorised",
          });
        } else if (!decoded) {
          console.log("err2::", err);

          return res.status(401).json({
            status_code: 401,
            message: "Not Authorised",
          });
        } else {
          let adminData = await user
            .findOne({
              _id: decoded.admin_id,
            })
            .select(
              "userType parentId firstName lastName status phone email constituency registrationType"
            )
            .populate({ path: "userType", select: "type title" })
            .populate({ path: "registrationType", select: "value" })
            .populate({ path: "constituency", select: "value" })
            .populate({ path: "parentId", select: "name" });

          if (
            adminData &&
            (adminData.userType["type"] == "superAdmin" ||
              adminData.userType["type"] == "admin") &&
            adminData.status == true
          ) {
            req.admin = adminData;
            next();
          } else {
            return res.status(401).json({
              status_code: 401,
              message: "Not Authorised",
            });
          }
        }
      });
    } catch (e) {
      console.log(e);
      return res.status(401).json({
        status_code: 401,
        message: "Not Authorised",
      });
    }
  }

  // for user

  static async userAuthenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader ? authHeader.slice(7, authHeader.length) : null;

      if (!token)
        return res.status(401).json({
          status_code: 401,
          message: "Not Authorised",
        });

      Jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
          // next(new CustomError("Not Authorised", 401 ));
          console.log(err);
          return res.status(401).json({
            status_code: 401,
            message: "Not Authorised",
          });
        } else if (!decoded) {
          return res.status(401).json({
            status_code: 401,
            message: "Not Authorised",
          });
        } else {
          let userData = await user
            .findOne({
              _id: decoded.admin_id,
            })
            .populate({ path: "userType", select: "type title" })
            .populate({ path: "registrationType", select: "value" })
            .populate({ path: "constituency", select: "value" })
            .select(
              "firstName lastName phone email candidateId userType constituency registrationType"
            );
          req.admin = userData;
          next();
        }
      });
    } catch (e) {
      return res.status(401).json({
        status_code: 401,
        message: "Not Authorised",
      });
    }
  }
}
