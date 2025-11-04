import * as mongoose from "mongoose";
import { model } from "mongoose";
import { Utils } from "../utils/utils";

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    duration: { type: String }, // e.g., "10:30"
    views: { type: Number, default: 0 },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    created_by: { type: mongoose.Types.ObjectId, ref: "user", required: true },
    updated_by: { type: mongoose.Types.ObjectId, ref: "user" },
    created_at: { type: Date, required: true, default: Utils.indianTimeZone },
    updated_at: { type: Date },
  },
  { id: true }
);

export default model("video", videoSchema);
