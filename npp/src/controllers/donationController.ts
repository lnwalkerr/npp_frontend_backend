import customError from "../middlewares/customError";
import donation from "../models/donation";
import donationMaster from "../models/donationMaster";
import { Utils } from "../utils/utils";
import * as mongoose from "mongoose";

export class donationController {
  /**
   * @swagger
   * /api/admin/donation/create:
   *   post:
   *     tags:
   *       - Donations
   *     summary: Create a new donation campaign
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - typeOfDonation
   *               - title
   *               - totalGoal
   *             properties:
   *               typeOfDonation:
   *                 type: string
   *                 description: ObjectId of donation type from masterData
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               totalGoal:
   *                 type: number
   *                 description: Total donation goal amount
   *     responses:
   *       200:
   *         description: Donation campaign created successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
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

  /**
   * @swagger
   * /api/admin/donation/getAll:
   *   get:
   *     tags:
   *       - Donations
   *     summary: Get all donation campaigns with optional filtering
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: typeOfDonation
   *         schema:
   *           type: string
   *         description: Filter by donation type ObjectId
   *     responses:
   *       200:
   *         description: Donation campaigns fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 totalCounts:
   *                   type: integer
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       _id:
   *                         type: string
   *                       typeOfDonation:
   *                         type: string
   *                         description: ObjectId reference
   *                       title:
   *                         type: string
   *                       description:
   *                         type: string
   *                       totalGoal:
   *                         type: number
   *                       status:
   *                         type: boolean
   *                       created_by:
   *                         type: string
   *                         description: ObjectId reference
   *                       created_at:
   *                         type: string
   *                         format: date-time
   *                       updated_at:
   *                         type: string
   *                         format: date-time
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
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
