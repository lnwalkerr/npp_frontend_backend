require("dotenv").config();
import * as express from "express";
import * as mongoose from "mongoose";
import * as cors from "cors";
import * as morgan from "morgan";
import helmet from "helmet";
import * as session from "express-session";
import * as path from "path";
import * as cookieParser from "cookie-parser";
import customError from "./middlewares/customError";
import masterRouter from "./routers/masterRouter";
import userRouter from "./routers/userRouter";
import adminRouter from "./routers/adminRouter";

export class Server {
  public app: express.Application = express();

  init() {
    this.setConfigurations();
    this.setRoutes();
    this.error404Handler();
    this.handleErrors();
  }

  setConfigurations() {
    this.connectMongodb();
    this.configureBodyParser();
  }

  connectMongodb() {
    const databaseUrl = process.env.DB_URL;
    mongoose
      .connect(databaseUrl, {
        maxPoolSize: 500,
        minPoolSize: 250,
        socketTimeoutMS: 60000, // how long a socket can remain idle
        serverSelectionTimeoutMS: 30000, // wait up to 30s to find a server
        waitQueueTimeoutMS: 30000,
      })
      .then(() => {
        console.log(`MongoDB: Connected ====> ${process.env.NODE_ENV}`);
      });
  }

  configureBodyParser() {
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(express.urlencoded({ limit: "1000mb", extended: true }));
    this.app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*"); // Replace '*' with your specific domain if needed.
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    });
  }

  setRoutes() {
    this.app.use("/global/health", (req, res) => {
      res.sendStatus(200);
    });

    // Set up other middlewares and routes
    this.app.use(cors());
    this.app.use(helmet());
    this.app.disable("x-powered-by");
    this.app.set("views", path.join(__dirname, "views"));
    this.app.set("view engine", "ejs");
    this.app.use(
      morgan(":method :url :status :response-time ms - :res[content-length]")
    );

    this.app.use("/api/master", masterRouter);
    this.app.use("/api/user", userRouter);
    this.app.use("/api/admin", adminRouter);
  }

  error404Handler() {
    this.app.use((req, res) => {
      res.status(404).json({
        message: "API Not Found !!!",
        status_code: 404,
      });
    });
  }

  handleErrors() {
    this.app.use((err, req, res, next) => {
      console.log("Err::", err);
      let status = 500;
      let message = "Something Went Wrong. Please Try Again";
      if (err instanceof customError) {
        message = err.message;
        status = err.status;
      }

      res.status(status).json({
        message,
        status_code: status,
      });
    });
  }
}
