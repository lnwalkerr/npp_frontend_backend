import customError from "../middlewares/customError";
import event from "../models/event";
import { Utils } from "../utils/utils";
import * as mongoose from "mongoose";

export class eventController {
  /**
   * @swagger
   * /api/admin/events/create:
   *   post:
   *     tags:
   *       - Events
   *     summary: Create a new event
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
   *               - date
   *             properties:
   *               title:
   *                 type: string
   *                 description: Event title
   *               description:
   *                 type: string
   *                 description: Event description
   *               date:
   *                 type: string
   *                 format: date-time
   *                 description: Event date and time
   *               location:
   *                 type: string
   *                 description: Event location
   *               status:
   *                 type: string
   *                 enum: [Upcoming, Past, Cancelled]
   *                 default: Upcoming
   *     responses:
   *       200:
   *         description: Event created successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  static async create(req, res, next) {
    try {
      let eventData: any = await event.findOne({
        title: req.body.title,
        date: req.body.date,
      });

      if (eventData) {
        throw new customError("An event with this title and date already exists");
      }

      let data: any = await new event({
        ...req.body,
        created_by: req.admin._id,
      }).save();

      res.json({
        message: "Event created successfully",
        data: data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * @swagger
   * /api/admin/events/getAll:
   *   get:
   *     tags:
   *       - Events
   *     summary: Get all events with optional filtering and pagination
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: searchText
   *         schema:
   *           type: string
   *         description: Search in title (case insensitive)
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [Upcoming, Past, Cancelled]
   *         description: Filter by event status
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
   *         description: Events fetched successfully
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
   *                       date:
   *                         type: string
   *                         format: date-time
   *                       location:
   *                         type: string
   *                       status:
   *                         type: string
   *                         enum: [Upcoming, Past, Cancelled]
   *                       image:
   *                         type: object
   *                         properties:
   *                           url:
   *                             type: string
   *                           docSha:
   *                             type: string
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
  static async getAllEvents(req, res, next) {
    try {
      const { searchText, status, page = 1, limit = 10 } = req.query;

      let filter: any = {};

      if (status) {
        filter.status = status;
      }

      if (searchText) {
        filter.title = { $regex: searchText, $options: "i" };
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const data = await event
        .find(filter)
        .populate({ path: "created_by", select: "firstName lastName" })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit as string));

      const totalCounts = await event.countDocuments(filter);

      res.json({
        message: "Events fetched successfully",
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
   * /api/admin/events/getById:
   *   get:
   *     tags:
   *       - Events
   *     summary: Get event by ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Event ObjectId
   *     responses:
   *       200:
   *         description: Event fetched successfully
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
   *                     date:
   *                       type: string
   *                       format: date-time
   *                     location:
   *                       type: string
   *                     status:
   *                       type: string
   *                       enum: [Upcoming, Past, Cancelled]
   *                     image:
   *                       type: object
   *                       properties:
   *                         url:
   *                           type: string
   *                         docSha:
   *                           type: string
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
   *         description: Event not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  static async getByIdEvent(req, res, next) {
    try {
      let data: any = await event
        .findOne({
          _id: req.query.id,
        })
        .populate({ path: "created_by", select: "firstName lastName" });

      if (!data) {
        throw new customError("Event not found");
      }

      res.json({
        message: "Event fetched successfully",
        data: data,
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * @swagger
   * /api/admin/events/update:
   *   patch:
   *     tags:
   *       - Events
   *     summary: Update an event
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Event ObjectId
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
   *               date:
   *                 type: string
   *                 format: date-time
   *               location:
   *                 type: string
   *               status:
   *                 type: string
   *                 enum: [Upcoming, Past, Cancelled]
   *               isActive:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Event updated successfully
   *       400:
   *         description: Event not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  static async updateEvent(req, res, next) {
    try {
      const { id } = req.query;
      req.body.updated_at = Utils.indianTimeZone();

      const eventData = await event.findById(id);

      if (!eventData) {
        throw new customError("Event not found");
      }

      const updatedEvent: any = await event.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        {
          $set: { ...req.body, updated_by: req.admin._id },
        },
        { new: true }
      ).populate({ path: "created_by", select: "firstName lastName" });

      res.json({
        status_code: 200,
        message: "Event updated successfully",
        data: updatedEvent,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/admin/events/delete:
   *   delete:
   *     tags:
   *       - Events
   *     summary: Delete an event
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Event ObjectId
   *     responses:
   *       200:
   *         description: Event deleted successfully
   *       400:
   *         description: Event not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  static async deleteEvent(req, res, next) {
    try {
      const { id } = req.query;

      const eventData = await event.findById(id);

      if (!eventData) {
        throw new customError("Event not found");
      }

      await event.findByIdAndDelete(id);

      res.json({
        status_code: 200,
        message: "Event deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
