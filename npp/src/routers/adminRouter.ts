import { Router } from "express";
import { userTypeController } from "../controllers/userTypeController";
import { globalMiddleWare } from "../middlewares/globalMiddleWare";
import { admincontroller } from "../controllers/adminController";
import { newsController } from "../controllers/newsController";
import { PERMISSIONS } from "../middlewares/validRolePermisson";
import hasRole from "../middlewares/role.middleware";
import { websiteController } from "../controllers/websiteController";
import { donationController } from "../controllers/donationController";
import { adminValidator } from "./validators/adminValidators";

class adminRouter {
  public router: Router;
  constructor() {
    this.router = Router();
    this.getRoutes();
    this.postRoutes();
    this.patchRoutes();
    this.deleteRoutes();
  }

  getRoutes() {
    this.router.get(
      "/userType/getById",
      globalMiddleWare.adminAuthenticate,
      globalMiddleWare.checkError,
      userTypeController.getByIdUserType
    );
    this.router.get(
      "/userType/getAll",
      globalMiddleWare.adminAuthenticate,
      globalMiddleWare.checkError,
      userTypeController.getAllUserType
    );
    this.router.get(
      "/getById",
      globalMiddleWare.adminAuthenticate,
      globalMiddleWare.checkError,
      admincontroller.getByIdUser
    );
    this.router.get(
      "/getAll",
      globalMiddleWare.adminAuthenticate,
      globalMiddleWare.checkError,
      admincontroller.getAllUsers
    );
    this.router.get(
      "/news/getById",
      globalMiddleWare.adminAuthenticate,
      globalMiddleWare.checkError,
      newsController.getByIdNews
    );
    this.router.get(
      "/news/getAll",
      globalMiddleWare.adminAuthenticate,
      globalMiddleWare.checkError,
      newsController.getAllNews
    );
    this.router.get(
      "/website/homePage",
      globalMiddleWare.checkError,
      websiteController.homePage
    );
    this.router.get(
      "/website/allNews",
      globalMiddleWare.checkError,
      newsController.getAllNews
    );
    this.router.get(
      "/website/newsById",
      globalMiddleWare.checkError,
      newsController.getByIdNews
    );
    this.router.get(
      "/donation/getAll",
      globalMiddleWare.checkError,
      donationController.getAllDonationMaster
    );
    this.router.get(
      "/donation/getById",
      globalMiddleWare.checkError,
      donationController.getByIdDonationMaster
    );
  }
  postRoutes() {
    this.router.post(
      "/userType/create",
      globalMiddleWare.adminAuthenticate,
      hasRole(PERMISSIONS.USERTYPE_CREATOR),
      globalMiddleWare.checkError,
      userTypeController.createUserType
    );
    this.router.post(
      "/create",
      globalMiddleWare.adminAuthenticate,
      hasRole(PERMISSIONS.ADMINUSER_CREATOR),
      adminValidator.create(),
      globalMiddleWare.checkError,
      admincontroller.create
    );
    this.router.post(
      "/login",
      adminValidator.login(),
      globalMiddleWare.checkError,
      admincontroller.login
    );
    this.router.post(
      "/news/create",
      globalMiddleWare.adminAuthenticate,
      hasRole(PERMISSIONS.NEWS_CREATOR),
      globalMiddleWare.checkError,
      newsController.create
    );
    this.router.post(
      "/donation/create",
      globalMiddleWare.adminAuthenticate,
      hasRole(PERMISSIONS.DONATION_MASTER_CREATOR),
      globalMiddleWare.checkError,
      donationController.createDonationMaster
    );
    this.router.post(
      "/website/donateByMember",
      globalMiddleWare.checkError,
      donationController.donateByMember
    );
  }
  patchRoutes() {
    this.router.patch(
      "/userType/update",
      globalMiddleWare.adminAuthenticate,
      hasRole(PERMISSIONS.USERTYPE_EDITOR),
      globalMiddleWare.checkError,
      userTypeController.updateUserType
    );
    this.router.patch(
      "/update",
      globalMiddleWare.adminAuthenticate,
      globalMiddleWare.checkError,
      admincontroller.updateUser
    );
    this.router.patch(
      "/news/update",
      globalMiddleWare.adminAuthenticate,
      hasRole(PERMISSIONS.NEWS_EDITOR),
      globalMiddleWare.checkError,
      newsController.updateNews
    );
    this.router.patch(
      "/donation/update",
      globalMiddleWare.adminAuthenticate,
      hasRole(PERMISSIONS.DONATION_MASTER_EDITOR),
      globalMiddleWare.checkError,
      donationController.updateDonationMaster
    );
  }
  deleteRoutes() {
    this.router.delete(
      "/userType/delete",
      globalMiddleWare.adminAuthenticate,
      hasRole(PERMISSIONS.USERTYPE_REMOVER),
      globalMiddleWare.checkError,
      userTypeController.deleteUserType
    );
  }
}

export default new adminRouter().router;
