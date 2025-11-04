import customError from "../middlewares/customError";
import news from "../models/news";
import { Utils } from "../utils/utils";
import * as mongoose from "mongoose";

export class newsController {
  /**
   * @swagger
   * /api/admin/news/create:
   *   post:
   *     tags:
   *       - News
   *     summary: Create a new news article
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - type
   *               - title
   *             properties:
   *               type:
   *                 type: string
   *                 description: ObjectId of news type from masterData
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: News article created successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  static async create(req, res, next) {
    try {
      let newsData: any = await news.findOne({
        title: req.body.title,
      });

      if (newsData) {
        throw new customError("this news already exist");
      }

      let data: any = await new news({
        ...req.body,
        created_by: req.admin._id,
      }).save();
      res.json({
        message: "news Save Successfully",
        data: data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * @swagger
   * /api/admin/news/getAll:
   *   get:
   *     tags:
   *       - News
   *     summary: Get all news articles with optional filtering
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *         description: Filter by news type ObjectId
   *       - in: query
   *         name: searchText
   *         schema:
   *           type: string
   *         description: Search in title (case insensitive)
   *     responses:
   *       200:
   *         description: News articles fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       _id:
   *                         type: string
   *                       type:
   *                         type: object
   *                         properties:
   *                           value:
   *                             type: string
   *                       title:
   *                         type: string
   *                       description:
   *                         type: string
   *                       viewCount:
   *                         type: integer
   *                       created_by:
   *                         type: object
   *                         properties:
   *                           firstName:
   *                             type: string
   *                           lastName:
   *                             type: string
   *                       created_at:
   *                         type: string
   *                         format: date-time
   *                       isActive:
   *                         type: boolean
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  static async getAllNews(req, res, next) {
    try {
      const { type, searchText, page = 1, limit = 10 } = req.query;

      let filter: any = {};

      if (type) {
        filter.type = type;
      }

      if (searchText) {
        filter.$or = [
          { title: { $regex: searchText, $options: "i" } },
          { description: { $regex: searchText, $options: "i" } }
        ];
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const data = await news
        .find(filter)
        .populate({ path: "created_by", select: "firstName lastName" })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit as string));

      const totalCounts = await news.countDocuments(filter);
      const totalPages = Math.ceil(totalCounts / parseInt(limit as string));

      res.json({
        message: "News fetched successfully",
        totalCounts,
        totalPages,
        currentPage: parseInt(page as string),
        data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getByIdNews(req, res, next) {
    try {
      let data: any = await news
        .findOne({
          _id: req.query.id,
        })
        .populate({ path: "created_by", select: "firstName lastName" });

      if (!data) {
        throw new customError("news not found");
      }

      await news.findOneAndUpdate(
        {
          _id: req.query.id,
        },
        {
          $set: {
            viewCount: data.viewCount + 1,
          },
        }
      );

      res.json({
        message: "news Fetch Successfully",
        data: data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateNews(req, res, next) {
    try {
      const { id } = req.query;
      req.body.updated_at = Utils.indianTimeZone();

      const newsData = await news.findById(id);

      if (!newsData) {
        throw new customError("news not found");
      }
      const upNews: any = await news.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        {
          $set: { ...req.body },
        },
        { new: true }
      );

      res.json({
        status_code: 200,
        message: "Updated Successfully",
        data: upNews,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/admin/news/delete:
   *   delete:
   *     tags:
   *       - News
   *     summary: Delete a news article
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: News article ObjectId
   *     responses:
   *       200:
   *         description: News article deleted successfully
   *       400:
   *         description: News article not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  static async deleteNews(req, res, next) {
    try {
      const { id } = req.query;

      const newsData = await news.findById(id);

      if (!newsData) {
        throw new customError("news not found");
      }

      await news.findByIdAndDelete(id);

      res.json({
        status_code: 200,
        message: "News article deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
