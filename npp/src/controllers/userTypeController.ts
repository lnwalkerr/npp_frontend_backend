import customError from "../middlewares/customError";
import UserType from "../models/userType";
import * as mongoose from "mongoose";
import { Utils } from "../utils/utils";

export class userTypeController {
  static async createUserType(req, res, next) {
    try {
      let userTypeData: any = await UserType.findOne({
        type: req.body.type,
      });

      if (userTypeData) {
        throw new customError("userType already exist");
      }

      let data: any = await new UserType({
        ...req.body,
        created_by: req.admin._id,
      }).save();
      res.json({
        message: "userType Save Successfully",
        data: data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getAllUserType(req, res, next) {
    try {
      const { type } = req.query;

      let filter: any = {};

      if (type) {
        filter.type = type;
      }

      const data = await UserType.find(filter);

      res.json({
        message: "userType fetched successfully",
        totalCounts: data.length,
        data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getByIdUserType(req, res, next) {
    try {
      let data: any = await UserType.findOne({
        _id: req.query.id,
      });

      if (!data) {
        throw new customError("UserType not found");
      }
      res.json({
        message: "UserType Fetch Successfully",
        data: data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateUserType(req, res, next) {
    try {
      const { id } = req.query;
      req.body.updated_by = req.admin._id;
      req.body.updated_at = Utils.indianTimeZone();

      const userTypeData = await UserType.findById(id);

      if (!userTypeData) {
        throw new customError("userType not found");
      }
      const upUserType: any = await UserType.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        {
          $set: { ...req.body },
        },
        { new: true }
      );

      res.json({
        status_code: 200,
        message: "Updated Successfully",
        data: upUserType,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUserType(req, res, next) {
    try {
      let { id } = req.query;
      let data: any = await UserType.findOne({
        _id: id,
      });

      if (!data) {
        throw new customError("UserType not found");
      }

      await UserType.findOneAndDelete({ _id: id });
      res.json({
        status_code: 200,
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  }
}
