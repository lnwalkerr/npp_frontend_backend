import { model } from "mongoose";
import * as mongoose from "mongoose";
import { Utils } from "../utils/utils";

const donationMasterSchema = new mongoose.Schema(
  {
    typeOfDonation: {
      type: mongoose.Types.ObjectId,
      ref: "masterData",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: Boolean, default: true },
    totalGoal : {type:Number, required: true},
    created_by: { type: mongoose.Types.ObjectId, ref: "user", required: true },
    updated_by: { type: mongoose.Types.ObjectId, ref: "user" },
    created_at: { type: Date, required: true, default: Utils.indianTimeZone },
    updated_at: { type: Date, required: true, default: Utils.indianTimeZone },
  },
  { id: true }
);

export default model("donationMaster", donationMasterSchema);