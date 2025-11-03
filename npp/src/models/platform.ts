import * as mongoose from "mongoose";
import { model } from "mongoose";
import { Utils } from "../utils/utils";

const platformSchema = new mongoose.Schema(
  {
    platformId: { type: String, required: true },
    name: { type: String, required: true },
    token: { type: String, required: true },
    softUpdate: { type: String },
    forceUpdate: { type: String },
    version: { type: String },
    data: { type: String },
    status: { type: Boolean, required: true, default: true },
    created_at: { type: Date, required: true, default: Utils.indianTimeZone },
    updated_at: { type: Date, required: true, default: Utils.indianTimeZone },
  },
  { id: false }
);

export default model("platform", platformSchema);
