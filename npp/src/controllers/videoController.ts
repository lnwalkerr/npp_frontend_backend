import customError from "../middlewares/customError";
import video from "../models/video";
import { Utils } from "../utils/utils";
import * as mongoose from "mongoose";

export class videoController {
  /**
   * @swagger
   * /api/admin/videos/create:
   *   post:
   *     tags:
   *       - Videos
   *     summary: Create a new video
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - description
   *               - videoUrl
   *             properties:
   *               title:
   *                 type: string
   *                 description: Video title
   *               description:
   *                 type: string
   *                 description: Video description
   *               videoUrl:
   *                 type: string
   *                 description: Video URL or embed link
   *               thumbnailUrl:
   *                 type: string
   *                 description: Thumbnail image URL
   *               duration:
   *                 type: string
   *                 description: Video duration (e.g., "10:30")
   *               tags:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Video tags
   *     responses:
   *       200:
   *         description: Video created successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  static async create(req, res, next) {
    try {
      let videoData: any = await video.findOne({
        title: req.body.title,
        videoUrl: req.body.videoUrl,
      });

      if (videoData) {
        throw new customError("A video with this title and URL already exists");
      }

      let data: any = await new video({
        ...req.body,
        created_by: req.admin._id,
      }).save();

      res.json({
        message: "Video created successfully",
        data: data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * @swagger
   * /api/admin/videos/getAll:
   *   get:
   *     tags:
   *       - Videos
   *     summary: Get all videos with optional filtering and pagination
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: searchText
   *         schema:
   *           type: string
   *         description: Search in title (case insensitive)
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Items per page
   *     responses:
   *       200:
   *         description: Videos fetched successfully
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
   *                       title:
   *                         type: string
   *                       description:
   *                         type: string
   *                       videoUrl:
   *                         type: string
   *                       thumbnailUrl:
   *                         type: string
   *                       duration:
   *                         type: string
   *                       views:
   *                         type: integer
   *                       tags:
   *                         type: array
   *                         items:
   *                           type: string
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
  static async getAllVideos(req, res, next) {
    try {
      const { searchText, page = 1, limit = 10 } = req.query;

      let filter: any = {};

      if (searchText) {
        filter.title = { $regex: searchText, $options: "i" };
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const data = await video
        .find(filter)
        .populate({ path: "created_by", select: "firstName lastName" })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit as string));

      const totalCounts = await video.countDocuments(filter);

      res.json({
        message: "Videos fetched successfully",
        totalCounts,
        data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * @swagger
   * /api/admin/videos/getById:
   *   get:
   *     tags:
   *       - Videos
   *     summary: Get video by ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Video ObjectId
   *     responses:
   *       200:
   *         description: Video fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     _id:
   *                       type: string
   *                     title:
   *                       type: string
   *                     description:
   *                       type: string
   *                     videoUrl:
   *                       type: string
   *                     thumbnailUrl:
   *                       type: string
   *                     duration:
   *                       type: string
   *                     views:
   *                       type: integer
   *                     tags:
   *                       type: array
   *                       items:
   *                         type: string
   *                     created_by:
   *                       type: object
   *                       properties:
   *                         firstName:
   *                           type: string
   *                         lastName:
   *                           type: string
   *                     created_at:
   *                       type: string
   *                       format: date-time
   *                     isActive:
   *                       type: boolean
   *       400:
   *         description: Video not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  static async getByIdVideo(req, res, next) {
    try {
      let data: any = await video
        .findOne({
          _id: req.query.id,
        })
        .populate({ path: "created_by", select: "firstName lastName" });

      if (!data) {
        throw new customError("Video not found");
      }

      // Increment view count
      await video.findOneAndUpdate(
        {
          _id: req.query.id,
        },
        {
          $inc: { views: 1 },
        }
      );

      res.json({
        message: "Video fetched successfully",
        data: data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * @swagger
   * /api/admin/videos/update:
   *   patch:
   *     tags:
   *       - Videos
   *     summary: Update a video
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Video ObjectId
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               videoUrl:
   *                 type: string
   *               thumbnailUrl:
   *                 type: string
   *               duration:
   *                 type: string
   *               tags:
   *                 type: array
   *                 items:
   *                   type: string
   *               isActive:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Video updated successfully
   *       400:
   *         description: Video not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  static async updateVideo(req, res, next) {
    try {
      const { id } = req.query;
      req.body.updated_at = Utils.indianTimeZone();

      const videoData = await video.findById(id);

      if (!videoData) {
        throw new customError("Video not found");
      }

      const updatedVideo: any = await video.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        {
          $set: { ...req.body, updated_by: req.admin._id },
        },
        { new: true }
      ).populate({ path: "created_by", select: "firstName lastName" });

      res.json({
        status_code: 200,
        message: "Video updated successfully",
        data: updatedVideo,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/admin/videos/delete:
   *   delete:
   *     tags:
   *       - Videos
   *     summary: Delete a video
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Video ObjectId
   *     responses:
   *       200:
   *         description: Video deleted successfully
   *       400:
   *         description: Video not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  static async deleteVideo(req, res, next) {
    try {
      const { id } = req.query;

      const videoData = await video.findById(id);

      if (!videoData) {
        throw new customError("Video not found");
      }

      await video.findByIdAndDelete(id);

      res.json({
        status_code: 200,
        message: "Video deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
