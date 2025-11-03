import customError from "../middlewares/customError";
import news from "../models/news";
import { Utils } from "../utils/utils";
import * as mongoose from "mongoose";

export class newsController {
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

  static async getAllNews(req, res, next) {
    try {
      const { type, searchText } = req.query;

      let filter: any = {};

      if (type) {
        filter.type = type;
      }

      if (searchText) {
        filter.title = { $regex: searchText, $options: "i" };
      }

      const data = await news
        .find(filter)
        .populate({ path: "type", select: "value" })
        .populate({ path: "created_by", select: "firstName lastName" });

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

  static async getByIdNews(req, res, next) {
    try {
      let data: any = await news
        .findOne({
          _id: req.query.id,
        })
        .populate({ path: "type", select: "value" })
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
}
