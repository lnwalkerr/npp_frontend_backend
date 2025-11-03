import * as mongoose from "mongoose";
import { model } from "mongoose";
import { Utils } from "../utils/utils";

const masterDataSchema = new mongoose.Schema(
  {
    masterCategoryId: {
      type: mongoose.Types.ObjectId,
      ref: "masterCategory",
      required: true,
    },
    value: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: Boolean, default: true },
    created_by: { type: mongoose.Types.ObjectId, ref: "user", required: true },
    updated_by: { type: mongoose.Types.ObjectId, ref: "user" },
    created_at: { type: Date, required: true, default: Utils.indianTimeZone },
    updated_at: { type: Date, required: true, default: Utils.indianTimeZone },
  },
  { id: true }
);

export default model("masterData", masterDataSchema);
