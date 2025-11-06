import { Router } from "express";
import PublicController from "../controllers/publicController";

class PublicRouter {
  public router: Router;
  constructor() {
    this.router = Router();
    this.getRoutes();
  }

  getRoutes() {
    // Public content API - no authentication required
    this.router.get("/content", PublicController.getCombinedContent);
  }
}

export default new PublicRouter().router;


