import * as mongoose from "mongoose";
import { model } from "mongoose";
import { Utils } from "../utils/utils";

const leaderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, default: 0 },
    image: {
      url: { type: String },
      docSha: { type: String },
    },
    contactInfo: {
      phone: { type: String },
      email: { type: String },
    },
    isActive: { type: Boolean, default: true },
    created_by: { type: mongoose.Types.ObjectId, ref: "user", required: true },
    updated_by: { type: mongoose.Types.ObjectId, ref: "user" },
    created_at: { type: Date, required: true, default: Utils.indianTimeZone },
    updated_at: { type: Date },
  },
  { id: true }
);

export default model("leader", leaderSchema);
