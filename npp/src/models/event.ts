import * as mongoose from "mongoose";
import { model } from "mongoose";
import { Utils } from "../utils/utils";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String },
    status: {
      type: String,
      enum: ["Upcoming", "Past", "Cancelled"],
      default: "Upcoming"
    },
    image: {
      url: { type: String },
      docSha: { type: String },
    },
    isActive: { type: Boolean, default: true },
    created_by: { type: mongoose.Types.ObjectId, ref: "user", required: true },
    updated_by: { type: mongoose.Types.ObjectId, ref: "user" },
    created_at: { type: Date, required: true, default: Utils.indianTimeZone },
    updated_at: { type: Date },
  },
  { id: true }
);

export default model("event", eventSchema);
