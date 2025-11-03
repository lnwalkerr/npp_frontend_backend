import news from "../models/news";
import user from "../models/user";
import userType from "../models/userType";

export class websiteController {
  static async homePage(req, res, next) {
    try {
      let userRole = await userType.findOne({ type: "member" });

      const memberData = await user.find({
        userType: userRole._id,
        status: true,
      });

      let newsData: any = await news
        .find({
          isActive: true,
        })
        .populate({ path: "type", select: "value" })
        .populate({ path: "created_by", select: "firstName lastName" })
        .sort({ created_at: -1 })
        .limit(4);

      res.json({
        message: "data fetch Successfully",
        data: {
          activeMember: memberData.length,
          newsData,
        },
        status_code: 200,
      });
    } catch (e) {
      next(e);
    }
  }
}
