import { Router } from "express";
import { masterDataController } from "../controllers/masterDataController";
import { globalMiddleWare } from "../middlewares/globalMiddleWare";
import hasRole from "../middlewares/role.middleware";
import { PERMISSIONS } from "../middlewares/validRolePermisson";

class masterRouter {
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
      "/masterCategory/getById",
      globalMiddleWare.adminAuthenticate,
      globalMiddleWare.checkError,
      masterDataController.getByIdMasterCategory
    );
    this.router.get(
      "/masterCategory/getAll",
      globalMiddleWare.adminAuthenticate,
      globalMiddleWare.checkError,
      masterDataController.getAllMasterCategory
    );
    this.router.get(
      "/masterData/getById",
      globalMiddleWare.adminAuthenticate,
      globalMiddleWare.checkError,
      masterDataController.getByIdMasterData
    );
    this.router.get(
      "/masterData/getAll",
      globalMiddleWare.adminAuthenticate,
      globalMiddleWare.checkError,
      masterDataController.getAllMasterData
    );
    this.router.get(
      "/platform/getById",
      globalMiddleWare.adminAuthenticate,
      globalMiddleWare.checkError,
      masterDataController.getByIdPlatform
    );
    this.router.get(
      "/platform/getAll",
      globalMiddleWare.adminAuthenticate,
      globalMiddleWare.checkError,
      masterDataController.getAllPlatform
    );
  }
  postRoutes() {
    this.router.post(
      "/masterCategory/create",
      globalMiddleWare.adminAuthenticate,
      hasRole(PERMISSIONS.MASTER_CATEGORY_CREATOR),
      globalMiddleWare.checkError,
      masterDataController.createMasterCategory
    );
    this.router.post(
      "/masterData/create",
      globalMiddleWare.adminAuthenticate,
      hasRole(PERMISSIONS.MASTERDATA_CREATOR),
      globalMiddleWare.checkError,
      masterDataController.createMasterData
    );
    this.router.post(
      "/platform/create",
      globalMiddleWare.adminAuthenticate,
      hasRole(PERMISSIONS.PLATFORM_CREATOR),
      globalMiddleWare.checkError,
      masterDataController.createPlatform
    );
  }
  patchRoutes() {
    this.router.patch(
      "/masterCategory/update",
      globalMiddleWare.adminAuthenticate,
      hasRole(PERMISSIONS.MASTER_CATEGORY_CREATOR),
      globalMiddleWare.checkError,
      masterDataController.updateMasterCategory
    );
    this.router.patch(
      "/masterData/update",
      globalMiddleWare.adminAuthenticate,
      hasRole(PERMISSIONS.MASTERDATA_EDITOR),
      globalMiddleWare.checkError,
      masterDataController.updateMasterData
    );
    this.router.patch(
      "/platform/update",
      globalMiddleWare.adminAuthenticate,
      hasRole(PERMISSIONS.PLATFORM_EDITOR),
      globalMiddleWare.checkError,
      masterDataController.updatePlatformData
    );
  }
  deleteRoutes() {}
}

export default new masterRouter().router;
