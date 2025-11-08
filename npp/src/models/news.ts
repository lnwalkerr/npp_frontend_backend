import * as mongoose from "mongoose";
import { model } from "mongoose";
import { Utils } from "../utils/utils";

const newsSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, //healthCare education 
    title: { type: String, required: true },
    description: { type: String },
    viewCount: { type: Number,default:0 },
    attachment: {
      url: { type: String },
      docSha: { type: String },
    },
    iconImage: {
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

export default model("news", newsSchema);
