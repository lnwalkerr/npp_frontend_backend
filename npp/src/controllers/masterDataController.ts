import customError from "../middlewares/customError";
import masterCategory from "../models/masterCategory";
import * as mongoose from "mongoose";
import masterData from "../models/masterData";
import { Utils } from "../utils/utils";
import platform from "../models/platform";

export class masterDataController {
  /**
   * @swagger
   * /master/masterCategory/create:
   *   post:
   *     tags:
   *       - Master Categories
   *     summary: Create a new master category
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - code
   *               - title
   *             properties:
   *               code:
   *                 type: string
   *                 example: "constituency"
   *               title:
   *                 type: string
   *                 example: "Constituency"
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: Master category created successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  // masterCategory
  static async createMasterCategory(req, res, next) {
    try {
      let masterCategoryData: any = await masterCategory.findOne({
        code: req.body.code,
      });

      if (masterCategoryData) {
        throw new customError("masterCategory already exist");
      }

      let data: any = await new masterCategory({
        ...req.body,
        created_by: req.admin._id,
      }).save();
      res.json({
        message: "masterCategory Save Successfully",
        data: data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * @swagger
   * /master/masterCategory/getAll:
   *   get:
   *     tags:
   *       - Master Categories
   *     summary: Get all master categories with optional filtering
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: code
   *         schema:
   *           type: string
   *         description: Filter by category code
   *     responses:
   *       200:
   *         description: Master categories fetched successfully
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
   *                       code:
   *                         type: string
   *                       title:
   *                         type: string
   *                       description:
   *                         type: string
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
  static async getAllMasterCategory(req, res, next) {
    try {
      const { code } = req.query;

      let filter: any = {};

      if (code) {
        filter.code = code;
      }

      const data = await masterCategory.find(filter);

      res.json({
        message: "masterCategory fetched successfully",
        totalCounts: data.length,
        data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getByIdMasterCategory(req, res, next) {
    try {
      let data: any = await masterCategory.findOne({
        _id: req.query.id,
      });

      if (!data) {
        throw new customError("masterCategory not found");
      }
      res.json({
        message: "masterCategory Fetch Successfully",
        data: data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateMasterCategory(req, res, next) {
    try {
      const { id } = req.query;
      req.body.updated_by = req.admin._id;
      req.body.updated_at = Utils.indianTimeZone();

      const masterCategoryData = await masterCategory.findById(id);

      if (!masterCategoryData) {
        throw new customError("masterCategory not found");
      }
      const upMasterCategory: any = await masterCategory.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        {
          $set: { ...req.body },
        },
        { new: true }
      );

      res.json({
        status_code: 200,
        message: "Updated Successfully",
        data: upMasterCategory,
      });
    } catch (error) {
      next(error);
    }
  }

  // masterData
  static async createMasterData(req, res, next) {
    try {
      let masterDataDetails: any = await masterData.findOne({
        masterCategoryId: req.body.masterCategoryId,
        value: req.body.value,
      });

      if (masterDataDetails) {
        throw new customError("masterData already exist");
      }

      let data: any = await new masterData({
        ...req.body,
        created_by: req.admin._id,
      }).save();
      res.json({
        message: "masterData Save Successfully",
        data: data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * @swagger
   * /master/masterData/getAll:
   *   get:
   *     tags:
   *       - Master Data
   *     summary: Get all master data with optional filtering
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: code
   *         schema:
   *           type: string
   *         description: Filter by master category code
   *       - in: query
   *         name: value
   *         schema:
   *           type: string
   *         description: Filter by master data value
   *     responses:
   *       200:
   *         description: Master data fetched successfully
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
   *                       masterCategoryId:
   *                         type: string
   *                         description: ObjectId reference to master category
   *                       value:
   *                         type: string
   *                       title:
   *                         type: string
   *                       description:
   *                         type: string
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
  static async getAllMasterData(req, res, next) {
    try {
      const { code, value } = req.query;

      let filter: any = {};

      if (code) {
        const category = await masterCategory.findOne({
          code,
        });
        if (!category) {
          return res.status(400).json({ message: "master category not found" });
        }
        filter.masterCategoryId = category._id;
      }

      if (value) {
        filter.value = value;
      }

      const data = await masterData.find(filter);

      res.json({
        message: "masterData fetched successfully",
        totalCounts: data.length,
        data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getByIdMasterData(req, res, next) {
    try {
      let data: any = await masterData.findOne({
        _id: req.query.id,
      });

      if (!data) {
        throw new customError("masterData not found");
      }
      res.json({
        message: "masterData Fetch Successfully",
        data: data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateMasterData(req, res, next) {
    try {
      const { id } = req.query;
      req.body.updated_by = req.admin._id;
      req.body.updated_at = Utils.indianTimeZone();

      const existMasterDataData = await masterData.findById(id);

      if (!existMasterDataData) {
        throw new customError("masterData not found");
      }
      const upMasterData: any = await masterData.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        {
          $set: { ...req.body },
        },
        { new: true }
      );

      res.json({
        status_code: 200,
        message: "Updated Successfully",
        data: upMasterData,
      });
    } catch (error) {
      next(error);
    }
  }

  // platform
  static async createPlatform(req, res, next) {
    req.body.token = await Utils.encryptPassword(req.body.platformId);
    try {
      let data: any = await new platform(req.body).save();
      res.json({
        message: "Platform Save Successfully",
        data: data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getAllPlatform(req, res, next) {
    try {
      const { name } = req.query;

      let filter: any = {};

      if (name) {
        filter.name = name;
      }

      const data = await platform.find(filter).select("name token");

      res.json({
        message: "platform fetched successfully",
        totalCounts: data.length,
        data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getByIdPlatform(req, res, next) {
    try {
      let data: any = await platform.findOne({
        _id: req.query.id,
      });

      if (!data) {
        throw new customError("platform not found");
      }
      res.json({
        message: "platform Fetch Successfully",
        data: data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  static async updatePlatformData(req, res, next) {
    try {
      const { id } = req.query;
      req.body.updated_at = Utils.indianTimeZone();

      const existPlatformData = await platform.findById(id);

      if (!existPlatformData) {
        throw new customError("platform not found");
      }
      const upPlatform: any = await platform.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        {
          $set: { ...req.body },
        },
        { new: true }
      );

      res.json({
        status_code: 200,
        message: "Updated Successfully",
        data: upPlatform,
      });
    } catch (error) {
      next(error);
    }
  }
}
