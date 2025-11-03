import * as mongoose from "mongoose";
import { model } from "mongoose";
import { Utils } from "../utils/utils";

const userTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
    platformId: {
      type: mongoose.Types.ObjectId,
      ref: "platform",
      required: true,
    },
    token: { type: String, required: true },
    deviceDetail: { type: String, required: true },
    data: { type: String },
    created_at: { type: Date, required: true, default: Utils.indianTimeZone },
    updated_at: { type: Date, required: true, default: Utils.indianTimeZone },
  },
  { id: true }
);

export default model("userToken", userTokenSchema);
