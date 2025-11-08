import * as mongoose from "mongoose";
import { Utils } from "../utils/utils";

const joinRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
    constituency: {
      type: mongoose.Types.ObjectId,
      ref: "masterData",
      required: false,
    },
    registrationType: {
      type: mongoose.Types.ObjectId,
      ref: "masterData",
      required: false,
    },
    remarks: { type: String },
    experience: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
      created_at: {
      type: Date,
      required: true,
      default: () => Utils.indianTimeZone(),
    },
    updated_at: { type: Date },
  },
  { id: false }
);

export default mongoose.model("joinRequest", joinRequestSchema);
