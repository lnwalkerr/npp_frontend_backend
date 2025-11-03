import customError from "../middlewares/customError";
import donation from "../models/donation";
import donationMaster from "../models/donationMaster";
import { Utils } from "../utils/utils";
import * as mongoose from "mongoose";

export class donationController {
  static async createDonationMaster(req, res, next) {
    try {
      let donationMasterData: any = await donationMaster.findOne({
        typeOfDonation: req.body.typeOfDonation,
        title: req.body.title,
      });

      if (donationMasterData) {
        throw new customError("donationMaster already exist");
      }

      let data: any = await new donationMaster({
        ...req.body,
        created_by: req.admin._id,
      }).save();
      res.json({
        message: "donationMaster Save Successfully",
        data: data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getAllDonationMaster(req, res, next) {
    try {
      const { typeOfDonation } = req.query;

      let filter: any = {};

      if (typeOfDonation) {
        filter.typeOfDonation = typeOfDonation;
      }

      const data = await donationMaster.find(filter);

      res.json({
        message: "donationMaster fetched successfully",
        totalCounts: data.length,
        data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getByIdDonationMaster(req, res, next) {
    try {
      let data: any = await donationMaster.findOne({
        _id: req.query.id,
      });

      if (!data) {
        throw new customError("donationMaster not found");
      }
      res.json({
        message: "donationMaster Fetch Successfully",
        data: data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateDonationMaster(req, res, next) {
    try {
      const { id } = req.query;
      req.body.updated_by = req.admin._id;
      req.body.updated_at = Utils.indianTimeZone();

      const donationMasterData = await donationMaster.findById(id);

      if (!donationMasterData) {
        throw new customError("donationMaster not found");
      }
      const upDonationMaster: any = await donationMaster.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        {
          $set: { ...req.body },
        },
        { new: true }
      );

      res.json({
        status_code: 200,
        message: "Updated Successfully",
        data: upDonationMaster,
      });
    } catch (error) {
      next(error);
    }
  }

  static async donateByMember(req, res, next) {
    try {
      let data: any = await new donation({
        ...req.body,
      }).save();
      res.json({
        message: "donate Successfully",
        data: data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }
}
