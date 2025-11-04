require("dotenv").config();
import * as express from "express";
import * as mongoose from "mongoose";
import * as cors from "cors";
import * as morgan from "morgan";
import helmet from "helmet";
import * as session from "express-session";
import * as path from "path";
import * as cookieParser from "cookie-parser";
import * as swaggerJsdoc from "swagger-jsdoc";
import * as swaggerUi from "swagger-ui-express";
import customError from "./middlewares/customError";
import masterRouter from "./routers/masterRouter";
import userRouter from "./routers/userRouter";
import adminRouter from "./routers/adminRouter";
import publicRouter from "./routers/publicRouter";

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
    // Swagger configuration
    const swaggerOptions = {
      definition: {
        openapi: "3.0.0",
        info: {
          title: "JAN PARTY API",
          version: "1.0.0",
          description: "Complete API documentation for JAN PARTY backend services",
        },
        servers: [
          {
            url: "http://localhost:5001",
            description: "Development server",
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
        paths: {
          "/api/admin/login": {
            post: {
              tags: ["Admin"],
              summary: "Admin user login",
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      required: ["userId", "password", "platformName", "platformToken", "deviceDetail"],
                      properties: {
                        userId: { type: "string", description: "User phone number or username" },
                        password: { type: "string" },
                        platformName: { type: "string", example: "admin" },
                        platformToken: { type: "string", description: "Platform authentication token" },
                        deviceDetail: { type: "string", description: "Device information" }
                      }
                    }
                  }
                }
              },
              responses: {
                200: {
                  description: "Login successful",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          statusCode: { type: "integer", example: 200 },
                          token: { type: "string", description: "JWT token" },
                          message: { type: "string" },
                          data: { type: "object", description: "User data" }
                        }
                      }
                    }
                  }
                },
                400: { description: "Bad request" },
                401: { description: "Invalid credentials" },
                500: { description: "Internal server error" }
              }
            }
          },
          "/api/admin/getAll": {
            get: {
              tags: ["Admin"],
              summary: "Get all users with optional filtering",
              security: [{ bearerAuth: [] }],
              parameters: [
                { name: "userType", in: "query", schema: { type: "string" }, description: "Filter by user type ObjectId" },
                { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
                { name: "limit", in: "query", schema: { type: "integer", default: 10 }, description: "Items per page" }
              ],
              responses: {
                200: {
                  description: "Users fetched successfully",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          message: { type: "string" },
                          totalCounts: { type: "integer" },
                          data: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                firstName: { type: "string" },
                                lastName: { type: "string" },
                                phone: { type: "string" },
                                email: { type: "string" },
                                userType: { type: "object" },
                                constituency: { type: "object" },
                                registrationType: { type: "object" },
                                status: { type: "boolean" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                401: { description: "Unauthorized" },
                500: { description: "Internal server error" }
              }
            }
          },
          "/api/admin/news/getAll": {
            get: {
              tags: ["News"],
              summary: "Get all news articles with optional filtering",
              security: [{ bearerAuth: [] }],
              parameters: [
                { name: "type", in: "query", schema: { type: "string" }, description: "Filter by news type ObjectId" },
                { name: "searchText", in: "query", schema: { type: "string" }, description: "Search in title" }
              ],
              responses: {
                200: {
                  description: "News articles fetched successfully",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          message: { type: "string" },
                          data: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                type: { type: "object" },
                                title: { type: "string" },
                                description: { type: "string" },
                                viewCount: { type: "integer" },
                                created_by: { type: "object" },
                                created_at: { type: "string", format: "date-time" },
                                isActive: { type: "boolean" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                401: { description: "Unauthorized" },
                500: { description: "Internal server error" }
              }
            }
          },
          "/api/admin/donation/getAll": {
            get: {
              tags: ["Donations"],
              summary: "Get all donation campaigns",
              security: [{ bearerAuth: [] }],
              parameters: [
                { name: "typeOfDonation", in: "query", schema: { type: "string" }, description: "Filter by donation type" }
              ],
              responses: {
                200: {
                  description: "Donation campaigns fetched successfully",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          message: { type: "string" },
                          totalCounts: { type: "integer" },
                          data: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                typeOfDonation: { type: "string" },
                                title: { type: "string" },
                                description: { type: "string" },
                                totalGoal: { type: "number" },
                                status: { type: "boolean" },
                                created_by: { type: "string" },
                                created_at: { type: "string", format: "date-time" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                401: { description: "Unauthorized" },
                500: { description: "Internal server error" }
              }
            }
          },
          "/api/admin/userType/getAll": {
            get: {
              tags: ["User Types"],
              summary: "Get all user types",
              security: [{ bearerAuth: [] }],
              parameters: [
                { name: "type", in: "query", schema: { type: "string" }, description: "Filter by user type" }
              ],
              responses: {
                200: {
                  description: "User types fetched successfully",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          message: { type: "string" },
                          totalCounts: { type: "integer" },
                          data: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                type: { type: "string" },
                                title: { type: "string" },
                                description: { type: "string" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                401: { description: "Unauthorized" },
                500: { description: "Internal server error" }
              }
            }
          },
          "/master/masterData/getAll": {
            get: {
              tags: ["Master Data"],
              summary: "Get all master data",
              security: [{ bearerAuth: [] }],
              parameters: [
                { name: "code", in: "query", schema: { type: "string" }, description: "Filter by master category code" },
                { name: "value", in: "query", schema: { type: "string" }, description: "Filter by master data value" }
              ],
              responses: {
                200: {
                  description: "Master data fetched successfully",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          message: { type: "string" },
                          totalCounts: { type: "integer" },
                          data: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                masterCategoryId: { type: "string" },
                                value: { type: "string" },
                                title: { type: "string" },
                                description: { type: "string" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                401: { description: "Unauthorized" },
                500: { description: "Internal server error" }
              }
            }
          },
          "/master/masterCategory/getAll": {
            get: {
              tags: ["Master Categories"],
              summary: "Get all master categories",
              security: [{ bearerAuth: [] }],
              parameters: [
                { name: "code", in: "query", schema: { type: "string" }, description: "Filter by category code" }
              ],
              responses: {
                200: {
                  description: "Master categories fetched successfully",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          message: { type: "string" },
                          totalCounts: { type: "integer" },
                          data: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                code: { type: "string" },
                                title: { type: "string" },
                                description: { type: "string" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                401: { description: "Unauthorized" },
                500: { description: "Internal server error" }
              }
            }
          },
          "/api/admin/events/create": {
            post: {
              tags: ["Events"],
              summary: "Create a new event",
              security: [{ bearerAuth: [] }],
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      required: ["title", "description", "date"],
                      properties: {
                        title: { type: "string", description: "Event title" },
                        description: { type: "string", description: "Event description" },
                        date: { type: "string", format: "date-time", description: "Event date and time" },
                        location: { type: "string", description: "Event location" },
                        status: { type: "string", enum: ["Upcoming", "Past", "Cancelled"], default: "Upcoming" }
                      }
                    }
                  }
                }
              },
              responses: {
                200: { description: "Event created successfully" },
                400: { description: "Bad request" },
                401: { description: "Unauthorized" },
                500: { description: "Internal server error" }
              }
            }
          },
          "/api/admin/events/getAll": {
            get: {
              tags: ["Events"],
              summary: "Get all events with pagination/search",
              security: [{ bearerAuth: [] }],
              parameters: [
                { name: "searchText", in: "query", schema: { type: "string" }, description: "Search in title" },
                { name: "status", in: "query", schema: { type: "string", enum: ["Upcoming", "Past", "Cancelled"] }, description: "Filter by status" },
                { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
                { name: "limit", in: "query", schema: { type: "integer", default: 10 }, description: "Items per page" }
              ],
              responses: {
                200: {
                  description: "Events fetched successfully",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          message: { type: "string" },
                          totalCounts: { type: "integer" },
                          data: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                title: { type: "string" },
                                description: { type: "string" },
                                date: { type: "string", format: "date-time" },
                                location: { type: "string" },
                                status: { type: "string", enum: ["Upcoming", "Past", "Cancelled"] },
                                created_by: { type: "object" },
                                created_at: { type: "string", format: "date-time" },
                                isActive: { type: "boolean" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                401: { description: "Unauthorized" },
                500: { description: "Internal server error" }
              }
            }
          },
          "/api/admin/events/getById": {
            get: {
              tags: ["Events"],
              summary: "Get event by ID",
              security: [{ bearerAuth: [] }],
              parameters: [
                { name: "id", in: "query", required: true, schema: { type: "string" }, description: "Event ObjectId" }
              ],
              responses: {
                200: {
                  description: "Event fetched successfully",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          message: { type: "string" },
                          data: {
                            type: "object",
                            properties: {
                              _id: { type: "string" },
                              title: { type: "string" },
                              description: { type: "string" },
                              date: { type: "string", format: "date-time" },
                              location: { type: "string" },
                              status: { type: "string", enum: ["Upcoming", "Past", "Cancelled"] },
                              created_by: { type: "object" },
                              created_at: { type: "string", format: "date-time" },
                              isActive: { type: "boolean" }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                400: { description: "Event not found" },
                401: { description: "Unauthorized" },
                500: { description: "Internal server error" }
              }
            }
          },
          "/api/admin/events/update": {
            patch: {
              tags: ["Events"],
              summary: "Update an event",
              security: [{ bearerAuth: [] }],
              parameters: [
                { name: "id", in: "query", required: true, schema: { type: "string" }, description: "Event ObjectId" }
              ],
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        date: { type: "string", format: "date-time" },
                        location: { type: "string" },
                        status: { type: "string", enum: ["Upcoming", "Past", "Cancelled"] },
                        isActive: { type: "boolean" }
                      }
                    }
                  }
                }
              },
              responses: {
                200: { description: "Event updated successfully" },
                400: { description: "Event not found" },
                401: { description: "Unauthorized" },
                500: { description: "Internal server error" }
              }
            }
          },
          "/api/admin/events/delete": {
            delete: {
              tags: ["Events"],
              summary: "Delete an event",
              security: [{ bearerAuth: [] }],
              parameters: [
                { name: "id", in: "query", required: true, schema: { type: "string" }, description: "Event ObjectId" }
              ],
              responses: {
                200: { description: "Event deleted successfully" },
                400: { description: "Event not found" },
                401: { description: "Unauthorized" },
                500: { description: "Internal server error" }
              }
            }
          },
          "/api/admin/videos/create": {
            post: {
              tags: ["Videos"],
              summary: "Create a new video",
              security: [{ bearerAuth: [] }],
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      required: ["title", "description", "videoUrl"],
                      properties: {
                        title: { type: "string", description: "Video title" },
                        description: { type: "string", description: "Video description" },
                        videoUrl: { type: "string", description: "Video URL or embed link" },
                        thumbnailUrl: { type: "string", description: "Thumbnail image URL" },
                        duration: { type: "string", description: "Video duration (e.g., '10:30')" },
                        tags: { type: "array", items: { type: "string" }, description: "Video tags" }
                      }
                    }
                  }
                }
              },
              responses: {
                200: { description: "Video created successfully" },
                400: { description: "Bad request" },
                401: { description: "Unauthorized" },
                500: { description: "Internal server error" }
              }
            }
          },
          "/api/admin/videos/getAll": {
            get: {
              tags: ["Videos"],
              summary: "Get all videos with pagination/search",
              security: [{ bearerAuth: [] }],
              parameters: [
                { name: "searchText", in: "query", schema: { type: "string" }, description: "Search in title" },
                { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
                { name: "limit", in: "query", schema: { type: "integer", default: 10 }, description: "Items per page" }
              ],
              responses: {
                200: {
                  description: "Videos fetched successfully",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          message: { type: "string" },
                          totalCounts: { type: "integer" },
                          data: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                title: { type: "string" },
                                description: { type: "string" },
                                videoUrl: { type: "string" },
                                thumbnailUrl: { type: "string" },
                                duration: { type: "string" },
                                views: { type: "integer" },
                                tags: { type: "array", items: { type: "string" } },
                                created_by: { type: "object" },
                                created_at: { type: "string", format: "date-time" },
                                isActive: { type: "boolean" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                401: { description: "Unauthorized" },
                500: { description: "Internal server error" }
              }
            }
          },
          "/api/admin/videos/getById": {
            get: {
              tags: ["Videos"],
              summary: "Get video by ID",
              security: [{ bearerAuth: [] }],
              parameters: [
                { name: "id", in: "query", required: true, schema: { type: "string" }, description: "Video ObjectId" }
              ],
              responses: {
                200: {
                  description: "Video fetched successfully",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          message: { type: "string" },
                          data: {
                            type: "object",
                            properties: {
                              _id: { type: "string" },
                              title: { type: "string" },
                              description: { type: "string" },
                              videoUrl: { type: "string" },
                              thumbnailUrl: { type: "string" },
                              duration: { type: "string" },
                              views: { type: "integer" },
                              tags: { type: "array", items: { type: "string" } },
                              created_by: { type: "object" },
                              created_at: { type: "string", format: "date-time" },
                              isActive: { type: "boolean" }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                400: { description: "Video not found" },
                401: { description: "Unauthorized" },
                500: { description: "Internal server error" }
              }
            }
          },
          "/api/admin/videos/update": {
            patch: {
              tags: ["Videos"],
              summary: "Update a video",
              security: [{ bearerAuth: [] }],
              parameters: [
                { name: "id", in: "query", required: true, schema: { type: "string" }, description: "Video ObjectId" }
              ],
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        videoUrl: { type: "string" },
                        thumbnailUrl: { type: "string" },
                        duration: { type: "string" },
                        tags: { type: "array", items: { type: "string" } },
                        isActive: { type: "boolean" }
                      }
                    }
                  }
                }
              },
              responses: {
                200: { description: "Video updated successfully" },
                400: { description: "Video not found" },
                401: { description: "Unauthorized" },
                500: { description: "Internal server error" }
              }
            }
          },
              "/api/admin/videos/delete": {
                delete: {
                  tags: ["Videos"],
                  summary: "Delete a video",
                  security: [{ bearerAuth: [] }],
                  parameters: [
                    { name: "id", in: "query", required: true, schema: { type: "string" }, description: "Video ObjectId" }
                  ],
                  responses: {
                    200: { description: "Video deleted successfully" },
                    400: { description: "Video not found" },
                    401: { description: "Unauthorized" },
                    500: { description: "Internal server error" }
                  }
                }
              },
              "/api/admin/leaders/create": {
                post: {
                  tags: ["Leaders"],
                  summary: "Create a new leader",
                  security: [{ bearerAuth: [] }],
                  requestBody: {
                    required: true,
                    content: {
                      "application/json": {
                        schema: {
                          type: "object",
                          required: ["name", "position", "description"],
                          properties: {
                            name: { type: "string", description: "Leader's full name" },
                            position: { type: "string", description: "Leader's position/role" },
                            description: { type: "string", description: "Leader's description/bio" },
                            order: { type: "integer", description: "Display order" },
                            contactInfo: {
                              type: "object",
                              properties: {
                                phone: { type: "string" },
                                email: { type: "string" }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  responses: {
                    200: { description: "Leader created successfully" },
                    400: { description: "Bad request" },
                    401: { description: "Unauthorized" },
                    500: { description: "Internal server error" }
                  }
                }
              },
              "/api/admin/leaders/getAll": {
                get: {
                  tags: ["Leaders"],
                  summary: "Get all leaders with pagination/search",
                  security: [{ bearerAuth: [] }],
                  parameters: [
                    { name: "searchText", in: "query", schema: { type: "string" }, description: "Search in name or position" },
                    { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
                    { name: "limit", in: "query", schema: { type: "integer", default: 10 }, description: "Items per page" }
                  ],
                  responses: {
                    200: {
                      description: "Leaders fetched successfully",
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            properties: {
                              message: { type: "string" },
                              totalCounts: { type: "integer" },
                              data: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    _id: { type: "string" },
                                    name: { type: "string" },
                                    position: { type: "string" },
                                    description: { type: "string" },
                                    order: { type: "integer" },
                                    contactInfo: {
                                      type: "object",
                                      properties: {
                                        phone: { type: "string" },
                                        email: { type: "string" }
                                      }
                                    },
                                    created_by: { type: "object" },
                                    created_at: { type: "string", format: "date-time" },
                                    isActive: { type: "boolean" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    401: { description: "Unauthorized" },
                    500: { description: "Internal server error" }
                  }
                }
              },
              "/api/admin/leaders/getById": {
                get: {
                  tags: ["Leaders"],
                  summary: "Get leader by ID",
                  security: [{ bearerAuth: [] }],
                  parameters: [
                    { name: "id", in: "query", required: true, schema: { type: "string" }, description: "Leader ObjectId" }
                  ],
                  responses: {
                    200: {
                      description: "Leader fetched successfully",
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            properties: {
                              message: { type: "string" },
                              data: {
                                type: "object",
                                properties: {
                                  _id: { type: "string" },
                                  name: { type: "string" },
                                  position: { type: "string" },
                                  description: { type: "string" },
                                  order: { type: "integer" },
                                  contactInfo: {
                                    type: "object",
                                    properties: {
                                      phone: { type: "string" },
                                      email: { type: "string" }
                                    }
                                  },
                                  created_by: { type: "object" },
                                  created_at: { type: "string", format: "date-time" },
                                  isActive: { type: "boolean" }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    400: { description: "Leader not found" },
                    401: { description: "Unauthorized" },
                    500: { description: "Internal server error" }
                  }
                }
              },
              "/api/admin/leaders/update": {
                patch: {
                  tags: ["Leaders"],
                  summary: "Update a leader",
                  security: [{ bearerAuth: [] }],
                  parameters: [
                    { name: "id", in: "query", required: true, schema: { type: "string" }, description: "Leader ObjectId" }
                  ],
                  requestBody: {
                    required: true,
                    content: {
                      "application/json": {
                        schema: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            position: { type: "string" },
                            description: { type: "string" },
                            order: { type: "integer" },
                            contactInfo: {
                              type: "object",
                              properties: {
                                phone: { type: "string" },
                                email: { type: "string" }
                              }
                            },
                            isActive: { type: "boolean" }
                          }
                        }
                      }
                    }
                  },
                  responses: {
                    200: { description: "Leader updated successfully" },
                    400: { description: "Leader not found" },
                    401: { description: "Unauthorized" },
                    500: { description: "Internal server error" }
                  }
                }
              },
              "/api/admin/leaders/delete": {
                delete: {
                  tags: ["Leaders"],
                  summary: "Delete a leader",
                  security: [{ bearerAuth: [] }],
                  parameters: [
                    { name: "id", in: "query", required: true, schema: { type: "string" }, description: "Leader ObjectId" }
                  ],
                  responses: {
                    200: { description: "Leader deleted successfully" },
                    400: { description: "Leader not found" },
                    401: { description: "Unauthorized" },
                    500: { description: "Internal server error" }
                  }
                }
              }
        }
      },
      apis: [
        "./src/controllers/publicController.ts" // Include public controller for automatic swagger docs
      ]
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);

    // Swagger UI
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
    this.app.use("/api/public", publicRouter);
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
