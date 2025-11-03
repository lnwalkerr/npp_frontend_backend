import { Router } from "express";
import { globalMiddleWare } from "../middlewares/globalMiddleWare";
import { donationController } from "../controllers/donationController";
import { userValidator } from "./validators/userValidators";
import { userController } from "../controllers/userController";

class userRouter {
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
      "/getById",
      globalMiddleWare.adminAuthenticate,
      globalMiddleWare.checkError,
      userController.getByIdUser
    );
  }
  postRoutes() {
    this.router.post(
      "/create",
      userValidator.create(),
      globalMiddleWare.checkError,
      userController.create
    );
    this.router.post(
      "/login",
      userValidator.login(),
      globalMiddleWare.checkError,
      userController.login
    );
    this.router.post(
      "/donation/donateByMember",
      globalMiddleWare.userAuthenticate,
      globalMiddleWare.checkError,
      donationController.donateByMember
    );
  }
  patchRoutes() {
    this.router.patch(
      "/update",
      globalMiddleWare.adminAuthenticate,
      globalMiddleWare.checkError,
      userController.updateUser
    );
  }
  deleteRoutes() {}
}

export default new userRouter().router;
