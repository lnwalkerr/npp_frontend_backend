import customError from "../middlewares/customError";
import { generateUserToken } from "../middlewares/helper";
import user from "../models/user";
import userToken from "../models/userToken";
import { Utils } from "../utils/utils";
import * as mongoose from "mongoose";
import * as Jwt from "jsonwebtoken";

export class admincontroller {
  static async create(req, res, next) {
    try {
      req.body.candidateId = await generateUserToken();
      if (req.body.password) {
        req.body.password = await Utils.encryptPassword(req.body.password);
      }
      req.body.otpStatus = true;
      let data: any = await new user(req.body).save();
      res.json({
        message: "User Save Successfully",
        data: data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getAllUsers(req, res, next) {
    try {
      const { userType } = req.query;

      let filter: any = {};

      if (userType) {
        filter.userType = userType;
      }

      const data = await user
        .find(filter)
        .populate({ path: "userType", select: "type title" })
        .populate({ path: "constituency", select: "value" })
        .populate({ path: "registrationType", select: "value" });

      res.json({
        message: "user fetched successfully",
        totalCounts: data.length,
        data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getByIdUser(req, res, next) {
    try {
      let data: any = await user
        .findOne({
          _id: req.query.id,
        })
        .populate({ path: "userType", select: "type title" })
        .populate({ path: "constituency", select: "value" })
        .populate({ path: "registrationType", select: "value" });

      if (!data) {
        throw new customError("user not found");
      }
      res.json({
        message: "user Fetch Successfully",
        data: data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const { id } = req.query;
      req.body.updated_at = Utils.indianTimeZone();

      const userData = await user.findById(id);

      if (!userData) {
        throw new customError("user not found");
      }
      const upUser: any = await user.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        {
          $set: { ...req.body },
        },
        { new: true }
      );

      res.json({
        status_code: 200,
        message: "Updated Successfully",
        data: upUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      let { password } = req.body;
      const userData = req.admin;

      let isValid = await Utils.checkPassword(password, userData.password);

      if (!isValid) throw new customError("Detail Does not Match!!!");

      const token = Jwt.sign(
        {
          candidateId: userData.candidateId,
          admin_id: userData._id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // userToken add/update
      let userTokenData = await userToken.findOne({
        userId: userData._id,
        platformId: req.platformId,
      });
      if (userTokenData) {
        await userToken.findOneAndUpdate(
          { userId: userData._id, platformId: req.platformId },
          {
            token,
            deviceDetail: req.body.deviceDetail,
            updated_at: Utils.indianTimeZone(),
          },
          {
            new: true,
            useFindAndModify: false,
          }
        );
      } else {
        await new userToken({
          platformId: req.platformId,
          userId: userData._id,
          token,
          deviceDetail: req.body.deviceDetail,
        }).save();
      }

      const response = {
        statusCode: 200,
        token: token,
        message: "Login Successfully",
        data: userData,
      };

      res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }
}
